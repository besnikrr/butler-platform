"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOrigin = exports.handler = void 0;
const tslib_1 = require("tslib");
const AWS = require("aws-sdk");
const use_cases_1 = require("./use-cases");
const validate_request_headers_1 = require("./validators/validate-request-headers");
const validate_local_1 = require("./validators/validate-local");
const logger_1 = require("../logger");
const warmupkey = "serverless-plugin-warmup";
const dynamoDB = new AWS.DynamoDB.DocumentClient(process.env.STAGE === "local" ? {
    region: "localhost",
    endpoint: "http://0.0.0.0:8000"
} : {});
const getOrigin = (event) => {
    const origin = event.headers.referer || event.headers.Referer || event.headers.authority || event.headers.Authority || event.headers.Origin || event.headers.origin;
    if (origin) {
        const spl = origin.split(".");
        if (spl && spl.length) {
            const protomatch = /^(https?):\/\//;
            return spl[0].replace(protomatch, "");
        }
    }
};
exports.getOrigin = getOrigin;
const mutateUserPermissionsToArray = (user) => {
    user.permissions = user.permissions.map((perm) => perm.name);
};
const handler = (event) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    let tenant = null;
    try {
        yield validate_request_headers_1.validateRequestHeaders(event);
        const origin = getOrigin(event);
        tenant = yield use_cases_1.getTenant(dynamoDB, origin);
    }
    catch (err) {
        logger_1.logger.log("[load-tenant-error]: ", err);
        return use_cases_1.getDenyPolicy();
    }
    let payload = null;
    try {
        payload = yield use_cases_1.verifyToken(event.headers.Authorization || event.headers.authorization, tenant);
    }
    catch (err) {
        logger_1.logger.log("[verify-token-error]: ", err);
        return use_cases_1.getDenyPolicy();
    }
    if (!payload) {
        return use_cases_1.getDenyPolicy();
    }
    let user = { permissions: [] };
    try {
        user = yield use_cases_1.getUser(payload.username);
    }
    catch (e) {
        logger_1.logger.log("[get-user-error]: ", e);
        return use_cases_1.getDenyPolicy();
    }
    const localDenyPolicy = yield validate_local_1.validateLocal(user.permissions, {
        uri: event.path,
        action: event.requestContext.httpMethod
    });
    logger_1.logger.log("localdeny: ", localDenyPolicy);
    const policyDocument = yield use_cases_1.generatePolicyDocument(user.permissions);
    mutateUserPermissionsToArray(user);
    policyDocument.context = {
        tenant: JSON.stringify(tenant),
        user: JSON.stringify(user)
    };
    return policyDocument;
});
exports.handler = handler;
//# sourceMappingURL=authorizer.js.map