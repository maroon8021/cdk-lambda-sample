import { APIGatewayEvent, Context } from "aws-lambda";
import * as awsServerlessExpress from "aws-serverless-express";
import { createApp } from "./app";

const app = createApp();

// https://github.com/awslabs/aws-serverless-express/blob/master/examples/basic-starter/lambda.js
const binaryMimeTypes = [
  "application/javascript",
  "application/json",
  "application/octet-stream",
  "application/xml",
  "font/eot",
  "font/opentype",
  "font/otf",
  "image/jpeg",
  "image/png",
  "image/svg+xml",
  "text/comma-separated-values",
  "text/css",
  "text/html",
  "text/javascript",
  "text/plain",
  "text/text",
  "text/xml",
];

const server = awsServerlessExpress.createServer(
  app,
  undefined,
  binaryMimeTypes
);

export const handler = (event: APIGatewayEvent, context: Context) => {
  console.log("in handler");
  console.log(event);
  console.log(context);
  return awsServerlessExpress.proxy(server, event, context);
};
