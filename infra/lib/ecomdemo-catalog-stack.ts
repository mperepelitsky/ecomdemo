import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as apigwv2 from "aws-cdk-lib/aws-apigatewayv2";
import * as integrations from "aws-cdk-lib/aws-apigatewayv2-integrations";
import * as logs from "aws-cdk-lib/aws-logs";

export interface EcomdemoCatalogStackProps extends cdk.StackProps {
  stage: string;
  catalogCategoriesTableName: string;
  catalogProductsTableName: string;
}

export class EcomdemoCatalogStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: EcomdemoCatalogStackProps) {
    super(scope, id, props);

    /*
      CLI verification:
      aws dynamodb describe-table --table-name <name> --region <region>
    */

    // ✅ Reference existing tables (no replacement, no name conflicts)
    const categoriesTable = dynamodb.Table.fromTableName(
      this,
      "CatalogCategoriesTable",
      props.catalogCategoriesTableName,
    );

    const productsTable = dynamodb.Table.fromTableName(
      this,
      "CatalogProductsTable",
      props.catalogProductsTableName,
    );

    // S3 import bucket (new)
    const importBucket = new s3.Bucket(this, "CatalogImportBucket", {
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      encryption: s3.BucketEncryption.S3_MANAGED,
      lifecycleRules: [{ expiration: cdk.Duration.days(14) }],
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true, // demo-safe
    });

    // Example Lambda (you’ll replace with real handlers)
    const getCategoriesFn = new lambda.Function(this, "GetCategoriesFn", {
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: "index.handler",
      code: lambda.Code.fromInline(`
        exports.handler = async () => ({ statusCode: 200, body: JSON.stringify({ ok: true }) });
      `),
      environment: {
        CATEGORIES_TABLE: categoriesTable.tableName,
      },
      logRetention: logs.RetentionDays.ONE_WEEK,
    });

    // Permissions
    categoriesTable.grantReadData(getCategoriesFn);
    productsTable.grantReadData(getCategoriesFn); // adjust later

    // HTTP API
    const api = new apigwv2.HttpApi(this, "CatalogHttpApi", {
      apiName: `${props.stage}-ecomdemo-catalog-api`,
      corsPreflight: {
        allowHeaders: ["content-type", "x-admin-key"],
        allowMethods: [
          apigwv2.CorsHttpMethod.GET,
          apigwv2.CorsHttpMethod.POST,
          apigwv2.CorsHttpMethod.OPTIONS,
        ],
        allowOrigins: ["*"], // lock down later
      },
    });

    api.addRoutes({
      path: "/categories",
      methods: [apigwv2.HttpMethod.GET],
      integration: new integrations.HttpLambdaIntegration(
        "GetCategoriesIntegration",
        getCategoriesFn,
      ),
    });

    new cdk.CfnOutput(this, "CatalogCategoriesTableName", {
      value: categoriesTable.tableName,
    });

    new cdk.CfnOutput(this, "CatalogProductsTableName", {
      value: productsTable.tableName,
    });

    new cdk.CfnOutput(this, "CatalogApiBaseUrl", {
      value: api.apiEndpoint,
    });

    new cdk.CfnOutput(this, "CatalogImportBucketName", {
      value: importBucket.bucketName,
    });
  }
}
