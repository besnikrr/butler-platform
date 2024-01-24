"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddUser = void 0;
const tslib_1 = require("tslib");
const shared_1 = require("@butlerhospitality/shared");
const AddUser = (cognito, logger) => {
    const action = (data) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
        const { currentRoles, user, newRoles } = data;
        try {
            for (let i = 0; i < currentRoles.length; i += 1) {
                const role = currentRoles[i];
                yield cognito.adminRemoveUserFromGroup({
                    Username: user.email,
                    GroupName: role.name.split("::")[1]
                });
            }
            for (let i = 0; i < newRoles.length; i += 1) {
                yield cognito.adminAddUserToGroup({
                    Username: user.email,
                    GroupName: newRoles[i].name.split("::")[1]
                });
            }
        }
        catch (err) {
            logger.error(JSON.stringify(err));
            throw shared_1.GENERAL_ACTION_ERROR("add-user", "cognito-group");
        }
    });
    return {
        action
    };
};
exports.AddUser = AddUser;
//# sourceMappingURL=add-user.js.map