"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ForgotPassword = void 0;
const tslib_1 = require("tslib");
const shared_1 = require("@butlerhospitality/shared");
const ForgotPassword = (cognito, logger) => {
    const action = (data) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
        try {
            logger.log("forgort-pwd-data: ", data);
            return yield cognito.forgotPassword({
                ClientId: data.clientID,
                Username: data.username
            });
        }
        catch (err) {
            logger.error(JSON.stringify(err));
            throw shared_1.GENERAL_ACTION_ERROR("ResetUserPassword", "cognito-user");
        }
    });
    return {
        action
    };
};
exports.ForgotPassword = ForgotPassword;
//# sourceMappingURL=forgot-password.js.map