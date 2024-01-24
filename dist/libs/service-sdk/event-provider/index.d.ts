import { ActionContext } from "@butlerhospitality/shared";
interface EventPayloadStruct<T> {
    data: T;
    tenantId: string;
    eventName: string;
    authUser: any;
}
declare class EvClient {
    stage: string;
    eventProvider: any;
    constructor();
    publish<T>(topicARN: string, eventName: string, context: ActionContext, data: T | T[]): Promise<any>;
    subscribe(eventName: string): any;
    on(event: string, cb: (channel: string, message: string) => void): any;
}
declare const eventProvider: {
    client(): EvClient;
};
export { eventProvider, EvClient, EventPayloadStruct };
