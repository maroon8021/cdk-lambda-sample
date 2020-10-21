import * as cdk from "@aws-cdk/core";
import { AssetCode, Function, Runtime } from "@aws-cdk/aws-lambda";
import {
  RestApi,
  LambdaIntegration,
  IResource,
  PassthroughBehavior,
  MockIntegration,
  Cors,
  ContentHandling,
  EndpointType,
  DomainName,
} from "@aws-cdk/aws-apigateway";
import {
  Certificate,
  DnsValidatedCertificate,
  ValidationMethod,
} from "@aws-cdk/aws-certificatemanager";
import { ARecord, HostedZone, RecordTarget } from "@aws-cdk/aws-route53";
import { ApiGatewayDomain } from "@aws-cdk/aws-route53-targets";
import {
  Role,
  IRole,
  ServicePrincipal,
  PolicyStatement,
  ManagedPolicy,
} from "@aws-cdk/aws-iam";

import { APIG, CONFIG } from "./config";
import { BundlingDockerImage, Duration } from "@aws-cdk/core";
const { CERTIFICATE_AUTHORITY_ARN } = CONFIG;

// usr/bin には yum がない
const command: string[] = [
  //"bash -c /var/lib/yum -v",
  "bash",
  "-c",
  `
  echo ----- && 
  echo $PATH && 
  echo ----- && 
  cd / &&  
  cp -rf ./asset-input/* ./asset-output && 
  cp -rf ./bin/make ./asset-output &&
  cp -rf ./bin/openssl ./asset-output &&
  cp -rf ./bin/jq ./asset-output && 
  ls /asset-output`,

  // find ./ -name "*aws*" &&
  // cp -rf ./usr/local/aws-cli ./asset-output &&
  // find ./ -name "*aws*" &&
  // ./usr/local/aws-cli/v2/2.0.57/bin/aws --version &&

  // sh ./asset-output/install.sh &&

  // yum-3.4.3-167.el7.centos.noarch.rpm
  //"curl --help && cd /bin && ls ./",
  //ls ./ &&",
  //"curl --help",
  //["yum update -y", "yum install make jq"].join(" && "),
];

