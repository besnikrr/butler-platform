import { connection } from "@butlerhospitality/service-sdk";
import { AppEnum } from "@butlerhospitality/shared";
import { AnyEntity } from "@mikro-orm/core";

export interface IPublishableEntity {
  entity: string;
}

interface IServiceDBConnInput {
  tenant: string;
  service: AppEnum;
  entities: AnyEntity[];
}

export const getServiceDBConnection = async (dep: IServiceDBConnInput) => {
  const { tenant, service, entities } = dep;
  const serviceConnection = {
    [AppEnum.NETWORK]: {
      tenant,
      dbname: process.env.NETWORK_DB,
      entities,
      service: AppEnum.NETWORK,
      pooling: true
    },
    [AppEnum.MENU]: {
      tenant,
      dbname: process.env.MENU_DB,
      entities,
      service: AppEnum.MENU,
      pooling: true
    },
    [AppEnum.VOUCHER]: {
      tenant,
      dbname: process.env.VOUCHER_DB,
      entities,
      service: AppEnum.VOUCHER,
      pooling: true
    },
    [AppEnum.DISCOUNT]: {
      tenant,
      dbname: process.env.DISCOUNT_DB,
      entities,
      service: AppEnum.DISCOUNT,
      pooling: true
    },
    [AppEnum.IAM]: {
      tenant,
      dbname: process.env.IAM_DB,
      entities,
      service: AppEnum.IAM,
      pooling: true
    },
    [AppEnum.ORDER]: {
      tenant,
      dbname: process.env.ORDER_DB,
      entities,
      service: AppEnum.ORDER,
      pooling: true
    }
  }[service];
  if (!serviceConnection) {
    throw new Error(`No connection found for service ${service} and tenant ${tenant}`);
  }
  return connection.getConnection(serviceConnection);
};
