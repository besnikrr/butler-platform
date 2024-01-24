"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateRequestHeaders = void 0;
const tslib_1 = require("tslib");
const logger_1 = require("libs/service-sdk/logger");
const validateRequestHeaders = (event) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    logger_1.logger.log("headers: ", event.headers);
    const requiredHeaders = {
        Origin: event.headers.referer || event.headers.Referer ||
            event.headers.Authority || event.headers.authority || event.headers.Origin || event.headers.origin,
        Authorization: event.headers.Authorization || event.headers.authorization,
        Host: event.headers.Host || event.headers.host
    };
    const missingHeaders = Object.keys(requiredHeaders).filter((key) => {
        const header = requiredHeaders[key];
        return header === undefined || header === null;
    });
    if (missingHeaders && missingHeaders.length) {
        let msg = "";
        missingHeaders.forEach((header) => {
            msg += `Missing header [${header}]\n`;
        });
        throw new Error(msg);
    }
});
exports.validateRequestHeaders = validateRequestHeaders;
//# sourceMappingURL=validate-request-headers.js.map