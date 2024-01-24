import { BaseEntity, AuditBaseEntity } from "@butlerhospitality/service-sdk";
import User from "./user/entity";
import City from "./city/entity";
import Hub from "./hub/entity";
import Hotel from "./hotel/entity";

const NetworkEntitiesObject = {
  BaseEntity,
  AuditBaseEntity,
  Hotel,
  Hub,
  City,
  User
};

export const NetworkEntities = {
  asArray: () => {
    return Object.values(NetworkEntitiesObject);
  },
  asObject: () => {
    return NetworkEntitiesObject;
  }
};
