import { SNSClient } from '@aws-sdk/client-sns'

// SNS SMS must be sent through us-east-1 regardless of the Lambda's deployment region
export const sns = new SNSClient({
  region: 'us-east-1',
})
