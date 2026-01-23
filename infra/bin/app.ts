#!/usr/bin/env node
import * as cdk from "aws-cdk-lib";
import { EcomdemoStaticSiteStack } from "../lib/ecomdemo-static-site-stack";
import { EcomdemoCatalogStack } from "../lib/ecomdemo-catalog-stack";

const app = new cdk.App();

const stage = app.node.tryGetContext("stage") || "dev";

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

new EcomdemoCatalogStack(app, "EcomdemoCatalogStack", {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  },
  stage,
  catalogCategoriesTableName: "EcomdemoStaticSiteStack-CatalogCategories",
  catalogProductsTableName: "EcomdemoStaticSiteStack-CatalogProducts",
});
