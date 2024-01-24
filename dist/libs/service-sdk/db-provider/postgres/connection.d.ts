import { AppEnum } from "@butlerhospitality/shared";
import { AnyEntity, EntityRepository, MikroORM, EventSubscriber } from "@mikro-orm/core";
import { EntityClass } from "@mikro-orm/core/typings";
export interface IMikroORMConnectionDependency {
    tenant: string;
    dbname: string;
    service: AppEnum;
    entities: EntityClass<AnyEntity>[];
    pooling: boolean;
    subscribers: EventSubscriber<AnyEntity>[];
}
export declare const getConnection: (dependency: IMikroORMConnectionDependency) => Promise<DIConnectionObject<any>>;
export declare const setConnection: (dependency: IMikroORMConnectionDependency) => Promise<DIConnectionObject<any>>;
export interface DIConnectionObject<T> {
    conn: MikroORM;
    repositories: {
        [key: string]: EntityRepository<T>;
    };
}
export declare const connection: {
    getConnection: (dependency: IMikroORMConnectionDependency) => Promise<DIConnectionObject<any>>;
};
