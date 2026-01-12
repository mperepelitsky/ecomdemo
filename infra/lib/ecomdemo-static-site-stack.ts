import * as cdk from "aws-cdk-lib";
import * as acm from "aws-cdk-lib/aws-certificatemanager";
import * as cloudfront from "aws-cdk-lib/aws-cloudfront";
import * as iam from "aws-cdk-lib/aws-iam";
import * as route53 from "aws-cdk-lib/aws-route53";
import * as s3 from "aws-cdk-lib/aws-s3";
import { Construct } from "constructs";

interface EcomdemoStaticSiteStackProps extends cdk.StackProps {
  domainName: string;
  hostedZoneDomain: string;
}

export class EcomdemoStaticSiteStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: EcomdemoStaticSiteStackProps) {
    super(scope, id, props);

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
      }
    );

    const siteBucket = new s3.Bucket(this, "SiteBucket", {
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      enforceSSL: true,
      versioned: false,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
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
      }
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
      }
    );

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
      })
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
  }
}
