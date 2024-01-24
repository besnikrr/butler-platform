import { EntityRepository, FilterQuery, Populate } from "@mikro-orm/core";
import { PureBaseEntity, EmptyBaseEntity } from "./base-entity";
export declare class CustomEntityRepository<T extends PureBaseEntity | EmptyBaseEntity> extends EntityRepository<T> {
    getOneEntityOrFail(where: FilterQuery<T>, populate?: Populate<T>): Promise<T>;
    getOneEntityOrFailWithLock(where: FilterQuery<T>, lockVersion: number, populate?: Populate<T>): Promise<T>;
    failIfEntityExists(where: FilterQuery<T>): Promise<void>;
    softDelete(id: number | number[]): Promise<boolean>;
    getEntitiesOrFailIfNotFound(entityIDs: number[], populate?: Populate<T>): Promise<T[]>;
    private convertKey;
    private constructErrorMessageForUniqueFields;
}
