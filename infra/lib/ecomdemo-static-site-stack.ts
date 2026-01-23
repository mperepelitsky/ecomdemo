import * as cdk from "aws-cdk-lib";
import * as acm from "aws-cdk-lib/aws-certificatemanager";
import * as cloudfront from "aws-cdk-lib/aws-cloudfront";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import * as iam from "aws-cdk-lib/aws-iam";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as logs from "aws-cdk-lib/aws-logs";
import * as route53 from "aws-cdk-lib/aws-route53";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as s3deploy from "aws-cdk-lib/aws-s3-deployment";
import * as path from "path";
import { Construct } from "constructs";

interface EcomdemoStaticSiteStackProps extends cdk.StackProps {
  domainName: string;
  hostedZoneDomain: string;
}

export class EcomdemoStaticSiteStack extends cdk.Stack {
  constructor(
    scope: Construct,
    id: string,
    props: EcomdemoStaticSiteStackProps,
  ) {
    super(scope, id, props);

    const stage = props.stackName ?? this.stackName;

    const hostedZone = route53.HostedZone.fromLookup(this, "HostedZone", {
      domainName: props.hostedZoneDomain,
    });

    const certificate = new acm.DnsValidatedCertificate(
      this,
      "SiteCertificate",
      {
        domainName: props.domainName,
        hostedZone,
        region: "us-east-1",
      },
    );

    const siteBucket = new s3.Bucket(this, "SiteBucket", {
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      enforceSSL: true,
      versioned: false,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
    });

    // ✅ Upload static site content into the bucket
    // Expects your repo root to contain a folder named "site" with index.html + js/ + Assets/
    new s3deploy.BucketDeployment(this, "DeployWebsite", {
      destinationBucket: siteBucket,
      sources: [
        s3deploy.Source.asset(path.join(__dirname, "..", "..", "site")),
      ],
      prune: true,
    });

    const originAccessControl = new cloudfront.CfnOriginAccessControl(
      this,
      "SiteOac",
      {
        originAccessControlConfig: {
          name: `${id}-oac`,
          originAccessControlOriginType: "s3",
          signingBehavior: "always",
          signingProtocol: "sigv4",
        },
      },
    );

    const distribution = new cloudfront.CfnDistribution(
      this,
      "SiteDistribution",
      {
        distributionConfig: {
          enabled: true,
          defaultRootObject: "index.html",
          aliases: [props.domainName],
          origins: [
            {
              id: "SiteBucketOrigin",
              domainName: siteBucket.bucketRegionalDomainName,
              originAccessControlId: originAccessControl.attrId,
              s3OriginConfig: {},
            },
          ],
          defaultCacheBehavior: {
            targetOriginId: "SiteBucketOrigin",
            viewerProtocolPolicy: "redirect-to-https",
            allowedMethods: ["GET", "HEAD", "OPTIONS"],
            cachedMethods: ["GET", "HEAD", "OPTIONS"],
            compress: true,
            forwardedValues: {
              queryString: false,
              cookies: { forward: "none" },
            },
          },
          viewerCertificate: {
            acmCertificateArn: certificate.certificateArn,
            sslSupportMethod: "sni-only",
            minimumProtocolVersion: "TLSv1.2_2021",
          },
        },
      },
    );

    // Allow CloudFront (via OAC) to read objects from bucket
    siteBucket.addToResourcePolicy(
      new iam.PolicyStatement({
        actions: ["s3:GetObject"],
        resources: [siteBucket.arnForObjects("*")],
        principals: [new iam.ServicePrincipal("cloudfront.amazonaws.com")],
        conditions: {
          StringEquals: {
            "AWS:SourceArn": `arn:aws:cloudfront::${cdk.Aws.ACCOUNT_ID}:distribution/${distribution.ref}`,
          },
        },
      }),
    );

    new route53.CfnRecordSet(this, "SiteAliasRecordA", {
      hostedZoneId: hostedZone.hostedZoneId,
      name: props.domainName,
      type: "A",
      aliasTarget: {
        dnsName: distribution.attrDomainName,
        hostedZoneId: "Z2FDTNDATAQYW2",
        evaluateTargetHealth: false,
      },
    });

    new route53.CfnRecordSet(this, "SiteAliasRecordAAAA", {
      hostedZoneId: hostedZone.hostedZoneId,
      name: props.domainName,
      type: "AAAA",
      aliasTarget: {
        dnsName: distribution.attrDomainName,
        hostedZoneId: "Z2FDTNDATAQYW2",
        evaluateTargetHealth: false,
      },
    });

    new cdk.CfnOutput(this, "SiteBucketName", {
      value: siteBucket.bucketName,
    });

    new cdk.CfnOutput(this, "CloudFrontDistributionId", {
      value: distribution.ref,
    });

    new cdk.CfnOutput(this, "CloudFrontDomainName", {
      value: distribution.attrDomainName,
    });

    new cdk.CfnOutput(this, "SiteUrl", {
      value: `https://${props.domainName}`,
    });

    const catalogCategoriesTable = new dynamodb.Table(
      this,
      "CatalogCategories",
      {
        tableName: `${stage}-CatalogCategories`,
        partitionKey: {
          name: "categoryId",
          type: dynamodb.AttributeType.STRING,
        },
        billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
        pointInTimeRecovery: false,
        removalPolicy: cdk.RemovalPolicy.DESTROY,
      },
    );

    const catalogProductsTable = new dynamodb.Table(this, "CatalogProducts", {
      tableName: `${stage}-CatalogProducts`,
      partitionKey: { name: "productId", type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      pointInTimeRecovery: false,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    const withLogRetention = (idSuffix: string) =>
      new lambda.Function(this, `ExampleLambda${idSuffix}`, {
        runtime: lambda.Runtime.NODEJS_20_X,
        handler: "index.handler",
        code: lambda.Code.fromInline(
          "exports.handler = async () => ({ statusCode: 200, body: 'ok' });",
        ),
        logRetention: logs.RetentionDays.ONE_WEEK,
      });

    withLogRetention("Demo");

    new cdk.CfnOutput(this, "CatalogCategoriesTableName", {
      value: catalogCategoriesTable.tableName,
    });

    new cdk.CfnOutput(this, "CatalogProductsTableName", {
      value: catalogProductsTable.tableName,
    });
  }
}
