#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "@aws-cdk/core";
import { Lambda } from "../lib/lambda";
import { CONFIG } from "../lib/config";
const app = new cdk.App();
new Lambda(app, "ToolStack", { env: CONFIG });