export class Lambda extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const executionLambdaRole = new Role(this, "LambdaRole", {
      roleName: "lambdaOperationToolExecutionRole",
      assumedBy: new ServicePrincipal("lambda.amazonaws.com"),
      managedPolicies: [
        ManagedPolicy.fromAwsManagedPolicyName(
          "service-role/AWSLambdaBasicExecutionRole"
        ),
        ManagedPolicy.fromAwsManagedPolicyName(
          "AWSCertificateManagerPrivateCAFullAccess"
        ),
      ],
    });

    // const executionLambdaRole = new Role(this, "LambdaRole", {
    //   roleName: "lambdaOperationToolExecutionRole",
    //   assumedBy: new ServicePrincipal("lambda.amazonaws.com"),
    // });
    // executionLambdaRole.addToPolicy(
    //   new PolicyStatement({
    //     resources: ["*"],
    //     actions: ["lambda:InvokeFunction"],
    //   })
    // );

    const toolFunction = new Function(this, "toolFunction", {
      code: AssetCode.fromAsset("../functions/"),
      handler: "dist/handler.handler",
      runtime: Runtime.NODEJS_12_X,
      environment: {
        NODE_ENV: "development",
        USE_PLAYGROUND: "false",
      },
    });

    const playgroundFunction = new Function(this, "playgroundFunction", {
      code: AssetCode.fromAsset("../functions/", {
        bundling: {
          image: BundlingDockerImage.fromAsset("../functions"),
          command,
          user: "root",
        },
      }),
      handler: "dist/handler.handler",
      timeout: Duration.seconds(300),
      runtime: Runtime.NODEJS_12_X,
      environment: {
        NODE_ENV: "development",
        USE_PLAYGROUND: "true",
        CERTIFICATE_AUTHORITY_ARN,
      },
      //@ts-ignore
      role: executionLambdaRole,
    });
    // .addToRolePolicy(
    //   new PolicyStatement({
    //     resources: ["*"],
    //     actions: ["acm-pca:*"],
    //   })
    // );

    const defaultCorsPreflightOptions = {
      allowOrigins: Cors.ALL_ORIGINS,
      //allowMethods: Cors.ALL_METHODS, //["GET", "POST", "OPTIONS"] ALL_METHODSはdefaultぽい
      statusCode: 200,
      allowHeaders: ["content-type"],
      allowCredentials: true,
    };
    const defaultMethodOptions = {
      requestParameters: { "method.request.path.proxy": true },
    };

    const integrationResponses = [
      {
        statusCode: "200",
        responseParameters: {
          "method.response.header.Access-Control-Allow-Headers":
            "'Origin,Content-Type,Authorization'",
          "method.response.header.Access-Control-Allow-Origin": "'*'",
          "method.response.header.Access-Control-Allow-Methods":
            "'OPTIONS,GET,PUT,POST,DELETE'",
        },
        contentHandling: ContentHandling.CONVERT_TO_BINARY,
        responseTemplates: {
          "application/json": "$input.json('$')",
        },
      },
    ];

    const methodResponses = [
      {
        statusCode: "200",
        responseParameters: {
          "method.response.header.Access-Control-Allow-Headers": true,
          "method.response.header.Access-Control-Allow-Methods": true,
          "method.response.header.Access-Control-Allow-Credentials": true,
          "method.response.header.Access-Control-Allow-Origin": true,
        },
      },
    ];

    const toolApi = new RestApi(this, "tool api", {
      restApiName: "Tool API",
      defaultCorsPreflightOptions,
      endpointTypes: [EndpointType.REGIONAL],
      //defaultMethodOptions,
    });

    const playgroundApi = new RestApi(this, "playground api", {
      restApiName: "Playground API",
      defaultCorsPreflightOptions,
      //defaultMethodOptions,
    });

    const toolIntegration = new LambdaIntegration(toolFunction);

    // const toolIntegration = new LambdaIntegration(toolFunction, {
    //   integrationResponses,
    //   passthroughBehavior: PassthroughBehavior.WHEN_NO_MATCH,
    //   requestTemplates: {
    //     "application/json": JSON.stringify({
    //       usePlayground: false,
    //       path: "$context.path",
    //       httpMethod: "$context.httpMethod",
    //     }),
    //   },
    //   proxy: false,
    // });

    const playgroundIntegration = new LambdaIntegration(playgroundFunction, {
      //contentHandling: ContentHandling.CONVERT_TO_BINARY,
    });

    // const playgroundIntegration = new LambdaIntegration(playgroundFunction, {
    //   integrationResponses,
    // });

    toolApi.root.addMethod("ANY", toolIntegration);
    const toolResource = toolApi.root.addResource("{proxy+}");
    //addCorsOptions(toolApi.root);
    //addCorsOptions(toolResource);

    const playgroundResource = playgroundApi.root.addResource("{proxy+}");
    playgroundResource.addMethod("ANY", playgroundIntegration, {
      //methodResponses,
    });
    //addCorsOptions(playgroundResource);

    // const zone = HostedZone.fromHostedZoneAttributes(this, "mitsuna", {
    //   hostedZoneId: APIG.HOSTED_ZONE_ID,
    //   zoneName: "ap-northeast-1",
    // });

    const hostedZone = HostedZone.fromLookup(this, "mitsuna", {
      domainName: "mitsuna.dev",
    });

    const certificate = new DnsValidatedCertificate(this, "Certificate", {
      domainName: APIG.DOMAIN_NAME_PLAYGROUND,
      hostedZone,
      validationMethod: ValidationMethod.DNS,
    });

    const playgroundDomain = new DomainName(this, "CustomDomain", {
      domainName: APIG.DOMAIN_NAME_PLAYGROUND,
      certificate: certificate, //Certificate.fromCertificateArn(
      //   this,
      //   "Certificate",
      //   APIG.CERTIFICATE_ARN
      // ),
      endpointType: EndpointType.REGIONAL,
      mapping: playgroundApi,
    });

    new ARecord(this, "SampleARecod", {
      zone: hostedZone,
      recordName: APIG.DOMAIN_NAME_PLAYGROUND,
      target: RecordTarget.fromAlias(new ApiGatewayDomain(playgroundDomain)),
    });
  }
}
