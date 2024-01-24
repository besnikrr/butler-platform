import {
  CustomError, eventProvider, HttpStatusCode,
  IdentityProviderFactory, IdentityProviderType
} from "@butlerhospitality/service-sdk";
import { ENTITY, ITenant, PROTECTED_ROLES, SNS_TOPIC, USER_EVENT } from "@butlerhospitality/shared";
import { EntityManager } from "@mikro-orm/postgresql";
import User from "../entities/user";
import { IUserRepository } from "../repository";
import { IUserPublish } from "./create-user";

export interface IDeleteUserDependency {
  em: EntityManager;
}

export default (dependency: IDeleteUserDependency) => {
  const userRepository = dependency.em.getRepository(User) as IUserRepository;

  const deleteDBUser = async (id: number): Promise<User> => {
    const user = await userRepository.getOneEntityOrFail(id, ["roles"]);
    for (const role of user.roles) {
      if (PROTECTED_ROLES.includes(role.name)) {
        throw new CustomError("Delete user", 400, "You cant delete super_admin or admin users.");
      }
    }
    user.roles.removeAll();
    await userRepository.softDelete(id);
    await eventProvider.client().publish<IUserPublish>(
      SNS_TOPIC.IAM.USER,
      USER_EVENT.DELETED,
      null, {
        ...user,
        entity: ENTITY.IAM.USER
      }
    );

    return user;
  };

  const deleteUserInCognito = async (tenant: ITenant, user: User): Promise<void> => {
    try {
      await IdentityProviderFactory({
        type: IdentityProviderType.Cognito,
        logger: console,
        poolId: tenant.cognito.poolId
      }).deleteUser(user?.email);
    } catch (err) {
      throw new CustomError("Cognito Error", HttpStatusCode.INTERNAL_SERVER, err);
    }
  };

  return async (id: number, tenant: ITenant): Promise<User> => {
    const { em } = dependency;
    await em.begin();
    try {
      const deletedUser = await deleteDBUser(id);
      if (process.env.STAGE !== "local" && process.env.STAGE !== "test") {
        if (deletedUser) {
          await deleteUserInCognito(tenant, deletedUser);
        }
      }
      await em.commit();
      return deletedUser;
    } catch (e) {
      await em.rollback();
      throw e;
    }
  };
};
