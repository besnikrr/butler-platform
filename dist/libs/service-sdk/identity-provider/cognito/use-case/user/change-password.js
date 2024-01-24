"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChangePassword = void 0;
const tslib_1 = require("tslib");
const shared_1 = require("@butlerhospitality/shared");
const ChangePassword = (cognito, logger) => {
    const action = (params) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
        try {
            return yield cognito.adminChangePassword(params);
        }
        catch (err) {
            logger.error(JSON.stringify(err));
            throw shared_1.GENERAL_ACTION_ERROR("ChangePassword", "cognito-user");
        }
    });
    return {
        action
    };
};
exports.ChangePassword = ChangePassword;
//# sourceMappingURL=change-password.js.map