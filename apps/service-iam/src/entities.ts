import { BaseEntity, AuditBaseEntity } from "@butlerhospitality/service-sdk";
import App from "./app/entities/app";
import PermissionGroup from "./permission-group/entities/permission-group";
import Permission from "./permission-group/entities/permission";
import Role from "./role/entities/role";
import User from "./user/entities/user";
import Hub from "./hub/entities/hub";
import UserHub from "./user/entities/user-hub";

const IAMEntitiesObject = {
  BaseEntity,
  AuditBaseEntity,
  User,
  Role,
  Permission,
  PermissionGroup,
  App,
  Hub,
  UserHub
};

export const IAMEntities = {
  asArray: () => {
    return Object.values(IAMEntitiesObject);
  },
  asObject: () => {
    return IAMEntitiesObject;
  }
};
