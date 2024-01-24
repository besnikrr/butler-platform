import { ConfirmForgotPasswordRequest } from "aws-sdk/clients/cognitoidentityserviceprovider";
import { CreateUpdateGroupQuery, DeleteGroupQuery, GetGroupQuery, ListGroupsQuery, CreateUserQuery, EnableDisableUser, ListUsersQuery, ListUsersInGroupQuery, ResetUserPasswordQuery, SetUserPasswordQuery, UserSignOutQuery, ConfirmUserSignUp, ListGroupsForUserQuery, UpdateUserAttributesQuery, AddRemoveUserToGroupQuery, AdminGetUserQuery } from "./types";
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
export declare function createInstance(poolId: string): Cognito;
export declare function getCognitoConfig(): {
    apiVersion: string;
    region: string;
    accessKeyId: string;
    secretAccessKey: string;
};
/**
 * Cognito Integration
 */
declare class Cognito implements ICognito {
    protected awsClient: any;
    private UserPoolID;
    /**
     * Creates new cognito instance
     * @param {any} awsClient
     * @param {String} userPoolID
     */
    constructor(awsClient: any, userPoolID: string);
    getServiceName: () => string;
    /**
     * Create new group inside specified user pool
     * @param {CreateUpdateGroupQuery} group
     * @return {Promise}
     */
    createGroup: (group: CreateUpdateGroupQuery) => any;
    /**
     * Update group inside specified user pool
     * @param {CreateUpdateGroupQuery} userGroup
     * @return {Promise}
     */
    updateGroup: (userGroup: CreateUpdateGroupQuery) => any;
    /**
     * Delete group inside specified user pool
     * @param {DeleteGroupQuery} deleteUserGroup
     * @return {Promise}
     */
    deleteGroup: (deleteUserGroup: DeleteGroupQuery) => any;
    /**
     * Get group inside specified user pool
     * @param {GetGroupQuery} getGroupQuery
     * @return {Promise}
     */
    getGroup: (getGroupQuery: GetGroupQuery) => any;
    /**
     * List groups inside specified user pool
     * @param {ListGroupsQuery} listGroups
     * @return {Promise}
     */
    listGroups: (listGroups?: ListGroupsQuery) => any;
    /**
     * Create user inside specified user pool
     * @param {CreateUserQuery} user
     * @return {Promise}
     */
    adminCreateUser: (user: CreateUserQuery) => any;
    /**
     * Enable user inside specified user pool
     * @param {EnableDisableUser} user
     * @return {Promise}
     */
    adminEnableUser: (user: EnableDisableUser) => any;
    /**
     * Disable user inside specified user pool
     * @param {EnableDisableUser} user
     * @return {Promise}
     */
    adminDisableUser: (user: EnableDisableUser) => any;
    /**
     * Get user
     * @param {AdminGetUserQuery} user
     * @return {Promise}
     */
    adminGetUser: (user: AdminGetUserQuery) => any;
    /**
     * Reset user password
     * @param {ResetUserPasswordQuery} resetUserPassword
     * @return {Promise}
     */
    adminResetUserPassword: (resetUserPassword: ResetUserPasswordQuery) => any;
    /**
     * Reset user password
     * @param {SetUserPasswordQuery} setSetUserPassword
     * @return {Promise}
     */
    adminSetUserPassword: (setSetUserPassword: SetUserPasswordQuery) => any;
    /**
     * Confirm user signUp
     * @param {ConfirmUserSignUp} confirmUserSignUp
     * @return {Promise}
     */
    adminConfirmUserSignUp: (confirmUserSignUp: ConfirmUserSignUp) => any;
    /**
     * User Global SignOut
     * @param {UserSignOutQuery} user
     * @return {Promise}
     */
    adminUserGlobalSignOut: (user: UserSignOutQuery) => any;
    /**
     * List users
     * @param {ListUsersQuery} listUsers
     * @return {Promise}
     */
    listUsers: (listUsers?: ListUsersQuery) => any;
    /**
     * List users
     * @param {ListUsersInGroupQuery} listUserGroup
     * @return {Promise}
     */
    listUsersInGroup: (listUserGroup: ListUsersInGroupQuery) => any;
    /**
     * Add user to group
     * @param {AddRemoveUserToGroupQuery} addUserToGroup
     * @return {Promise}
     */
    adminAddUserToGroup: (addUserToGroup: AddRemoveUserToGroupQuery) => any;
    /**
     * Admin delete-resource user from group
     * @param {AddRemoveUserToGroupQuery} removeUserFromGroup
     * @return {Promise}
     */
    adminRemoveUserFromGroup: (removeUserFromGroup: AddRemoveUserToGroupQuery) => any;
    /**
     * List user groups
     * @param {ListGroupsForUserQuery} listGroupsForUser
     * @return {Promise}
     */
    adminListGroupsForUser: (listGroupsForUser: ListGroupsForUserQuery) => any;
    /**
     * Update user attributes
     * @param {UpdateUserAttributesQuery} userAndAttributes
     * @return {Promise}
     */
    adminUpdateUserAttributes: (userAndAttributes: UpdateUserAttributesQuery) => any;
    adminConfirmForgotPassword: (params: ConfirmForgotPasswordRequest) => any;
    forgotPassword: (params: {
        Username: string;
        ClientId: string;
    }) => any;
    adminChangePassword: (params: {
        AccessToken: string;
        PreviousPassword: string;
        ProposedPassword: string;
    }) => Promise<void>;
    adminHardDeleteUser: (user: EnableDisableUser) => any;
}
