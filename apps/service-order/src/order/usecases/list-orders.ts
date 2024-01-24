import { BaseFilter, getPaginationParams } from "@butlerhospitality/service-sdk";
import { expr } from "@mikro-orm/core";
import { ArrayNotEmpty, IsEnum, IsISO8601, IsNotEmpty, IsOptional, IsString, ValidateIf } from "class-validator";
import { IOrder } from "../entity";
import { OrderRepository } from "../repository";
import { OrderStatus, OrderType } from "../shared/enums";

export interface IListOrdersOutput extends Omit<IOrder, "service" | "parent" | "children" | "statuses" | "tax" | "tip" |
  "totalNet" | "totalGross" | "tip" | "receiptAmount" | "source"> {
}

export interface IListOrdersFilterDependency {
  paginationFilters: BaseFilter;
  orderFilters?: IListOrdersFilter;
  originalFilters?: IOrderFilter;
}

export interface IOrderFilter {
  search?: string;
  orderNumber?: string;
  roomNumber?: string;
  phoneNumber?: string;
  carrierId?: string;
  hubIds?: string[];
  hotelIds?: string[];
  statuses?: OrderStatus[];
  type?: OrderType;
  createdDate?: {
    from?: string;
    to?: string;
  };
  confirmedDate?: {
    from?: string;
    to?: string;
  };
}

export interface IListOrdersFilterDependency {
  paginationFilters: BaseFilter;
  orderFilters?: IListOrdersFilter;
  originalFilters?: IOrderFilter;
}

export interface IListOrdersFilter {
  number?: number;
  status?: OrderStatus[];
  type?: OrderType;
  created_at?: {
    $gte: string;
    $lte: string;
  };
  confirmedDate?: {
    $gte: string;
    $lte: string;
  };
  meta?: IOrderMetaFilter;
  client?: {
    phoneNumber: string;
  };
  $or?: object[];
  $and?: object[];
}

interface IOrderMetaFilter {
  hotelId?: number[];
  hubId?: number[];
  roomNumber?: string;
  foodCarrier?: number;
}

class DateField {
  @IsISO8601()
  @IsNotEmpty()
  @ValidateIf((o) => !o.from && !o.to)
  from: string;

  @IsISO8601()
  @IsNotEmpty()
  @ValidateIf((o) => !o.from && !o.to)
  to: string;
}

export class ListOrderFilterValidation {
  @IsString()
  @IsOptional()
  search?: string;

  @IsString()
  @IsOptional()
  orderNumber?: string;

  @IsString()
  @IsOptional()
  page?: string;

  @IsString()
  @IsOptional()
  phoneNumber?: string;

  @IsString()
  @IsOptional()
  carrierId?: string;

  @IsEnum(OrderStatus, { each: true })
  @ArrayNotEmpty()
  @IsOptional()
  statuses?: OrderStatus[];

  @IsEnum(OrderType)
  @IsOptional()
  type?: OrderType;

  @IsString({ each: true })
  @ArrayNotEmpty()
  @IsOptional()
  hotelIds?: string;

  @IsString({ each: true })
  @IsOptional()
  @ArrayNotEmpty()
  hubIds?: string[];

  @IsString()
  @IsOptional()
  roomNumber?: string;

  @IsOptional()
  createdDate?: DateField;

  @IsOptional()
  confirmedDate?: DateField;
}

export interface IListOrdersDependency {
  orderRepository: OrderRepository;
}

export default (dependency: IListOrdersDependency) =>
  async (filters: IListOrdersFilterDependency): Promise<[IListOrdersOutput[], number]> => {
    if (filters.originalFilters?.search) {
      const search = filters.originalFilters.search.toLowerCase();
      filters.orderFilters.$or = [
        { status: { $ilike: `%${search.replace(/ /g, "_")}%` } },
        { [expr("CAST(number AS TEXT)")]: { $ilike: `%${search}%` } },
        { [expr("CAST(grand_total AS TEXT)")]: { $ilike: `%${search}%` } },
        { client: { name: { $ilike: `%${search}%` } } },
        { meta: { roomNumber: { $ilike: `%${search}%` } } }
      ];
    }

    const { page, limit } = filters.paginationFilters;
    return dependency.orderRepository.findAndCount(filters.orderFilters, getPaginationParams({ page, limit }));
  };
