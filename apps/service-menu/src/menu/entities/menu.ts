
import { BaseEntity, IBaseEntity, IPublishableEntity } from "@butlerhospitality/service-sdk";
import {
  BigIntType,
  Collection, Entity, Enum, ManyToMany, OneToMany, Property, Unique
} from "@mikro-orm/core";
import Category from "../../category/entities/category";
import Hotel from "../../hotel/entities/hotel";
import { ProductMenuRepository } from "../repository";
import ProductMenu from "./product-menu";

export enum MENU_STATUS {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
}

export interface IMenuPublish extends IPublishableEntity { }

export interface IAssignMenuHotelPublish extends IMenu, IPublishableEntity {
  categories?: Category[];
  unassignedHotelIds: number[];
}

export interface IMenu extends IBaseEntity {
  oms_id?: number;
  name: string;
  status: MENU_STATUS;
  products: Collection<ProductMenu>
  hotels: Collection<Hotel>
}

@Entity({ customRepository: () => ProductMenuRepository })
export default class Menu extends BaseEntity implements IMenu {
  @Unique()
  @Property({ columnType: "bigint", type: BigIntType, nullable: true })
  @Unique()
  oms_id?: number;

  @Property({ length: 255 })
  name!: string;

  @Enum({
    columnType: "varchar",
    length: 20,
    items: () => MENU_STATUS,
    default: MENU_STATUS.INACTIVE
  })
  status!: MENU_STATUS;

  @OneToMany({ entity: () => ProductMenu, mappedBy: (productMenu) => productMenu.menu })
  products = new Collection<ProductMenu>(this);

  @ManyToMany({
    entity: () => Hotel,
    owner: true,
    pivotTable: "menu_hotel",
    joinColumn: "menu_id",
    inverseJoinColumn: "hotel_id"
  })
  hotels = new Collection<Hotel>(this);
}
