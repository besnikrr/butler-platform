import { ResetUserPasswordInput } from "./cognito/types";
import { ICognitoChangePasswordInput } from "./cognito/use-case/user/change-password";

enum IdentityProviderType {
  Cognito,
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
  createRole(data: CreateIdentityRoleInput);
  updateRole(data: CreateIdentityRoleInput);
  deleteRole(data: DeleteIdentityRoleInput);
  addUserToRoles(data: AddUserToRolesInput);
  createUser(data: CreateIdentityUserInput);
  getUser(username: string);
  deleteUser(username: string);
  listUsersInGroup(data: { role: IdentityRole });
  confirmUser(email: string);
  resetUserPassword(data: ResetUserPasswordInput);
  forgotPassword(data: { clientID: string; username: string });
  changePassword(params: ICognitoChangePasswordInput);
  hardDeleteUser(username: string);
}

interface CreateFactoryInput {
  type: IdentityProviderType;
  logger: any;
  poolId?: string;
}

export {
  IdentityProvider,
  IdentityProviderType,
  IdentityUser,
  IdentityRole,
  CreateIdentityRoleInput,
  UpdateIdentityRoleInput,
  DeleteIdentityRoleInput,
  CreateIdentityUserInput,
  AddUserToRolesInput,
  CreateFactoryInput
};
