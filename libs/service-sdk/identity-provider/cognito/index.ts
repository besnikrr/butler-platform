import { IdentityProvider } from "../types";
import { createInstance } from "./cognito";
import ICognito from "./interface";
import { AddUser } from "./use-case/group/add-user";
import { CreateGroup } from "./use-case/group/create";
import { DeleteGroup } from "./use-case/group/delete";
import { ListGroupUsers } from "./use-case/group/list-users";
import { UpdateGroup } from "./use-case/group/update";
import { ChangePassword } from "./use-case/user/change-password";
import { ConfirmUser } from "./use-case/user/confirm-user";
import { CreateUser } from "./use-case/user/create";
import { DeleteUser } from "./use-case/user/delete";
import { ForgotPassword } from "./use-case/user/forgot-password";
import { GetUser } from "./use-case/user/get";
import { ResetUserPassword } from "./use-case/user/reset-password";
import { HardDeleteUser } from "./use-case/user/hard-delete";

const CognitoManager = (poolId: string, logger: any): IdentityProvider => {
  const cognito: ICognito = createInstance(poolId);

  const createRole = CreateGroup(cognito, logger).action;
  const updateRole = UpdateGroup(cognito, logger).action;
  const deleteRole = DeleteGroup(cognito, logger).action;
  const listUsersInGroup = ListGroupUsers(cognito, logger).action;
  const addUserToRoles = AddUser(cognito, logger).action;
  const createUser = CreateUser(cognito, logger).action;
  const getUser = GetUser(cognito, logger).action;
  const deleteUser = DeleteUser(cognito, logger).action;
  const confirmUser = ConfirmUser(cognito, logger).action;
  const resetUserPassword = ResetUserPassword(cognito, logger).action;
  const forgotPassword = ForgotPassword(cognito, logger).action;
  const changePassword = ChangePassword(cognito, logger).action;
  const hardDeleteUser = HardDeleteUser(cognito, logger).action;

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

export default CognitoManager;
