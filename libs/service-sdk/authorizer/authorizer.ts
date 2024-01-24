import * as AWS from "aws-sdk";
import { generatePolicyDocument, getDenyPolicy, getTenant, getUser, verifyToken } from "./use-cases";

import { validateRequestHeaders } from "./validators/validate-request-headers";
import { validateLocal } from "./validators/validate-local";

import { IPolicyObject } from "./types";

import { logger } from "../logger";

const warmupkey = "serverless-plugin-warmup";
const dynamoDB = new AWS.DynamoDB.DocumentClient(
  process.env.STAGE === "local" ? {
    region: "localhost",
    endpoint: "http://0.0.0.0:8000"
  } : {}
);

const getOrigin = (event: any) => {
  const origin = event.headers.referer || event.headers.Referer || event.headers.authority || event.headers.Authority || event.headers.Origin || event.headers.origin;
  if (origin) {
    const spl = origin.split(".");
    if (spl && spl.length) {
      const protomatch = /^(https?):\/\//;
      return spl[0].replace(protomatch, "");
    }
  }
};

const mutateUserPermissionsToArray = (user: any) => {
  user.permissions = user.permissions.map((perm: any) => perm.name);
};

const handler = async (event: any) => {
  let tenant: any = null;
  try {
    await validateRequestHeaders(event);
    const origin = getOrigin(event);
    tenant = await getTenant(dynamoDB, origin);
  } catch (err) {
    logger.log("[load-tenant-error]: ", err);
    return getDenyPolicy();
  }
  let payload: any = null;
  try {
    payload = await verifyToken(event.headers.Authorization || event.headers.authorization, tenant);
  } catch (err) {
    logger.log("[verify-token-error]: ", err);
    return getDenyPolicy();
  }

  if (!payload) {
    return getDenyPolicy();
  }
  let user: any = { permissions: [] };
  try {
    user = await getUser(payload.username);
  } catch (e) {
    logger.log("[get-user-error]: ", e);
    return getDenyPolicy();
  }

  const localDenyPolicy = await validateLocal(user.permissions, {
    uri: event.path,
    action: event.requestContext.httpMethod
  });
  logger.log("localdeny: ", localDenyPolicy);

  const policyDocument: IPolicyObject = await generatePolicyDocument(user.permissions);
  mutateUserPermissionsToArray(user);

  policyDocument.context = {
    tenant: JSON.stringify(tenant),
    user: JSON.stringify(user)
  };
  return policyDocument;
};

export {
  handler,
  getOrigin
};
