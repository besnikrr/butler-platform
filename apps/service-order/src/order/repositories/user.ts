import { CustomEntityRepository } from "@butlerhospitality/service-sdk";
import { User } from "../../user/entity";

export interface IUserRepository extends CustomEntityRepository<User> { }
export class UserRepository extends CustomEntityRepository<User> implements IUserRepository { }
