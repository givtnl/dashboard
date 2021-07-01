import { Certificate, ICertificate } from "@aws-cdk/aws-certificatemanager";
import {
    CacheCookieBehavior,
    CacheHeaderBehavior,
    CachePolicy,
    CacheQueryStringBehavior,
    Distribution,
    HttpVersion,
    ICachePolicy,
    LambdaEdgeEventType,
    OriginAccessIdentity,
    PriceClass,
    ViewerProtocolPolicy,
} from "@aws-cdk/aws-cloudfront";
import { S3Origin } from "@aws-cdk/aws-cloudfront-origins";
import { EdgeFunction } from "@aws-cdk/aws-cloudfront/lib/experimental";
import { Code, Runtime } from "@aws-cdk/aws-lambda";
import {
    BlockPublicAccess,
    Bucket,
    BucketAccessControl,
    BucketEncryption,
} from "@aws-cdk/aws-s3";
import { BucketDeployment, CacheControl, Source, StorageClass } from '@aws-cdk/aws-s3-deployment'
import { StringParameter } from "@aws-cdk/aws-ssm";
import * as cdk from "@aws-cdk/core";
import { Duration } from "@aws-cdk/core";

export class DashboardStack extends cdk.Stack {

    public certificate: ICertificate;
    public cachePolicy: ICachePolicy;
    public securityHeadersFunction: EdgeFunction;

    constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
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
        this.securityHeadersFunction = new EdgeFunction(this, 'MyFunction', {
            runtime: Runtime.NODEJS_12_X,
            handler: 'index.handler',
            functionName:`add-security-headers-function-${environmentName}`,
            description:'Adds security headers to the responses from S3',
            code: Code.fromAsset('./lambdas/add-security-headers-lambda')
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
                    edgeLambdas: [{
                        eventType: LambdaEdgeEventType.ORIGIN_RESPONSE,
                        functionVersion: this.securityHeadersFunction.currentVersion
                    }],
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

        new BucketDeployment(this, new Date().getTime().toString(), {
            cacheControl: [CacheControl.maxAge(Duration.days(31))],
            destinationBucket: webhostingBucket,
            storageClass: StorageClass.ONEZONE_IA,
            distribution: cloudFrontDistribution,
            sources: [Source.asset(folderToDeploy)]
        });
    }
}
