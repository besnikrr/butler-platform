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
export declare const getServiceDBConnection: (dep: IServiceDBConnInput) => Promise<import("@butlerhospitality/service-sdk").DIConnectionObject<any>>;
export {};
