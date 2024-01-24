"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const cognito_1 = require("./cognito");
const add_user_1 = require("./use-case/group/add-user");
const create_1 = require("./use-case/group/create");
const delete_1 = require("./use-case/group/delete");
const list_users_1 = require("./use-case/group/list-users");
const update_1 = require("./use-case/group/update");
const change_password_1 = require("./use-case/user/change-password");
const confirm_user_1 = require("./use-case/user/confirm-user");
const create_2 = require("./use-case/user/create");
const delete_2 = require("./use-case/user/delete");
const forgot_password_1 = require("./use-case/user/forgot-password");
const get_1 = require("./use-case/user/get");
const reset_password_1 = require("./use-case/user/reset-password");
const hard_delete_1 = require("./use-case/user/hard-delete");
const CognitoManager = (poolId, logger) => {
    const cognito = cognito_1.createInstance(poolId);
    const createRole = create_1.CreateGroup(cognito, logger).action;
    const updateRole = update_1.UpdateGroup(cognito, logger).action;
    const deleteRole = delete_1.DeleteGroup(cognito, logger).action;
    const listUsersInGroup = list_users_1.ListGroupUsers(cognito, logger).action;
    const addUserToRoles = add_user_1.AddUser(cognito, logger).action;
    const createUser = create_2.CreateUser(cognito, logger).action;
    const getUser = get_1.GetUser(cognito, logger).action;
    const deleteUser = delete_2.DeleteUser(cognito, logger).action;
    const confirmUser = confirm_user_1.ConfirmUser(cognito, logger).action;
    const resetUserPassword = reset_password_1.ResetUserPassword(cognito, logger).action;
    const forgotPassword = forgot_password_1.ForgotPassword(cognito, logger).action;
    const changePassword = change_password_1.ChangePassword(cognito, logger).action;
    const hardDeleteUser = hard_delete_1.HardDeleteUser(cognito, logger).action;
    return {
        createRole,
        updateRole,
        deleteRole,
        addUserToRoles,
        createUser,
        listUsersInGroup,
        getUser,
        deleteUser,
        confirmUser,
        resetUserPassword,
        forgotPassword,
        changePassword,
        hardDeleteUser
    };
};
exports.default = CognitoManager;
//# sourceMappingURL=index.js.map