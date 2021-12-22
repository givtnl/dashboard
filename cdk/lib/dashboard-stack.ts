import * as cdk from 'aws-cdk-lib';
import { Duration } from 'aws-cdk-lib';
import { ICertificate, Certificate } from 'aws-cdk-lib/aws-certificatemanager';
import { ICachePolicy, CachePolicy, CacheQueryStringBehavior, CacheCookieBehavior, CacheHeaderBehavior, OriginAccessIdentity, Distribution, PriceClass, HttpVersion, LambdaEdgeEventType, ViewerProtocolPolicy, ResponseHeadersPolicy } from 'aws-cdk-lib/aws-cloudfront';
import { S3Origin } from 'aws-cdk-lib/aws-cloudfront-origins';
import { CacheControl } from 'aws-cdk-lib/aws-codepipeline-actions';
import { Bucket, BucketAccessControl, BlockPublicAccess, BucketEncryption } from 'aws-cdk-lib/aws-s3';
import { BucketDeployment, Source, StorageClass } from 'aws-cdk-lib/aws-s3-deployment';
import { StringParameter } from 'aws-cdk-lib/aws-ssm';
import { Construct } from 'constructs';

export class DashboardStack extends cdk.Stack {

    public certificate: ICertificate;
    public cachePolicy: ICachePolicy;

    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        var environmentName = process.env?.EnvironmentName ?? 'development';
        var isProduction = environmentName.toLowerCase() == "production";

        this.certificate = Certificate.fromCertificateArn(
            this,
            "Certificate",
            StringParameter.valueForStringParameter(
                this,
                "DashboardCertificateArn"
            )
        );
        this.cachePolicy = new CachePolicy(this, "DashboardCachePolicy", {
            queryStringBehavior: CacheQueryStringBehavior.all(),
            cookieBehavior: CacheCookieBehavior.all(),
            comment: 'Default Cache policy for the dashboard',
            headerBehavior: CacheHeaderBehavior.allowList(
                "Access-Control-Request-Headers",
                "Access-Control-Request-Method",
                "Origin"
            ),
            enableAcceptEncodingBrotli: true,
            enableAcceptEncodingGzip: true,
        });
        this.deploy(isProduction ? 'cloud.givtapp.net' : 'clouddebug.givtapp.net', environmentName, '../dist');
    }

    private deploy(domainName: string, environmentName: string, folderToDeploy: string): void {
        // The code that defines your stack goes here
        var webhostingBucket = new Bucket(this, `DashboardWebhostingBucket${environmentName}`, {
            accessControl: BucketAccessControl.PRIVATE,
            enforceSSL: true,
            publicReadAccess: false,
            blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
            encryption: BucketEncryption.S3_MANAGED,
        });

        var cloudFrontOriginAccessIdentity = new OriginAccessIdentity(
            this,
            `DashboardAccessIdentity${environmentName}`,
            {
                comment:
                    "The identity that will be used by cloudfront to access our webhosting bucket",
            }
        );

        webhostingBucket.grantRead(cloudFrontOriginAccessIdentity);

        var cloudFrontDistribution = new Distribution(
            this,
            `DashboardCloudFrontDistribution${environmentName}`,
            {
                enabled: true,
                priceClass: PriceClass.PRICE_CLASS_100,
                comment:
                    "The dashboard cloudfront distribution which will serve the dashboard version one to our users",
                httpVersion: HttpVersion.HTTP2,
                certificate: this.certificate,
                defaultRootObject: 'index.html',
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
                domainNames: [domainName],
                defaultBehavior: {
                    responseHeadersPolicy: ResponseHeadersPolicy.CORS_ALLOW_ALL_ORIGINS_WITH_PREFLIGHT_AND_SECURITY_HEADERS,
                    compress: true,
                    viewerProtocolPolicy:
                        ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
                    cachePolicy: this.cachePolicy,
                    origin: new S3Origin(webhostingBucket, {
                        originAccessIdentity: cloudFrontOriginAccessIdentity,
                    }),
                },
            }
        );

        new BucketDeployment(this, `StaticWebsiteDeployment${environmentName}${new Date().getTime()}`, {
            cacheControl: [CacheControl.maxAge(Duration.days(31))],
            destinationBucket: webhostingBucket,
            storageClass: StorageClass.ONEZONE_IA,
            prune: false,
            distribution: cloudFrontDistribution,
            sources: [
                Source.asset(folderToDeploy),
                Source.asset('../public')
            ]
        });

        new BucketDeployment(this, `AppStaticWebsiteDeployment${environmentName}${new Date().getTime()}`, {
            cacheControl: [CacheControl.maxAge(Duration.days(31))],
            destinationBucket: webhostingBucket,
            storageClass: StorageClass.ONEZONE_IA,
            contentDisposition: 'inline',
            contentType: 'application/json',
            prune: false,
            distribution: cloudFrontDistribution,
            sources: [
                Source.asset('../apple-app-site')
            ]
        });
    }
}
