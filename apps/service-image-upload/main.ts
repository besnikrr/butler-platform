import { S3 } from "aws-sdk";
import * as sharp from "sharp";
const s3 = new S3({ apiVersion: "2006-03-01" });
// import {warmupkey} from '@butlerhospitality/shared';
const warmupkey = "serverless-plugin-warmup";
const IMAGE_DIR = "image"; // should be shared
const WEBP_DEFAULT_QUALITY = 100;

const successResponse = { isValid: true };
const failureResponse = { isValid: false };

const saveImage = async (state) => {
  if (state.source === warmupkey) {
    console.log("WarmUP - Lambda is warm!");
    return;
  }
  const {
    width, height,
    bucket, key,
    originalkey
  } = state;

  const imagebuffer = await s3.getObject({
    Bucket: bucket,
    Key: originalkey
  }).promise();

  console.log(
    {
      bucket,
      originalkey,
      imagebuffer
    }
  );

  const body: Buffer = imagebuffer.Body as Buffer;
  const resizedbuffer = await sharp(body)
    .resize(width, height, {
      fit: "contain"
    })
    .toFormat("webp", {
      quality: WEBP_DEFAULT_QUALITY
    })
    .toBuffer();

  const response = await s3.putObject({
    Body: resizedbuffer,
    Bucket: bucket,
    Key: `${IMAGE_DIR}/${width}x${height}/${key}`,
    ContentType: "image/webp"
  }).promise();
  return (response.ETag) ? successResponse : failureResponse;
};

const checker = (arr) => arr.every((v) => v.isValid === true);

const imageSaveSuccess = async (states) => {
  if (states.source === warmupkey) {
    console.log("WarmUP - Lambda is warm!");
    return;
  }
  console.log("customSuccess: ", states);
  return { isValid: checker(states) };
};

const imageSaveError = async (states) => {
  if (states.source === warmupkey) {
    console.log("WarmUP - Lambda is warm!");
    return;
  }
  console.log("customError: ", states);
  return { isValid: checker(states) };
};

module.exports.saveImage = saveImage;
module.exports.imageSaveSuccess = imageSaveSuccess;
module.exports.imageSaveError = imageSaveError;
