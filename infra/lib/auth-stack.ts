import * as cdk from "aws-cdk-lib";
import * as lambda from "aws-cdk-lib/aws-lambda-nodejs";
import * as apigw from "aws-cdk-lib/aws-apigateway";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import * as iam from "aws-cdk-lib/aws-iam";
import { Construct } from "constructs";
import { Runtime } from "aws-cdk-lib/aws-lambda";

interface Props extends cdk.StackProps {
  otpTable: dynamodb.Table;
}

export class AuthStack extends cdk.Stack {
  public readonly apiUrl: string;

  constructor(scope: Construct, id: string, props: Props) {
    super(scope, id, props);

    const jwtSecret = process.env.JWT_SECRET ?? "change-this-before-prod";

    // Lambda 1 — sends OTP via SNS
    const otpRequestFn = new lambda.NodejsFunction(this, "OtpRequestFn", {
      entry: "../backend/src/functions/otp-request/index.ts",
      handler: "handler",
      runtime: Runtime.NODEJS_20_X,
      timeout: cdk.Duration.seconds(30),
      bundling: { forceDockerBundling: false },
      environment: {
        OTP_TABLE: props.otpTable.tableName,
      },
    });
    props.otpTable.grantReadWriteData(otpRequestFn);
    otpRequestFn.addToRolePolicy(
      new iam.PolicyStatement({
        actions: ["sns:Publish"],
        resources: ["*"],
      }),
    );

    // Lambda 2 — verifies OTP and issues JWT
    const otpVerifyFn = new lambda.NodejsFunction(this, "OtpVerifyFn", {
      entry: "../backend/src/functions/otp-verify/index.ts",
      handler: "handler",
      runtime: Runtime.NODEJS_20_X,
      timeout: cdk.Duration.seconds(30),
      bundling: { forceDockerBundling: false },
      environment: {
        OTP_TABLE: props.otpTable.tableName,
        JWT_SECRET: jwtSecret,
      },
    });
    props.otpTable.grantReadWriteData(otpVerifyFn);

    // REST API Gateway with CORS
    const api = new apigw.RestApi(this, "AuthApi", {
      restApiName: "aussie-tracker-auth",
      defaultCorsPreflightOptions: {
        allowOrigins: apigw.Cors.ALL_ORIGINS,
        allowMethods: apigw.Cors.ALL_METHODS,
      },
    });

    const auth = api.root.addResource("auth");
    auth
      .addResource("request-otp")
      .addMethod("POST", new apigw.LambdaIntegration(otpRequestFn));
    auth
      .addResource("verify-otp")
      .addMethod("POST", new apigw.LambdaIntegration(otpVerifyFn));

    this.apiUrl = api.url;
    new cdk.CfnOutput(this, "ApiUrl", { value: api.url });
  }
}
