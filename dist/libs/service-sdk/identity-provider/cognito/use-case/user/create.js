"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateUser = void 0;
const tslib_1 = require("tslib");
const shared_1 = require("@butlerhospitality/shared");
const CreateUser = (cognito, logger) => {
    const action = (data) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
        var _a;
        try {
            // todo: this has to be transactional with saga since it can fail adding a user to a group
            yield cognito.adminCreateUser({
                Username: data.user.email,
                ClientMetadata: {
                    displayName: (_a = data.metadata) === null || _a === void 0 ? void 0 : _a.display_name
                },
                UserAttributes: [
                    { Name: "email", Value: data.user.email },
                    { Name: "email_verified", Value: "true" }
                ]
            });
        }
        catch (err) {
            logger.error("[cognito-create-user-error]", err, JSON.stringify(err));
            throw shared_1.GENERAL_ACTION_ERROR("create", "cognito-user");
        }
    });
    return {
        action
    };
};
exports.CreateUser = CreateUser;
//# sourceMappingURL=create.js.map