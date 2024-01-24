"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateGroup = void 0;
const tslib_1 = require("tslib");
const shared_1 = require("@butlerhospitality/shared");
const UpdateGroup = (cognito, logger) => {
    const action = (data) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
        try {
            const cgRes = yield cognito.updateGroup({
                GroupName: data.role.name,
                Description: data.role.description
            });
            logger.info(JSON.stringify(cgRes));
        }
        catch (err) {
            logger.error(err);
            throw shared_1.GENERAL_ACTION_ERROR("update", "cognito-group");
        }
    });
    return {
        action
    };
};
exports.UpdateGroup = UpdateGroup;
//# sourceMappingURL=update.js.map