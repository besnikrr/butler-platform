
import { ConfirmForgotPasswordRequest } from "aws-sdk/clients/cognitoidentityserviceprovider";
import {
  CreateUpdateGroupQuery,
  Group,
  DeleteGroupQuery,
  GetGroupQuery,
  ListGroupsQuery,
  ListGroups,
  CreateUserQuery,
  User,
  EnableDisableUser,
  UserAdmin,
  ListUsersQuery,
  ListUsers,
  ListUsersInGroupQuery,
  ListUsersInGroup,
  ResetUserPasswordQuery,
  SetUserPasswordQuery,
  UserSignOutQuery,
  ConfirmUserSignUp,
  ListGroupsForUserQuery,
  UserGroupsList,
  UpdateUserAttributesQuery,
  AddRemoveUserToGroupQuery,
  AdminGetUserQuery
} from "./types";
import { ICognitoChangePasswordInput } from "./use-case/user/change-password";

export default interface ICognito {
  // UserPool > Groups
  createGroup: (userGroup: CreateUpdateGroupQuery) => Promise<Group>;
  updateGroup: (userGroup: CreateUpdateGroupQuery) => Promise<Group>;
  deleteGroup: (deleteUserGroup: DeleteGroupQuery) => Promise<void>;
  getGroup: (getGroupQuery: GetGroupQuery) => Promise<Group>;
  listGroups: (listGroups?: ListGroupsQuery) => Promise<ListGroups>;

  // // UserPool > Users
  adminCreateUser: (user: CreateUserQuery) => Promise<User>;
  adminEnableUser: (user: EnableDisableUser) => Promise<void>;
  adminDisableUser: (user: EnableDisableUser) => Promise<void>;
  adminGetUser: (user: AdminGetUserQuery) => Promise<UserAdmin>;
  adminResetUserPassword: (resetUserPassword: ResetUserPasswordQuery) => Promise<void>;
  adminSetUserPassword: (setUserPassword: SetUserPasswordQuery) => Promise<void>;
  adminConfirmUserSignUp: (confirmUserSignUp: ConfirmUserSignUp) => Promise<void>;
  adminUserGlobalSignOut: (user: UserSignOutQuery) => Promise<void>;
  listUsers: (listUsersQuery?: ListUsersQuery) => Promise<ListUsers>;
  listUsersInGroup: (listUserGroup: ListUsersInGroupQuery) => Promise<ListUsersInGroup>;
  adminHardDeleteUser: (user: EnableDisableUser) => Promise<void>;

  // UserPool > Users-Groups
  adminAddUserToGroup: (addUserToGroup: AddRemoveUserToGroupQuery) => Promise<void>;
  adminRemoveUserFromGroup: (removeUserFromGroup: AddRemoveUserToGroupQuery) => Promise<void>;
  adminListGroupsForUser: (listGroupsForUser: ListGroupsForUserQuery) => Promise<UserGroupsList>;

  // User Attributes
  adminUpdateUserAttributes: (userAndAttributes: UpdateUserAttributesQuery) => Promise<void>;
  adminConfirmForgotPassword: (params: ConfirmForgotPasswordRequest) => Promise<void>;
  forgotPassword: (params: { Username: string; ClientId: string }) => Promise<void>;
  adminChangePassword: (params: ICognitoChangePasswordInput) => Promise<void>;
}
