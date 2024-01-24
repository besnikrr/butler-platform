"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.communicationClient = exports.CommunicationClient = void 0;
const tslib_1 = require("tslib");
const twilio_1 = require("./twilio");
const secret_manager_1 = require("../secret-manager");
var CommunicationClient;
(function (CommunicationClient) {
    CommunicationClient[CommunicationClient["TWILIO"] = 0] = "TWILIO";
})(CommunicationClient = exports.CommunicationClient || (exports.CommunicationClient = {}));
const communicationClient = (client) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    switch (client) {
        case CommunicationClient.TWILIO: {
            const SecretId = `${process.env.STAGE == "local" ? "dev" : process.env.STAGE}/twilio`;
            const secretValues = yield secret_manager_1.SecretManagerService().getSecretValue(SecretId);
            const { TWILIO_ACCOUNT_SID: twilioAccountId, TWILIO_AUTH_TOKEN: twilioAuthToken, TWILIO_TEST_AVAILABLE_NUMBER: twilioTestAvailableNumber, TWILIO_SMS_URL: twilioSMSUrl } = secretValues;
            if (twilioAccountId && twilioAuthToken) {
                return twilio_1.TwilioClient(twilioAccountId, twilioAuthToken, twilioTestAvailableNumber, twilioSMSUrl);
            }
            throw new Error("TWILIO_ACCOUNT_SID or TWILIO_AUTH_TOKEN env variables must be set");
        }
        default:
            throw new Error(`Communication client ${client} not supported`);
    }
});
exports.communicationClient = communicationClient;
//# sourceMappingURL=index.js.map