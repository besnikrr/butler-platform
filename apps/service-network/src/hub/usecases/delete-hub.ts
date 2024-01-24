import { ENTITY, SNS_TOPIC, HUB_EVENT } from "@butlerhospitality/shared";
import { ConflictError, eventProvider } from "@butlerhospitality/service-sdk";
import { IHubRepository } from "../repository";

export interface IDeleteHubDependency {
  hubRepository: IHubRepository;
}

export default (dependency: IDeleteHubDependency) => {
  const { hubRepository } = dependency;
  return async (id: number): Promise<boolean> => {
    const hub = await hubRepository.getOneEntityOrFail({ id }, ["hotels"]);
    const length = hub.hotels.count();

    if (length) {
      throw new ConflictError("Hub has hotel relations");
    }

    const deleted = await hubRepository.softDelete(id);

    await eventProvider.client().publish<{ id: number; entity: string }>(
      SNS_TOPIC.NETWORK.HUB, HUB_EVENT.DELETED, null, {
        id,
        entity: ENTITY.NETWORK.HUB
      }
    );

    return deleted;
  };
};
