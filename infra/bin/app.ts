#!/usr/bin/env node
import * as cdk from "aws-cdk-lib";
import { EcomdemoStaticSiteStack } from "../lib/ecomdemo-static-site-stack";

const app = new cdk.App();

const domainName =
  app.node.tryGetContext("domainName") ||
  process.env.SITE_DOMAIN_NAME ||
  "shop.mikesdemos.com";

const hostedZoneDomain =
  app.node.tryGetContext("hostedZoneDomain") ||
  process.env.HOSTED_ZONE_DOMAIN ||
  "mikesdemos.com";

new EcomdemoStaticSiteStack(app, "EcomdemoStaticSiteStack", {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  },
  domainName,
  hostedZoneDomain,
});
