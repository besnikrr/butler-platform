import { CustomEntityRepository } from "@butlerhospitality/service-sdk";
import { User } from "./entity";

export interface IUserRepository extends CustomEntityRepository<User> { }

export class UserRepository extends CustomEntityRepository<User> implements IUserRepository { }
