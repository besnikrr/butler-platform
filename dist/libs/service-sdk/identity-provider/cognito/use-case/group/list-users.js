"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ListGroupUsers = void 0;
const tslib_1 = require("tslib");
const shared_1 = require("@butlerhospitality/shared");
const ListGroupUsers = (cognito, logger) => {
    const action = (data) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
        try {
            const cgRes = yield cognito.listUsersInGroup({
                GroupName: data.role.name
            });
            logger.info(JSON.stringify(cgRes));
            return cgRes.Users || [];
        }
        catch (err) {
            logger.error(err);
            throw shared_1.GENERAL_ACTION_ERROR("list-users", "cognito-group");
        }
    });
    return {
        action
    };
};
exports.ListGroupUsers = ListGroupUsers;
//# sourceMappingURL=list-users.js.map