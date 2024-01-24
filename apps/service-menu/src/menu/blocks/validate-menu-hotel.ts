import Menu, { MENU_STATUS } from "../entities/menu";
import { MikroORM } from "@mikro-orm/core";
import { IMenuRepository } from "../repository";
import { NotFoundError } from "@butlerhospitality/service-sdk";

export interface IGetMenuDependency {
  connection: MikroORM;
}
export interface IGetMenuOrderDependenciesInput {
  hotelId: number;
  menuId: number;
}

export interface IHubFilter {
  id: number;
  hotels: number;
  status: string;
}

class MenuNotFoundError extends NotFoundError {
  constructor() {
    super("Menu", "Menu for the specified hotel was not found.");
  }
}

export default (
  dependency: IGetMenuDependency
) => {
  return async (input: IGetMenuOrderDependenciesInput): Promise<boolean> => {
    const repo = dependency.connection.em.getRepository(Menu) as IMenuRepository;

    const result = await repo.findOne({
      id: input.menuId,
      hotels: input.hotelId,
      status: MENU_STATUS.ACTIVE
    });

    if (!result) {
      throw new MenuNotFoundError();
    }

    return true;
  };
};
