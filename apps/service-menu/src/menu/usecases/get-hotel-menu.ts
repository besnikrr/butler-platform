import { parseCategories } from "../../utils/util";
import Menu, { MENU_STATUS } from "../entities/menu";
import { IMenuRepository } from "../repository";

export interface FormattedMenuResponse {
  oms_id?: number;
  name: string;
  categories: object;
  status: MENU_STATUS
}
export interface IGetMenuDependency {
  menuRepository: IMenuRepository;
}

export default (dependency: IGetMenuDependency) => {
  const { menuRepository } = dependency;
  return async (hotelId: number, formatted: boolean): Promise<Menu | FormattedMenuResponse> => {
    const menu = await menuRepository.getOneEntityOrFail({
      hotels: {
        $in: [hotelId]
      }
    }, [
      "products.product.modifiers", "products.category.parent_category"
    ]);

    return formatted ? {
      oms_id: menu.oms_id,
      name: menu.name,
      id: menu.id,
      categories: parseCategories(menu.products),
      status: menu.status
    } : menu;
  };
};
