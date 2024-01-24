
import { IDefaultUsecaseDependency } from "@butlerhospitality/shared";
import User from "../entity";
import listUsers, { UserFilter } from "./list-users";

export interface UserUsecase {
  listUsers(req: UserFilter): Promise<[User[], number]>;
}

export default (dependency: IDefaultUsecaseDependency): UserUsecase => {
  return {
    listUsers: listUsers({
      userRepository: dependency.conn.em.getRepository(User)
    })
  };
};
