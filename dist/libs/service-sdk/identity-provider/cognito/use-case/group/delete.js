"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeleteGroup = void 0;
const tslib_1 = require("tslib");
const shared_1 = require("@butlerhospitality/shared");
const DeleteGroup = (cognito, logger) => {
    const action = (data) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
        try {
            return yield cognito.deleteGroup({
                GroupName: data.role.name
            });
        }
        catch (err) {
            logger.error(JSON.stringify(err));
            throw shared_1.GENERAL_ACTION_ERROR("delete", "cognito-group");
        }
    });
    return {
        action
    };
};
exports.DeleteGroup = DeleteGroup;
//# sourceMappingURL=delete.js.map