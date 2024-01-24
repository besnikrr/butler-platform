"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyToken = void 0;
const tslib_1 = require("tslib");
const jwt = require("jsonwebtoken");
const logger_1 = require("libs/service-sdk/logger");
const toPem = require("jwk-to-pem");
const verifyToken = (token, tenant) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    const decoded = jwt.decode(token, { complete: true });
    const jwk = yield loadJwk(tenant.awsDefaultRegion, tenant.cognito.poolId, (decoded === null || decoded === void 0 ? void 0 : decoded.header.kid) || "", tenant.jwks);
    if (!jwk) {
        throw "No jwk found";
    }
    const pem = toPem(jwk);
    return new Promise((resolve, reject) => {
        jwt.verify(token, pem, { algorithms: [jwk.alg] }, (err, decoded) => {
            if (err) {
                return reject(err);
            }
            return resolve(decoded);
        });
    });
});
exports.verifyToken = verifyToken;
const loadJwk = (region, userPoolId, kid, jwks) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    if (!jwks) {
        throw "JWKs missing";
    }
    logger_1.logger.log(region, userPoolId);
    return findJwk(jwks, kid);
});
const findJwk = (jwkResponse, kidInput) => {
    var _a;
    return (_a = jwkResponse === null || jwkResponse === void 0 ? void 0 : jwkResponse.keys) === null || _a === void 0 ? void 0 : _a.find((key) => {
        return key.kid === kidInput;
    });
};
//# sourceMappingURL=verify-token.js.map