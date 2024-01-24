/* eslint-disable @typescript-eslint/no-explicit-any */
import { AnyEntity, EntityName } from "@mikro-orm/core";

export * from "./authorizer";
export * from "./event-provider";
export * from "./analytics-provider";
export * from "./post-room-charge";
export * from "./identity-provider";
export * from "./utils";
export * from "./uploader";
export * from "./migrations";
export * from "./test-provider";
export * from "./db-provider/postgres";
export * from "./express";
export * from "./communication";
export * from "./logger";
export * from "./notification";
export * from "./payment";
export * from "./payment/interfaces";
export * from "./sockets";
export * from "./sockets/interfaces";
export * from "./authorizer/types";

interface IEntityFromServiceInput {
  entityName: string;
  arr: AnyEntity[];
}

export const getEntityFromArray = (
  dep: IEntityFromServiceInput
): EntityName<AnyEntity<unknown>> => {
  const { entityName, arr } = dep;
  return entitiesToKeyValue(arr)[entityName];
};

export const entitiesToKeyValue = (input) => {
  return input.reduce((a, v: any) => {
    return { ...a, [v.name]: v };
  }, {});
};
