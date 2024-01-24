"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCognitoConfig = exports.createInstance = void 0;
/**
 * Cognito Implementation
 */
const AWS = require("aws-sdk");
const logger_1 = require("libs/service-sdk/logger");
const types_1 = require("./types");
function createInstance(poolId) {
    const config = getCognitoConfig();
    const awsClient = new AWS.CognitoIdentityServiceProvider(config);
    return new Cognito(awsClient, poolId);
}
exports.createInstance = createInstance;
function getCognitoConfig() {
    return {
        apiVersion: "2016-04-18",
        region: process.env.REGION,
        accessKeyId: process.env.ACCESS_KEY_ID,
        secretAccessKey: process.env.SECRET_ACCESS_KEY
    };
}
exports.getCognitoConfig = getCognitoConfig;
/**
 * Cognito Integration
 */
class Cognito {
    /**
     * Creates new cognito instance
     * @param {any} awsClient
     * @param {String} userPoolID
     */
    constructor(awsClient, userPoolID) {
        this.getServiceName = () => {
            return "cognito-identity-service-provider";
        };
        // #region Group
        /**
         * Create new group inside specified user pool
         * @param {CreateUpdateGroupQuery} group
         * @return {Promise}
         */
        this.createGroup = (group) => {
            const params = Object.assign(Object.assign({}, group), { UserPoolId: this.UserPoolID });
            return this.awsClient.createGroup(params).promise();
        };
        /**
         * Update group inside specified user pool
         * @param {CreateUpdateGroupQuery} userGroup
         * @return {Promise}
         */
        this.updateGroup = (userGroup) => {
            const params = Object.assign(Object.assign({}, userGroup), { UserPoolId: this.UserPoolID });
            return this.awsClient.updateGroup(params).promise();
        };
        /**
         * Delete group inside specified user pool
         * @param {DeleteGroupQuery} deleteUserGroup
         * @return {Promise}
         */
        this.deleteGroup = (deleteUserGroup) => {
            const params = Object.assign(Object.assign({}, deleteUserGroup), { UserPoolId: this.UserPoolID });
            return this.awsClient.deleteGroup(params).promise();
        };
        /**
         * Get group inside specified user pool
         * @param {GetGroupQuery} getGroupQuery
         * @return {Promise}
         */
        this.getGroup = (getGroupQuery) => {
            const params = Object.assign(Object.assign({}, getGroupQuery), { UserPoolId: this.UserPoolID });
            return this.awsClient.getGroup(params).promise();
        };
        /**
         * List groups inside specified user pool
         * @param {ListGroupsQuery} listGroups
         * @return {Promise}
         */
        this.listGroups = (listGroups) => {
            const params = Object.assign(Object.assign({}, listGroups), { UserPoolId: this.UserPoolID });
            return this.awsClient.listGroups(params).promise();
        };
        // #endregion
        // #region Users
        /**
         * Create user inside specified user pool
         * @param {CreateUserQuery} user
         * @return {Promise}
         */
        this.adminCreateUser = (user) => {
            const params = Object.assign(Object.assign({}, user), { UserPoolId: this.UserPoolID, DesiredDeliveryMediums: [types_1.ENUM_DELIVERY_MEDIUMS.EMAIL], ForceAliasCreation: false });
            return this.awsClient.adminCreateUser(params).promise();
        };
        /**
         * Enable user inside specified user pool
         * @param {EnableDisableUser} user
         * @return {Promise}
         */
        this.adminEnableUser = (user) => {
            const params = Object.assign(Object.assign({}, user), { UserPoolId: this.UserPoolID });
            return this.awsClient.adminEnableUser(params).promise();
        };
        /**
         * Disable user inside specified user pool
         * @param {EnableDisableUser} user
         * @return {Promise}
         */
        this.adminDisableUser = (user) => {
            const params = Object.assign(Object.assign({}, user), { UserPoolId: this.UserPoolID });
            return this.awsClient.adminDisableUser(params).promise();
        };
        /**
         * Get user
         * @param {AdminGetUserQuery} user
         * @return {Promise}
         */
        this.adminGetUser = (user) => {
            const params = Object.assign(Object.assign({}, user), { UserPoolId: this.UserPoolID });
            return this.awsClient.adminGetUser(params).promise();
        };
        /**
         * Reset user password
         * @param {ResetUserPasswordQuery} resetUserPassword
         * @return {Promise}
         */
        this.adminResetUserPassword = (resetUserPassword) => {
            const params = Object.assign(Object.assign({}, resetUserPassword), { UserPoolId: this.UserPoolID });
            return this.awsClient.adminResetUserPassword(params).promise();
        };
        /**
         * Reset user password
         * @param {SetUserPasswordQuery} setSetUserPassword
         * @return {Promise}
         */
        this.adminSetUserPassword = (setSetUserPassword) => {
            const params = Object.assign(Object.assign({}, setSetUserPassword), { UserPoolId: this.UserPoolID });
            return this.awsClient.adminSetUserPassword(params).promise();
        };
        /**
         * Confirm user signUp
         * @param {ConfirmUserSignUp} confirmUserSignUp
         * @return {Promise}
         */
        this.adminConfirmUserSignUp = (confirmUserSignUp) => {
            const params = Object.assign(Object.assign({}, confirmUserSignUp), { UserPoolId: this.UserPoolID });
            return this.awsClient.adminConfirmSignUp(params).promise();
        };
        /**
         * User Global SignOut
         * @param {UserSignOutQuery} user
         * @return {Promise}
         */
        this.adminUserGlobalSignOut = (user) => {
            const params = Object.assign(Object.assign({}, user), { UserPoolId: this.UserPoolID });
            return this.awsClient.adminUserGlobalSignOut(params).promise();
        };
        /**
         * List users
         * @param {ListUsersQuery} listUsers
         * @return {Promise}
         */
        this.listUsers = (listUsers) => {
            const params = Object.assign(Object.assign({}, listUsers), { UserPoolId: this.UserPoolID });
            return this.awsClient.listUsers(params).promise();
        };
        /**
         * List users
         * @param {ListUsersInGroupQuery} listUserGroup
         * @return {Promise}
         */
        this.listUsersInGroup = (listUserGroup) => {
            const params = Object.assign(Object.assign({}, listUserGroup), { UserPoolId: this.UserPoolID });
            logger_1.logger.log("paramss:: ", params);
            return this.awsClient.listUsersInGroup(params).promise();
        };
        // #region User-Groups
        /**
         * Add user to group
         * @param {AddRemoveUserToGroupQuery} addUserToGroup
         * @return {Promise}
         */
        this.adminAddUserToGroup = (addUserToGroup) => {
            const params = Object.assign(Object.assign({}, addUserToGroup), { UserPoolId: this.UserPoolID });
            return this.awsClient.adminAddUserToGroup(params).promise();
        };
        /**
         * Admin delete-resource user from group
         * @param {AddRemoveUserToGroupQuery} removeUserFromGroup
         * @return {Promise}
         */
        this.adminRemoveUserFromGroup = (removeUserFromGroup) => {
            const params = Object.assign(Object.assign({}, removeUserFromGroup), { UserPoolId: this.UserPoolID });
            return this.awsClient.adminRemoveUserFromGroup(params).promise();
        };
        /**
         * List user groups
         * @param {ListGroupsForUserQuery} listGroupsForUser
         * @return {Promise}
         */
        this.adminListGroupsForUser = (listGroupsForUser) => {
            const params = Object.assign(Object.assign({}, listGroupsForUser), { UserPoolId: this.UserPoolID });
            return this.awsClient.adminListGroupsForUser(params).promise();
        };
        // #endregion
        /**
         * Update user attributes
         * @param {UpdateUserAttributesQuery} userAndAttributes
         * @return {Promise}
         */
        this.adminUpdateUserAttributes = (userAndAttributes) => {
            const params = Object.assign(Object.assign({}, userAndAttributes), { UserPoolId: this.UserPoolID });
            return this.awsClient.adminUpdateUserAttributes(params).promise();
        };
        this.adminConfirmForgotPassword = (params) => {
            return this.awsClient.confirmForgotPassword(params).promise();
        };
        this.forgotPassword = (params) => {
            return this.awsClient.forgotPassword(params).promise();
        };
        this.adminChangePassword = (params) => {
            return this.awsClient.changePassword(params).promise();
        };
        this.adminHardDeleteUser = (user) => {
            const params = Object.assign(Object.assign({}, user), { UserPoolId: this.UserPoolID });
            return this.awsClient.adminDeleteUser(params).promise();
        };
        this.awsClient = awsClient;
        this.UserPoolID = userPoolID;
    }
}
//# sourceMappingURL=cognito.js.map