"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResetUserPassword = void 0;
const tslib_1 = require("tslib");
const shared_1 = require("@butlerhospitality/shared");
const ResetUserPassword = (cognito, logger) => {
    const action = (data) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
        try {
            return yield cognito.adminConfirmForgotPassword({
                ClientId: data.clientID,
                ConfirmationCode: data.confirmationCode,
                Password: data.password,
                Username: data.username
            });
        }
        catch (err) {
            logger.error("[reset-password-cognito-err]: ", err, JSON.stringify(err));
            throw shared_1.GENERAL_ACTION_ERROR("ResetUserPassword", "cognito-user");
        }
    });
    return {
        action
    };
};
exports.ResetUserPassword = ResetUserPassword;
//# sourceMappingURL=reset-password.js.map