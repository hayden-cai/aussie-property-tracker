import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { GetCommand, UpdateCommand, DeleteCommand } from '@aws-sdk/lib-dynamodb'
import * as bcrypt from 'bcryptjs'
import * as jwt from 'jsonwebtoken'
import { ddb } from '../../shared/dynamodb'
import { ok, error } from '../../shared/response'

interface OTPRecord {
  pk:           string
  otpHash:      string
  createdAt:    string
  attemptCount: number
  ttl:          number
}

export async function handler(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  // 1. Parse body
  if (!event.body) {
    return error(400, 'Phone and code are required')
  }
  let phone: string | undefined
  let code: string | undefined
  try {
    const parsed = JSON.parse(event.body) as Record<string, unknown>
    phone = typeof parsed.phone === 'string' ? parsed.phone : undefined
    code  = typeof parsed.code  === 'string' ? parsed.code  : undefined
  } catch {
    return error(400, 'Phone and code are required')
  }
  if (!phone || !code) {
    return error(400, 'Phone and code are required')
  }
  if (!/^\d{6}$/.test(code)) {
    return error(400, 'Code must be 6 digits')
  }

  // 2. Build primary key
  const pk = 'phone#' + phone

  // 3. Fetch record from DynamoDB
  let record: OTPRecord | undefined
  try {
    const result = await ddb.send(new GetCommand({
      TableName: process.env.OTP_TABLE,
      Key: { pk },
    }))
    record = result.Item as OTPRecord | undefined
  } catch (dbErr) {
    console.error('DynamoDB GetCommand failed:', dbErr)
    return error(500, 'Verification failed')
  }
  if (!record) {
    return error(400, 'OTP expired or not found. Please request a new code.')
  }

  // 4. Check attempt limit
  if (record.attemptCount >= 5) {
    await ddb.send(new DeleteCommand({
      TableName: process.env.OTP_TABLE,
      Key: { pk },
    })).catch((e: unknown) => console.error('DeleteCommand failed:', e))
    return error(400, 'Too many attempts. Please request a new code.')
  }

  // 5. Compare code
  const isValid = await bcrypt.compare(code, record.otpHash)

  // 6. Invalid code — increment attempt count
  if (!isValid) {
    await ddb.send(new UpdateCommand({
      TableName: process.env.OTP_TABLE,
      Key: { pk },
      UpdateExpression: 'SET attemptCount = attemptCount + :inc',
      ExpressionAttributeValues: { ':inc': 1 },
    })).catch((e: unknown) => console.error('UpdateCommand failed:', e))
    const remaining = 5 - (record.attemptCount + 1)
    return error(400, 'Invalid code. ' + remaining + ' attempts remaining.')
  }

  // 7. Valid — delete record and issue JWT
  await ddb.send(new DeleteCommand({
    TableName: process.env.OTP_TABLE,
    Key: { pk },
  })).catch(e => console.error('DeleteCommand failed:', e))

  const userId = 'user#' + phone.replace(/\D/g, '')
  const token = jwt.sign(
    { userId, phone },
    process.env.JWT_SECRET!,
    { expiresIn: '30d' }
  )

  return ok({ token })
}
