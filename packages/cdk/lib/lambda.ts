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
} from "@aws-cdk/aws-apigateway";

export class Lambda extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

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
      code: AssetCode.fromAsset("../functions/"),
      handler: "dist/handler.handler",
      runtime: Runtime.NODEJS_12_X,
      environment: {
        NODE_ENV: "development",
        USE_PLAYGROUND: "true",
      },
    });

    const defaultCorsPreflightOptions = {
      allowOrigins: Cors.ALL_ORIGINS,
      //allowMethods: Cors.ALL_METHODS, //["GET", "POST", "OPTIONS"] ALL_METHODSはdefaultぽい
      statusCode: 200,
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

    //const playgroundIntegration = new LambdaIntegration(playgroundFunction);

    const playgroundIntegration = new LambdaIntegration(playgroundFunction, {
      integrationResponses,
    });

    toolApi.root.addMethod("ANY", toolIntegration);
    const toolResource = toolApi.root.addResource("{proxy+}");
    //addCorsOptions(toolApi.root);
    //addCorsOptions(toolResource);

    const playgroundResource = playgroundApi.root.addResource("{proxy+}");
    playgroundResource.addMethod("ANY", playgroundIntegration, {
      methodResponses,
    });
    //addCorsOptions(playgroundResource);
  }
}

export function addCorsOptions(apiResource: IResource) {
  apiResource.addMethod(
    "ANY",
    new MockIntegration({
      integrationResponses: [
        {
          statusCode: "200",
          responseParameters: {
            "method.response.header.Access-Control-Allow-Headers":
              "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,X-Amz-User-Agent'",
            "method.response.header.Access-Control-Allow-Origin": "'*'",
            "method.response.header.Access-Control-Allow-Credentials":
              "'false'",
            "method.response.header.Access-Control-Allow-Methods":
              "'OPTIONS,GET,PUT,POST,DELETE'",
          },
        },
      ],
      passthroughBehavior: PassthroughBehavior.NEVER,
      requestTemplates: {
        "application/json": JSON.stringify({ statusCode: 200 }),
      },
    }),
    {
      methodResponses: [
        {
          statusCode: "200",
          responseParameters: {
            "method.response.header.Access-Control-Allow-Headers": true,
            "method.response.header.Access-Control-Allow-Methods": true,
            "method.response.header.Access-Control-Allow-Credentials": true,
            "method.response.header.Access-Control-Allow-Origin": true,
          },
        },
      ],
    }
  );
}
