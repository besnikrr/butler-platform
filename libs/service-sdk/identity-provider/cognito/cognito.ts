/**
 * Cognito Implementation
 */
import * as AWS from "aws-sdk";

import { ConfirmForgotPasswordRequest } from "aws-sdk/clients/cognitoidentityserviceprovider";
import { logger } from "libs/service-sdk/logger";
import {
  CreateUpdateGroupQuery,
  DeleteGroupQuery,
  GetGroupQuery,
  ListGroupsQuery,
  CreateUserQuery,
  EnableDisableUser,
  ListUsersQuery,
  ListUsersInGroupQuery,
  ResetUserPasswordQuery,
  SetUserPasswordQuery,
  UserSignOutQuery,
  ConfirmUserSignUp,
  ListGroupsForUserQuery,
  UpdateUserAttributesQuery,
  AddRemoveUserToGroupQuery,
  AdminGetUserQuery,
  ENUM_DELIVERY_MEDIUMS
} from "./types";

import ICognito from "./interface";

interface ICognitoConfig {
  poolId: string;
  apiVersion?: string;
  aws?: {
    region: string;
    accessKeyId: string;
    secretAccessKey: string;
  };
}
export { ICognitoConfig };

export function createInstance(poolId: string): Cognito {
  const config = getCognitoConfig();
  const awsClient = new AWS.CognitoIdentityServiceProvider(config);
  return new Cognito(awsClient, poolId);
}

export function getCognitoConfig() {
  return {
    apiVersion: "2016-04-18",
    region: process.env.REGION,
    accessKeyId: process.env.ACCESS_KEY_ID,
    secretAccessKey: process.env.SECRET_ACCESS_KEY
  };
}

/**
 * Cognito Integration
 */
class Cognito implements ICognito {
  protected awsClient: any;

  private UserPoolID: any;

  /**
   * Creates new cognito instance
   * @param {any} awsClient
   * @param {String} userPoolID
   */
  constructor(awsClient: any, userPoolID: string) {
    this.awsClient = awsClient;
    this.UserPoolID = userPoolID;
  }

  getServiceName = () => {
    return "cognito-identity-service-provider";
  };

  // #region Group
  /**
   * Create new group inside specified user pool
   * @param {CreateUpdateGroupQuery} group
   * @return {Promise}
   */
  createGroup = (group: CreateUpdateGroupQuery) => {
    const params = { ...group, UserPoolId: this.UserPoolID };
    return this.awsClient.createGroup(params).promise();
  };

  /**
   * Update group inside specified user pool
   * @param {CreateUpdateGroupQuery} userGroup
   * @return {Promise}
   */
  updateGroup = (userGroup: CreateUpdateGroupQuery) => {
    const params = { ...userGroup, UserPoolId: this.UserPoolID };
    return this.awsClient.updateGroup(params).promise();
  };

  /**
   * Delete group inside specified user pool
   * @param {DeleteGroupQuery} deleteUserGroup
   * @return {Promise}
   */
  deleteGroup = (deleteUserGroup: DeleteGroupQuery) => {
    const params = { ...deleteUserGroup, UserPoolId: this.UserPoolID };
    return this.awsClient.deleteGroup(params).promise();
  };

  /**
   * Get group inside specified user pool
   * @param {GetGroupQuery} getGroupQuery
   * @return {Promise}
   */
  getGroup = (getGroupQuery: GetGroupQuery) => {
    const params = { ...getGroupQuery, UserPoolId: this.UserPoolID };
    return this.awsClient.getGroup(params).promise();
  };

  /**
   * List groups inside specified user pool
   * @param {ListGroupsQuery} listGroups
   * @return {Promise}
   */
  listGroups = (listGroups?: ListGroupsQuery) => {
    const params = { ...listGroups, UserPoolId: this.UserPoolID };
    return this.awsClient.listGroups(params).promise();
  };
  // #endregion

  // #region Users
  /**
   * Create user inside specified user pool
   * @param {CreateUserQuery} user
   * @return {Promise}
   */
  adminCreateUser = (user: CreateUserQuery) => {
    const params = {
      ...user,
      UserPoolId: this.UserPoolID,
      DesiredDeliveryMediums: [ENUM_DELIVERY_MEDIUMS.EMAIL],
      ForceAliasCreation: false
    };
    return this.awsClient.adminCreateUser(params).promise();
  };

  /**
   * Enable user inside specified user pool
   * @param {EnableDisableUser} user
   * @return {Promise}
   */
  adminEnableUser = (user: EnableDisableUser) => {
    const params = { ...user, UserPoolId: this.UserPoolID };
    return this.awsClient.adminEnableUser(params).promise();
  };

  /**
   * Disable user inside specified user pool
   * @param {EnableDisableUser} user
   * @return {Promise}
   */
  adminDisableUser = (user: EnableDisableUser) => {
    const params = { ...user, UserPoolId: this.UserPoolID };
    return this.awsClient.adminDisableUser(params).promise();
  };

