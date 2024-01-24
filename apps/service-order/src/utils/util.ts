import { getServiceDBConnection } from "@butlerhospitality/service-sdk";
import { AppEnum } from "@butlerhospitality/shared";
import { MenuEntities } from "@services/service-menu/src/entities";
import { NetworkEntities } from "@services/service-network/src/entities";
import { VoucherEntities } from "@services/service-voucher/src/entities";
import discountEntities from "@services/service-discount/src/utils/entities";
import { OrderDBDependenciesConnection } from "../order/shared/interfaces";
import { IListOrdersFilter, IOrderFilter } from "../order/usecases/list-orders";
import { OrderStatus } from "@services/service-order/src/order/shared/enums";
import orderEntities from "../utils/entities";

const parseMetaFilters = (filters: IOrderFilter, filterObject: IListOrdersFilter) => {
  if (filters.roomNumber || filters.hubIds || filters.hotelIds || filters.carrierId) {
    filterObject.meta = {};
    if (filters.roomNumber) {
      filterObject.meta.roomNumber = filters.roomNumber;
    }
    if (filters.hubIds) {
      filterObject.meta.hubId = filters.hubIds.map(Number);
    }
    if (filters.hotelIds) {
      filterObject.meta.hotelId = filters.hotelIds.map(Number);
    }
    if (filters.carrierId) {
      filterObject.meta.foodCarrier = Number(filters.carrierId);
    }
  }
};

const parseCreatedDateFilters = (filters: IOrderFilter, filterObject: IListOrdersFilter) => {
  if (filters.createdDate) {
    filterObject.created_at = {
      $gte: createStartDate(filters.createdDate.from),
      $lte: createEndDate(filters.createdDate.to)
    };
  }
};

const parseConfirmedDateFilters = (filters: IOrderFilter, filterObject: IListOrdersFilter) => {
  if (filters.confirmedDate) {
    filterObject.confirmedDate = {
      $gte: createStartDate(filters.confirmedDate.from),
      $lte: createEndDate(filters.confirmedDate.to)
    };
    filterObject.status = [OrderStatus.CONFIRMATION];
  }
};

const parseClientFilters = (filters: IOrderFilter, filterObject: IListOrdersFilter): void => {
  if (filters.phoneNumber) {
    filterObject.client = {
      phoneNumber: filters.phoneNumber
    };
  }
};

export const parseOrderFilters = (filters: IOrderFilter): IListOrdersFilter => {
  const filterObject: IListOrdersFilter = {};

  parseMetaFilters(filters, filterObject);
  parseCreatedDateFilters(filters, filterObject);
  parseConfirmedDateFilters(filters, filterObject);
  parseClientFilters(filters, filterObject);

  if (filters.orderNumber) {
    filterObject.number = Number(filters.orderNumber);
  }
  if (filters.statuses) {
    filterObject.status = filters.statuses;
  }
  if (filters.type) {
    filterObject.type = filters.type;
  }

  return filterObject;
};

export const formatMoney = (amount: number) => `$${amount.toFixed(2)}`;

export const initializeDependencyConnections = async (tenant: string): Promise<OrderDBDependenciesConnection> => {
  const networkConnection = await getServiceDBConnection({
    tenant: tenant,
    service: AppEnum.NETWORK,
    entities: NetworkEntities.asArray()
  });

  const menuConnection = await getServiceDBConnection({
    tenant: tenant,
    service: AppEnum.MENU,
    entities: MenuEntities.asArray()
  });

  const voucherConnection = await getServiceDBConnection({
    tenant: tenant,
    service: AppEnum.VOUCHER,
    entities: VoucherEntities.asArray()
  });

  const discountConnection = await getServiceDBConnection({
    tenant: tenant,
    service: AppEnum.DISCOUNT,
    entities: discountEntities
  });

  return {
    menuConnection: menuConnection.conn,
    networkConnection: networkConnection.conn,
    voucherConnection: voucherConnection.conn,
    discountConnection: discountConnection.conn
  };
};

export const getOrderConnection = (tenant: string) => {
  return getServiceDBConnection({
    tenant,
    service: AppEnum.ORDER,
    entities: orderEntities
  });
};

const createStartDate = (date: string): string => {
  if (date) {
    return date;
  }
  const theBeginningOfTime = "January 1, 1970";
  return new Date(new Date(theBeginningOfTime).setUTCHours(0, 0, 0, 0)).toISOString();
};

const createEndDate = (date: string): string => {
  if (date) {
    return date;
  }
  return new Date(new Date(Date.now()).setUTCHours(23, 59, 59, 999)).toISOString();
};
