import {
  BaseFilter, ICognitoChangePasswordInput, IdentityProvider
} from "@butlerhospitality/service-sdk";
import { ITenant, IDefaultUsecaseDependency } from "@butlerhospitality/shared";
import listUsers from "./list-users";
import getUser from "./get-user";
import createUser, { ICreateUserInput } from "./create-user";
import updateUser, { IUpdateUserInput } from "./update-user";
import deleteUser from "./delete-user";
import resetPassword, { IResetAccountPasswordInput } from "./reset-password";
import forgotPassword, { IForgotPasswordInput } from "./forgot-password";
import User from "../entities/user";
import changePassword from "./change-password";
import { EntityManager } from "@mikro-orm/postgresql";
import addUsersToCognito, { IAddUsersToCognitoInput, IAddUsersToCognitoResponse } from "./add-users-to-cognito";

export interface UserUsecase {
  listUsers(req: BaseFilter): Promise<[User[], number]>;
  getUser(id: number): Promise<User>;
  createUser(data: ICreateUserInput, tenant: ITenant): Promise<User>;
  updateUser(id: number, data: IUpdateUserInput): Promise<User>;
  deleteUser(id: number, tenant: ITenant): Promise<User>
  addUsersToCognito(data: IAddUsersToCognitoInput): Promise<IAddUsersToCognitoResponse>;
  resetPassword(data: IResetAccountPasswordInput, tenant: ITenant): Promise<IdentityProvider>;
  forgotPassword(data: IForgotPasswordInput): Promise<IdentityProvider>;
  changePassword(data: ICognitoChangePasswordInput, tenant: ITenant): Promise<IdentityProvider>;
}

export default (dependency: IDefaultUsecaseDependency): UserUsecase => {
  const { conn } = dependency;
  return {
    listUsers: listUsers({
      userRepository: conn.em.getRepository(User)
    }),
    getUser: getUser({
      userRepository: conn.em.getRepository(User)
    }),
    createUser: createUser({
      em: conn.em as EntityManager,
      validate: dependency.validate,
      tenant: dependency.tenant
    }),
    updateUser: updateUser({
      userRepository: conn.em.getRepository(User)
    }),
    deleteUser: deleteUser({
      em: conn.em as EntityManager
    }),
    addUsersToCognito: addUsersToCognito({
      userRepository: conn.em.getRepository(User),
      validate: dependency.validate
    }),
    resetPassword: resetPassword(),
    forgotPassword: forgotPassword(),
    changePassword: changePassword()
  };
};
