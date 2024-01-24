import { USER_EVENT, ENTITY, SNS_TOPIC } from "@butlerhospitality/shared";
import { eventProvider } from "@butlerhospitality/service-sdk";
import { IsString, IsEmail, IsOptional, MaxLength } from "class-validator";
import User from "../entities/user";
import { IUserPublish } from "./create-user";
import { IUserRepository } from "../repository";

export interface IUpdateUserInput {
  name?: string;
  phone_number?: string;
  roles?: number[];
  email?: string;
}

export class UpdateUserInput implements IUpdateUserInput {
  @IsString()
  @IsOptional()
  @MaxLength(100)
  name: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  phone_number?: string;

  @IsEmail()
  @IsOptional()
  @MaxLength(100)
  email: string;

  @IsOptional()
  roles: number[];
}

export interface IUpdateUserDependency {
  userRepository: IUserRepository;
}

export default (dependency: IUpdateUserDependency) => {
  const { userRepository } = dependency;
  return async (id: number, data: IUpdateUserInput): Promise<User> => {
    const user = await userRepository.getOneEntityOrFail({ id }, ["roles"]);
    user.roles.removeAll();
    userRepository.assign(user, { ...data, mergeObjects: true });
    await userRepository.persistAndFlush(user);
    await eventProvider.client().publish<IUserPublish>(
      SNS_TOPIC.IAM.USER, USER_EVENT.UPDATED, null, {
        ...user,
        entity: ENTITY.IAM.USER
      }
    );
    return user;
  };
};
