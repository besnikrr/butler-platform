import { S3, StepFunctions } from "aws-sdk";
import { StepFunctionStatus, uuidv4 } from "@butlerhospitality/shared";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { logger } from "../logger";

const s3Client = new S3Client({ apiVersion: "2006-03-01", region: process.env.REGION });

const s3 = new S3({ apiVersion: "2006-03-01" });
const stepFunctions = new StepFunctions({ region: "us-east-1" });
const IMAGE_ORIGIN_BASEPATH = "image/original";

export const NewUploadService = () => {
  const uploadimage = async (
    bucket: string, key?: string
  ) => {
    const imagekey = key || uuidv4();
    const originalkey = `${IMAGE_ORIGIN_BASEPATH}/${imagekey}`;
    const imageUploadResponse = await stepFunctions.startSyncExecution({
      stateMachineArn: process.env.SAVE_IMAGE_SF,
      input: JSON.stringify({
        key: imagekey,
        bucket,
        originalkey
      })
    }).promise();
    return (
      imageUploadResponse.status === StepFunctionStatus.SUCCESS &&
      JSON.parse(imageUploadResponse.output).isValid
    ) ? imagekey : null;
  };

  const getPresignedURL = async (
    bucket: string, existingKey?: string
  ) => {
    const imagekey = existingKey || uuidv4();
    const key = `${IMAGE_ORIGIN_BASEPATH}/${imagekey}`;
    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: key
    });
    // Create the presigned URL.
    try {
      const signedUrl = await getSignedUrl(s3Client, command, {
        expiresIn: 3600
      });

      return [signedUrl, imagekey];
    } catch (err) {
      logger.log("error-presign-url-util: ", err);
    }
    return [null, null];
  };

  return {
    uploadimage,
    getPresignedURL
  };
};
