import * as cdk from 'aws-cdk-lib'
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb'
import { Construct } from 'constructs'

export class StorageStack extends cdk.Stack {
  public readonly otpTable: dynamodb.Table

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props)

    this.otpTable = new dynamodb.Table(this, 'OtpTable', {
      tableName:           'dev_otp_codes',
      partitionKey:        { name: 'pk', type: dynamodb.AttributeType.STRING },
      timeToLiveAttribute: 'ttl',
      billingMode:         dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy:       cdk.RemovalPolicy.DESTROY,
    })

    new cdk.CfnOutput(this, 'OtpTableName', { value: this.otpTable.tableName })
  }
}
