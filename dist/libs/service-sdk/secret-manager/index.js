"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SecretManagerService = void 0;
const tslib_1 = require("tslib");
const aws_sdk_1 = require("aws-sdk");
const logger_1 = require("../logger");
const smClient = new aws_sdk_1.SecretsManager({ region: process.env.REGION });
const SecretManagerService = () => {
    const getSecretValue = (SecretId) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
        let secretValue = null;
        try {
            secretValue = yield smClient.getSecretValue({ SecretId }).promise();
        }
        catch (e) {
            logger_1.logger.log(e);
            throw new Error("Could not retrieve the secret value");
        }
        try {
            return JSON.parse(secretValue === null || secretValue === void 0 ? void 0 : secretValue.SecretString);
        }
        catch (e) {
            logger_1.logger.log(e);
            throw new Error("Error parsing the secret string");
        }
    });
    return {
        getSecretValue
    };
};
exports.SecretManagerService = SecretManagerService;
//# sourceMappingURL=index.js.map