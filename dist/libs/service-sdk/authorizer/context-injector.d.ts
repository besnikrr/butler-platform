import { AppEnum } from "@butlerhospitality/shared";
import { EventSubscriber, MikroORM } from "@mikro-orm/core";
import * as express from "express";
import { AnyEntity, EntityClass } from "@mikro-orm/core/typings";
export interface ActionRequest extends express.Request {
    conn: MikroORM;
    repositories: {
        [key: string]: any;
    };
    actionContext?: any;
    apiGateway?: any;
    isValid: boolean;
    tenant: string;
}
export interface IDbctxInjectorInput {
    servicedb: string;
    entities: EntityClass<AnyEntity>[];
    service: AppEnum;
    subscribers: EventSubscriber<AnyEntity>[];
}
export declare const dbctxInjector: (dep: IDbctxInjectorInput) => (req: ActionRequest, res: any, next: any) => Promise<any>;
declare const contextInjector: (req: any, res: any, next: any) => Promise<any>;
export { contextInjector };
