import { Certificate } from "@aws-cdk/aws-certificatemanager";
import {
    AllowedMethods,
    CacheCookieBehavior,
    CacheHeaderBehavior,
    CachePolicy,
    CacheQueryStringBehavior,
    Distribution,
    HttpVersion,
    OriginAccessIdentity,
    PriceClass,
    ViewerProtocolPolicy,
} from "@aws-cdk/aws-cloudfront";
import { S3Origin } from "@aws-cdk/aws-cloudfront-origins";
import {
    BlockPublicAccess,
    Bucket,
    BucketAccessControl,
    BucketEncryption,
} from "@aws-cdk/aws-s3";
import { StringParameter } from "@aws-cdk/aws-ssm";
import * as cdk from "@aws-cdk/core";
import { CfnParameter } from "@aws-cdk/core";

export class DashboardStack extends cdk.Stack {
    constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        var environmentNameParameter = new CfnParameter(
            this,
            "EnvironmentName",
            {
                type: "String",
                default: "development",
            }
        );
        // The code that defines your stack goes here
        var webhostingBucket = new Bucket(this, "DashboardWebhostingBucket", {
            accessControl: BucketAccessControl.PRIVATE,
            enforceSSL: true,
            publicReadAccess: false,
            blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
            encryption: BucketEncryption.S3_MANAGED,
        });

        var certificate = Certificate.fromCertificateArn(
            this,
            "Certificate",
            StringParameter.valueForStringParameter(
                this,
                "DashboardCertificateArn"
            )
        );

        var cloudFrontOriginAccessIdentity = new OriginAccessIdentity(
            this,
            "DashboardAccessIdentity",
            {
                comment:
                    "The identity that will be used by cloudfront to access our webhosting bucket",
            }
        );
        webhostingBucket.grantRead(cloudFrontOriginAccessIdentity);

        var cloudFrontDistribution = new Distribution(
            this,
            "DashboardCloudFrontDistribution",
            {
                enabled: true,
                priceClass: PriceClass.PRICE_CLASS_100,
                comment:
                    "The dashboard cloudfront distribution which will serve the dashboard version one to our users",
                httpVersion: HttpVersion.HTTP2,
                certificate: certificate,
                errorResponses: [
                    {
                        httpStatus: 404,
                        responseHttpStatus: 200,
                        responsePagePath: "/index.html",
                    },
                    {
                        httpStatus: 403,
                        responseHttpStatus: 200,
                        responsePagePath: "/index.html",
                    },
                ],
                domainNames: [
                    environmentNameParameter.valueAsString?.toLowerCase() ==
                        "development"
                        ? "clouddebug.givtapp.net"
                        : "cloud.givtapp.net",
                ],
                defaultBehavior: {
                    allowedMethods: AllowedMethods.ALLOW_GET_HEAD,
                    compress: true,
                    viewerProtocolPolicy:
                        ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
                    cachePolicy: new CachePolicy(this, "DashboardCachePolicy", {
                        queryStringBehavior: CacheQueryStringBehavior.all(),
                        cookieBehavior: CacheCookieBehavior.all(),
                        headerBehavior: CacheHeaderBehavior.allowList(
                            "Access-Control-Request-Headers",
                            "Access-Control-Request-Method",
                            "Origin"
                        ),
                        enableAcceptEncodingBrotli: true,
                        enableAcceptEncodingGzip: true,
                    }),
                    origin: new S3Origin(webhostingBucket, {
                        originAccessIdentity: cloudFrontOriginAccessIdentity,
                    }),
                },
            }
        );
    }
}
