import { Collection } from "@mikro-orm/core";
import { eventProvider, IdentityProviderFactory, IdentityProviderType
} from "@butlerhospitality/service-sdk";
import {
  ITenant, USER_EVENT, ENTITY, SNS_TOPIC, STAGE
} from "@butlerhospitality/shared";
import {
  IsNotEmpty, IsString, IsEmail, IsNumber, IsOptional, MaxLength
} from "class-validator";
import User from "../entities/user";
import Role from "../../role/entities/role";
import { EntityManager } from "@mikro-orm/postgresql";
import { UserRepository } from "../repository";

export interface ICreateUserInput {
  id?: number;
  name: string;
  email: string;
  phone_number?: string;
  roles: number[];
  created_at?: number;
  updated_at?: number;
  deleted_at?: number;
}
export interface IUserPublish {
  id?: number;
  name: string;
  email: string;
  phone_number?: string;
  roles: Collection<Role>;
  created_at?: Date;
  updated_at?: Date;
  deleted_at?: Date;
  entity: string;
}

export class CreateUserInput implements ICreateUserInput {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  phone_number?: string;

  @IsEmail()
  @IsNotEmpty()
  @MaxLength(100)
  email: string;

  @IsNotEmpty()
  @IsNumber({}, { each: true, message: "Roles must be a number array" })
  roles: number[];

  @IsNumber()
  @IsOptional()
  created_at?: number;

  @IsNumber()
  @IsOptional()
  updated_at?: number;

  @IsNumber()
  @IsOptional()
  deleted_at?: number;
}

export interface ICreateUserDependency {
  em: EntityManager;
	validate: boolean;
	tenant: string;
}

export default (dependency: ICreateUserDependency) => {
  const userRepository = dependency.em.getRepository(User) as UserRepository;
  const createDBUser = async (userInput: ICreateUserInput): Promise<User> => {
    await userRepository.failIfEntityExists({
      email: userInput.email
    });
    const userToInsert = userRepository.create(userInput);
    userRepository.assign(userToInsert, userInput);
    await userRepository.persistAndFlush(userToInsert);
    await userRepository.populate(userToInsert, ["roles"]);
    await eventProvider.client().publish<IUserPublish>(
      SNS_TOPIC.IAM.USER,
      USER_EVENT.CREATED,
      null, {
        ...userToInsert,
        entity: ENTITY.IAM.USER
      }
    );

    return userToInsert;
  };

  const saveUserInCognito = async (tenant: ITenant, user: User): Promise<void> => {
    await IdentityProviderFactory({
      type: IdentityProviderType.Cognito,
      logger: console,
      poolId: tenant.cognito.poolId
    }).createUser({
      user
    });
  };

  const deleteUserOnFailure = async (tenant: ITenant, username: string): Promise<void> => {
    await IdentityProviderFactory({
      type: IdentityProviderType.Cognito,
      logger: console,
      poolId: tenant.cognito.poolId
    }).hardDeleteUser(username);
  };

  return async (userInput: ICreateUserInput, tenant: ITenant): Promise<User> => {
    await dependency.em.begin();

    let user;
    try {
      user = await createDBUser(userInput);

      if (process.env.STAGE !== STAGE.local && process.env.STAGE !== STAGE.test) {
        await saveUserInCognito(tenant, user);
      }

      await dependency.em.commit();
      return user;
    } catch (e) {
      await dependency.em.rollback();
      await deleteUserOnFailure(tenant, user.email);
      throw e;
    }
  };
};