  /**
   * Get user
   * @param {AdminGetUserQuery} user
   * @return {Promise}
   */
  adminGetUser = (user: AdminGetUserQuery) => {
    const params = { ...user, UserPoolId: this.UserPoolID };
    return this.awsClient.adminGetUser(params).promise();
  };

  /**
   * Reset user password
   * @param {ResetUserPasswordQuery} resetUserPassword
   * @return {Promise}
   */
  adminResetUserPassword = (resetUserPassword: ResetUserPasswordQuery) => {
    const params = { ...resetUserPassword, UserPoolId: this.UserPoolID };
    return this.awsClient.adminResetUserPassword(params).promise();
  };

  /**
   * Reset user password
   * @param {SetUserPasswordQuery} setSetUserPassword
   * @return {Promise}
   */
  adminSetUserPassword = (setSetUserPassword: SetUserPasswordQuery) => {
    const params = { ...setSetUserPassword, UserPoolId: this.UserPoolID };
    return this.awsClient.adminSetUserPassword(params).promise();
  };

  /**
   * Confirm user signUp
   * @param {ConfirmUserSignUp} confirmUserSignUp
   * @return {Promise}
   */
  adminConfirmUserSignUp = (confirmUserSignUp: ConfirmUserSignUp) => {
    const params = { ...confirmUserSignUp, UserPoolId: this.UserPoolID };
    return this.awsClient.adminConfirmSignUp(params).promise();
  };

  /**
   * User Global SignOut
   * @param {UserSignOutQuery} user
   * @return {Promise}
   */
  adminUserGlobalSignOut = (user: UserSignOutQuery) => {
    const params = { ...user, UserPoolId: this.UserPoolID };
    return this.awsClient.adminUserGlobalSignOut(params).promise();
  };

  /**
   * List users
   * @param {ListUsersQuery} listUsers
   * @return {Promise}
   */
  listUsers = (listUsers?: ListUsersQuery) => {
    const params = { ...listUsers, UserPoolId: this.UserPoolID };
    return this.awsClient.listUsers(params).promise();
  };

  /**
   * List users
   * @param {ListUsersInGroupQuery} listUserGroup
   * @return {Promise}
   */
  listUsersInGroup = (listUserGroup: ListUsersInGroupQuery) => {
    const params = { ...listUserGroup, UserPoolId: this.UserPoolID };
    logger.log("paramss:: ", params);
    return this.awsClient.listUsersInGroup(params).promise();
  };

  // #region User-Groups
  /**
   * Add user to group
   * @param {AddRemoveUserToGroupQuery} addUserToGroup
   * @return {Promise}
   */
  adminAddUserToGroup = (addUserToGroup: AddRemoveUserToGroupQuery) => {
    const params = { ...addUserToGroup, UserPoolId: this.UserPoolID };
    return this.awsClient.adminAddUserToGroup(params).promise();
  };

  /**
   * Admin delete-resource user from group
   * @param {AddRemoveUserToGroupQuery} removeUserFromGroup
   * @return {Promise}
   */
  adminRemoveUserFromGroup = (
    removeUserFromGroup: AddRemoveUserToGroupQuery
  ) => {
    const params = { ...removeUserFromGroup, UserPoolId: this.UserPoolID };
    return this.awsClient.adminRemoveUserFromGroup(params).promise();
  };

  /**
   * List user groups
   * @param {ListGroupsForUserQuery} listGroupsForUser
   * @return {Promise}
   */
  adminListGroupsForUser = (listGroupsForUser: ListGroupsForUserQuery) => {
    const params = { ...listGroupsForUser, UserPoolId: this.UserPoolID };
    return this.awsClient.adminListGroupsForUser(params).promise();
  };
  // #endregion

  /**
   * Update user attributes
   * @param {UpdateUserAttributesQuery} userAndAttributes
   * @return {Promise}
   */
  adminUpdateUserAttributes = (
    userAndAttributes: UpdateUserAttributesQuery
  ) => {
    const params = { ...userAndAttributes, UserPoolId: this.UserPoolID };
    return this.awsClient.adminUpdateUserAttributes(params).promise();
  };

  adminConfirmForgotPassword = (
    params: ConfirmForgotPasswordRequest
  ) => {
    return this.awsClient.confirmForgotPassword(params).promise();
  };

  forgotPassword = (
    params: { Username: string, ClientId: string }
  ) => {
    return this.awsClient.forgotPassword(params).promise();
  };

  adminChangePassword = (params: {
    AccessToken: string,
    PreviousPassword: string
    ProposedPassword: string
  }): Promise<void> => {
    return this.awsClient.changePassword(params).promise();
  };

  adminHardDeleteUser = (user: EnableDisableUser) => {
    const params = { ...user, UserPoolId: this.UserPoolID };
    return this.awsClient.adminDeleteUser(params).promise();
  };
}
