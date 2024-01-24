"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TwilioClient = void 0;
const tslib_1 = require("tslib");
const shared_1 = require("@butlerhospitality/shared");
const twilio_1 = require("twilio");
const logger_1 = require("../logger");
const TwilioClient = (accountSid, authToken, twilioTestAvailableNumber, twilioSMSUrl) => {
    let client = null;
    if (!client) {
        client = new twilio_1.Twilio(accountSid, authToken);
    }
    const provisionPhoneNumber = (input) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
        if (!client) {
            throw new Error("Twilio client not initiated");
        }
        const { name, coordinates, voiceUrl } = input;
        if (process.env.STAGE !== shared_1.STAGE.prod) {
            return yield createTestNumber();
        }
        const availableNumberDetails = yield client.availablePhoneNumbers("US").local.list({
            nearLatLong: coordinates,
            limit: 1
        });
        if ((availableNumberDetails === null || availableNumberDetails === void 0 ? void 0 : availableNumberDetails.length) < 1) {
            throw new Error("Could not find any suitable number");
        }
        const availableNumber = availableNumberDetails[0].phoneNumber;
        const phoneNumberDetails = yield client.incomingPhoneNumbers.create({
            phoneNumber: availableNumber,
            friendlyName: name
        });
        yield updateSmsUrl(phoneNumberDetails, voiceUrl);
        return phoneNumberDetails;
    });
    const createTestNumber = () => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
        // provision phone number - only for testing purpose
        try {
            return yield client.incomingPhoneNumbers.create({
                phoneNumber: twilioTestAvailableNumber
            });
        }
        catch (e) {
            logger_1.logger.log(e);
            throw new Error("Could not create phone number");
        }
    });
    const updateSmsUrl = (incomingNumber, voiceUrl) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
        // Due to how Kustomer works, we need to update the associated sms url so that SMS can be executed properly
        try {
            yield client.incomingPhoneNumbers(incomingNumber.sid).update({
                smsUrl: twilioSMSUrl,
                smsMethod: "POST",
                voiceUrl: voiceUrl,
                voiceMethod: "POST"
            });
        }
        catch (e) {
            logger_1.logger.log(e);
            throw new Error("Update sms url failed");
        }
    });
    return {
        client,
        provisionPhoneNumber
    };
};
exports.TwilioClient = TwilioClient;
//# sourceMappingURL=twilio.js.map