"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetUser = void 0;
const tslib_1 = require("tslib");
const shared_1 = require("@butlerhospitality/shared");
const GetUser = (cognito, logger) => {
    const action = (username) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
        try {
            // todo: this has to be transactional with saga since it can fail adding a user to a group
            const adminUser = yield cognito.adminGetUser({
                Username: username
            });
            return adminUser.Username || null;
        }
        catch (err) {
            logger.error(JSON.stringify(err));
            throw shared_1.GENERAL_ACTION_ERROR("create", "cognito-user");
        }
    });
    return {
        action
    };
};
exports.GetUser = GetUser;
//# sourceMappingURL=get.js.map