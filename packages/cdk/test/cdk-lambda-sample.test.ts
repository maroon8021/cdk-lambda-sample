import {
  expect as expectCDK,
  matchTemplate,
  MatchStyle,
} from "@aws-cdk/assert";
import * as cdk from "@aws-cdk/core";
import * as CdkLambdaSample from "../lib/lambda";

test("Empty Stack", () => {
  const app = new cdk.App();
  // WHEN
  const stack = new CdkLambdaSample.CdkLambdaSampleStack(app, "MyTestStack");
  // THEN
  expectCDK(stack).to(
    matchTemplate(
      {
        Resources: {},
      },
      MatchStyle.EXACT
    )
  );
});
