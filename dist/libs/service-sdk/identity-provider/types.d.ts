import { ResetUserPasswordInput } from "./cognito/types";
import { ICognitoChangePasswordInput } from "./cognito/use-case/user/change-password";
declare enum IdentityProviderType {
    Cognito = 0
}
interface IdentityMetadata {
    [key: string]: any;
}
interface IdentityUser {
    email: string;
    display_name?: string;
}
interface IdentityRole {
    name: string;
    description: string;
}
interface CreateIdentityRoleInput {
    role: IdentityRole;
}
interface UpdateIdentityRoleInput {
    role: IdentityRole;
}
interface DeleteIdentityRoleInput {
    role: IdentityRole;
}
interface CreateIdentityUserInput {
    user: IdentityUser;
    metadata?: IdentityMetadata;
    roles?: IdentityRole[];
}
interface AddUserToRolesInput {
    user: IdentityUser;
    currentRoles: IdentityRole[];
    newRoles: IdentityRole[];
}
interface IdentityProvider {
    createRole(data: CreateIdentityRoleInput): any;
    updateRole(data: CreateIdentityRoleInput): any;
    deleteRole(data: DeleteIdentityRoleInput): any;
    addUserToRoles(data: AddUserToRolesInput): any;
    createUser(data: CreateIdentityUserInput): any;
    getUser(username: string): any;
    deleteUser(username: string): any;
    listUsersInGroup(data: {
        role: IdentityRole;
    }): any;
    confirmUser(email: string): any;
    resetUserPassword(data: ResetUserPasswordInput): any;
    forgotPassword(data: {
        clientID: string;
        username: string;
    }): any;
    changePassword(params: ICognitoChangePasswordInput): any;
    hardDeleteUser(username: string): any;
}
interface CreateFactoryInput {
    type: IdentityProviderType;
    logger: any;
    poolId?: string;
}
export { IdentityProvider, IdentityProviderType, IdentityUser, IdentityRole, CreateIdentityRoleInput, UpdateIdentityRoleInput, DeleteIdentityRoleInput, CreateIdentityUserInput, AddUserToRolesInput, CreateFactoryInput };
