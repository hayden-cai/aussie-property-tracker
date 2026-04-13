import 'source-map-support/register'
import * as cdk from 'aws-cdk-lib'
import { StorageStack } from '../lib/storage-stack'
import { AuthStack }    from '../lib/auth-stack'

const app = new cdk.App()

const env = {
  account: process.env.CDK_DEFAULT_ACCOUNT,
  region:  'ap-southeast-2',
}

const storage = new StorageStack(app, 'StorageStack', { env })
new AuthStack(app, 'AuthStack', { env, otpTable: storage.otpTable })
