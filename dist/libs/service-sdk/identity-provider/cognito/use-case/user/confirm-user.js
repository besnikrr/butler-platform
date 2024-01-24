"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfirmUser = void 0;
const tslib_1 = require("tslib");
const shared_1 = require("@butlerhospitality/shared");
const ConfirmUser = (cognito, logger) => {
    const action = (email) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
        try {
            yield cognito.adminSetUserPassword({
                Username: email,
                Password: "Temporary1!",
                Permanent: true
            });
            return yield cognito.adminUpdateUserAttributes({
                Username: email,
                UserAttributes: [
                    {
                        Name: "email_verified",
                        Value: "true"
                    }
                ]
            });
        }
        catch (err) {
            logger.error(JSON.stringify(err));
            throw shared_1.GENERAL_ACTION_ERROR("confirm-user", "cognito-user");
        }
    });
    return {
        action
    };
};
exports.ConfirmUser = ConfirmUser;
//# sourceMappingURL=confirm-user.js.map