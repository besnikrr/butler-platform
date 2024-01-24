
import { CustomEntityRepository } from "@butlerhospitality/service-sdk";
import User from "./entities/user";
import UserHub from "./entities/user-hub";

export interface IUserRepository extends CustomEntityRepository<User> {}
export class UserRepository extends CustomEntityRepository<User> implements IUserRepository {}

export interface IUserHubRepository extends CustomEntityRepository<UserHub> {}
export class UserHubRepository extends CustomEntityRepository<UserHub> implements IUserHubRepository {}
