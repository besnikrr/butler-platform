import { BaseEntity } from "@butlerhospitality/service-sdk";
import { EventSubscriber, FlushEventArgs } from "@mikro-orm/core";
declare class SoftDeleteSubscriber<T extends BaseEntity> implements EventSubscriber<T> {
    onFlush(args: FlushEventArgs): Promise<void>;
}
export { SoftDeleteSubscriber };
