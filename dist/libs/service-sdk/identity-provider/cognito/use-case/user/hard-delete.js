"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HardDeleteUser = void 0;
const tslib_1 = require("tslib");
const shared_1 = require("@butlerhospitality/shared");
const HardDeleteUser = (cognito, logger) => {
    const action = (username) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
        try {
            // todo: this has to be transactional with saga since it can fail adding a user to a group
            return yield cognito.adminHardDeleteUser({
                Username: username
            });
        }
        catch (err) {
            logger.error(JSON.stringify(err));
            throw shared_1.GENERAL_ACTION_ERROR("delete", "cognito-user");
        }
    });
    return {
        action
    };
};
exports.HardDeleteUser = HardDeleteUser;
//# sourceMappingURL=hard-delete.js.map