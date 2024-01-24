import { PrimaryKey } from "@mikro-orm/core";
import { AuditBaseEntity, IAuditBaseEntity } from "./audit-base-entity";
import { ExcludeDeleted } from "./decorators/exclude-deleted";

export interface IBaseEntity extends IAuditBaseEntity {
  id: number
}

export interface IPureBaseEntity {
  id: number;
}

@ExcludeDeleted()
export abstract class BaseEntity extends AuditBaseEntity implements IBaseEntity {
  @PrimaryKey()
  id!: number;
}

export class PureBaseEntity implements IPureBaseEntity {
  @PrimaryKey()
  id!: number;
}

export abstract class EmptyBaseEntity { }
