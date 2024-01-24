import User from "../entities/user";
import { IUserRepository } from "../repository";

export interface IGetUserDependency {
  userRepository: IUserRepository;
}

export default (dependency: IGetUserDependency) => {
  const { userRepository } = dependency;
  return async (id: number): Promise<User> => {
    return userRepository.getOneEntityOrFail(id, ["roles"]);
  };
};
