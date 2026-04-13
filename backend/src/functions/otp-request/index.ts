import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { PutCommand } from '@aws-sdk/lib-dynamodb'
import { PublishCommand } from '@aws-sdk/client-sns'
import * as bcrypt from 'bcryptjs'
import { ddb } from '../../shared/dynamodb'
import { sns } from '../../shared/sns'
import { ok, error } from '../../shared/response'

function normalisePhone(raw: string): string | null {
  const digits = raw.replace(/\D/g, '')
  let normalised: string
  if (raw.startsWith('+61')) {
    normalised = raw
  } else if (digits.startsWith('61')) {
    normalised = '+' + digits
  } else if (digits.startsWith('0')) {
    normalised = '+61' + digits.slice(1)
  } else {
    normalised = '+61' + digits
  }
  return /^\+61\d{9}$/.test(normalised) ? normalised : null
}

export async function handler(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  // 1. Parse body
  if (!event.body) {
    return error(400, 'Phone number is required')
  }
  let phone: string | undefined
  try {
    const parsed = JSON.parse(event.body) as Record<string, unknown>
    phone = typeof parsed.phone === 'string' ? parsed.phone : undefined
  } catch {
    return error(400, 'Phone number is required')
  }
  if (!phone) {
    return error(400, 'Phone number is required')
  }

  // 2. Normalise + validate
  const normalised = normalisePhone(phone)
  if (!normalised) {
    return error(400, 'Invalid Australian phone number')
  }

  // 3. Generate OTP
  const code = Math.floor(100000 + Math.random() * 900000).toString()
  console.log('[DEV] OTP for ' + normalised + ': ' + code)

  // 4. Hash
  const hash = await bcrypt.hash(code, 10)

  // 5. Store in DynamoDB
  try {
    await ddb.send(new PutCommand({
      TableName: process.env.OTP_TABLE,
      Item: {
        pk:           'phone#' + normalised,
        otpHash:      hash,
        createdAt:    new Date().toISOString(),
        attemptCount: 0,
        ttl:          Math.floor(Date.now() / 1000) + 300,
      },
    }))
  } catch (err) {
    console.error('DynamoDB PutCommand failed:', err)
    return error(500, 'Failed to store OTP')
  }

  // 6. Send SMS
  if (process.env.SNS_SANDBOX === 'true') {
    console.log('[DEV] Would send SMS: ' + code)
  } else {
    try {
      await sns.send(new PublishCommand({
        PhoneNumber: normalised,
        Message: 'Your Aussie Property Tracker code is: ' + code + '. Expires in 5 minutes.',
        MessageAttributes: {
          'AWS.SNS.SMS.SMSType': {
            DataType: 'String',
            StringValue: 'Transactional',
          },
        },
      }))
    } catch (snsErr) {
      console.error('SNS PublishCommand failed:', snsErr)
    }
  }

  // 7. Return success
  return ok({ message: 'OTP sent successfully' })
}
