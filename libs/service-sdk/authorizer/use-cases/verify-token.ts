import * as jwt from "jsonwebtoken";
import { logger } from "libs/service-sdk/logger";

const toPem = require("jwk-to-pem");

export const verifyToken = async (token: string, tenant: any) => {
  const decoded = jwt.decode(token, { complete: true });
  const jwk = await loadJwk(
    tenant.awsDefaultRegion,
    tenant.cognito.poolId,
    decoded?.header.kid || "",
    tenant.jwks
  );

  if (!jwk) {
    throw "No jwk found";
  }
  const pem = toPem(jwk);
  return new Promise((resolve, reject) => {
    jwt.verify(
      token,
      pem,
      { algorithms: [jwk.alg] },
      (err: any, decoded: any) => {
        if (err) {
          return reject(err);
        }
        return resolve(decoded);
      }
    );
  });
};

const loadJwk = async (
  region: string,
  userPoolId: string,
  kid: string,
  jwks: any
) => {
  if (!jwks) {
    throw "JWKs missing";
  }
  logger.log(region, userPoolId);
  return findJwk(jwks, kid);
};

const findJwk = (
  jwkResponse: { keys: Array<{ kid: string }> },
  kidInput: string
): any => {
  return jwkResponse?.keys?.find((key) => {
    return key.kid === kidInput;
  });
};
