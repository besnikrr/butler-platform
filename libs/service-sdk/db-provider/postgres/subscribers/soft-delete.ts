import { BaseEntity } from "@butlerhospitality/service-sdk";
import { ChangeSetType, EventSubscriber, FlushEventArgs } from "@mikro-orm/core";

class SoftDeleteSubscriber<T extends BaseEntity> implements EventSubscriber<T> {
  async onFlush(args: FlushEventArgs): Promise<void> {
    const changeSets = args.uow.getChangeSets();
    const toRemove = changeSets.filter((cs) => cs.entity instanceof BaseEntity && cs.type === ChangeSetType.DELETE);

    for (const changeSet of toRemove) {
      changeSet.type = ChangeSetType.UPDATE;
      changeSet.entity.deleted_at = new Date();
      changeSet.payload.deleted_at = new Date();
      args.uow.recomputeSingleChangeSet(changeSet.entity);
    }
  }
}

export { SoftDeleteSubscriber };
