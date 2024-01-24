"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NewUploadService = void 0;
const tslib_1 = require("tslib");
const aws_sdk_1 = require("aws-sdk");
const shared_1 = require("@butlerhospitality/shared");
const client_s3_1 = require("@aws-sdk/client-s3");
const s3_request_presigner_1 = require("@aws-sdk/s3-request-presigner");
const logger_1 = require("../logger");
const s3Client = new client_s3_1.S3Client({ apiVersion: "2006-03-01", region: process.env.REGION });
const s3 = new aws_sdk_1.S3({ apiVersion: "2006-03-01" });
const stepFunctions = new aws_sdk_1.StepFunctions({ region: "us-east-1" });
const IMAGE_ORIGIN_BASEPATH = "image/original";
const NewUploadService = () => {
    const uploadimage = (bucket, key) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
        const imagekey = key || shared_1.uuidv4();
        const originalkey = `${IMAGE_ORIGIN_BASEPATH}/${imagekey}`;
        const imageUploadResponse = yield stepFunctions.startSyncExecution({
            stateMachineArn: process.env.SAVE_IMAGE_SF,
            input: JSON.stringify({
                key: imagekey,
                bucket,
                originalkey
            })
        }).promise();
        return (imageUploadResponse.status === shared_1.StepFunctionStatus.SUCCESS &&
            JSON.parse(imageUploadResponse.output).isValid) ? imagekey : null;
    });
    const getPresignedURL = (bucket, existingKey) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
        const imagekey = existingKey || shared_1.uuidv4();
        const key = `${IMAGE_ORIGIN_BASEPATH}/${imagekey}`;
        const command = new client_s3_1.PutObjectCommand({
            Bucket: bucket,
            Key: key
        });
        // Create the presigned URL.
        try {
            const signedUrl = yield s3_request_presigner_1.getSignedUrl(s3Client, command, {
                expiresIn: 3600
            });
            return [signedUrl, imagekey];
        }
        catch (err) {
            logger_1.logger.log("error-presign-url-util: ", err);
        }
        return [null, null];
    });
    return {
        uploadimage,
        getPresignedURL
    };
};
exports.NewUploadService = NewUploadService;
//# sourceMappingURL=image.js.map