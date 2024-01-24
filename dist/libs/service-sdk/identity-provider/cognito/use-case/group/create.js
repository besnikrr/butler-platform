"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateGroup = void 0;
const tslib_1 = require("tslib");
const shared_1 = require("@butlerhospitality/shared");
const CreateGroup = (cognito, logger) => {
    const action = (data) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
        try {
            const cgRes = yield cognito.createGroup({
                GroupName: data.role.name,
                Description: data.role.description
            });
            logger.info(JSON.stringify(cgRes));
        }
        catch (err) {
            logger.error(err);
            throw shared_1.GENERAL_ACTION_ERROR("create", "cognito-group");
        }
    });
    return {
        action
    };
};
exports.CreateGroup = CreateGroup;
//# sourceMappingURL=create.js.map