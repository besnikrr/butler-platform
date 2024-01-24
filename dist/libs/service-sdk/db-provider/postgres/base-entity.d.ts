import { AuditBaseEntity, IAuditBaseEntity } from "./audit-base-entity";
export interface IBaseEntity extends IAuditBaseEntity {
    id: number;
}
export interface IPureBaseEntity {
    id: number;
}
export declare abstract class BaseEntity extends AuditBaseEntity implements IBaseEntity {
    id: number;
}
export declare class PureBaseEntity implements IPureBaseEntity {
    id: number;
}
export declare abstract class EmptyBaseEntity {
}
