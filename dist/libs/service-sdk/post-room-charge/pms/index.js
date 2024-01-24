"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PMSProvider = void 0;
const tslib_1 = require("tslib");
const axios_1 = require("axios");
const logger_1 = require("../../logger");
const PMS_URLS = {
    local: process.env.PMS_URL_LOCAL,
    dev: process.env.PMS_URL_DEV,
    qa: process.env.PMS_URL_QA,
    prod: process.env.PMS_URL_PROD
};
const getPMSUrl = (stage) => {
    return PMS_URLS[stage];
};
const sendToPMS = (data) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    if (process.env.STAGE === "test" || process.env.NODE_ENV === "test") {
        return "Success";
    }
    const pmsUrl = getPMSUrl(process.env.STAGE);
    return axios_1.default.post(pmsUrl, data);
});
const PMSProvider = () => {
    const post = (data) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
        try {
            yield sendToPMS(data);
            logger_1.logger.log("Pms post room charge finished successfully", data);
        }
        catch (e) {
            logger_1.logger.log("[PMS-post-room-charge]: ", e.message);
        }
    });
    return {
        post
    };
};
exports.PMSProvider = PMSProvider;
//# sourceMappingURL=index.js.map