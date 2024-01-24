import { wrap } from "@mikro-orm/core";
import { ConflictError, eventProvider } from "@butlerhospitality/service-sdk";
import { ENTITY, HUB_EVENT, SNS_TOPIC } from "@butlerhospitality/shared";
import { IHubRepository } from "../repository";
import Hub from "../entity";

export interface IUpdateStatusHubDependecy {
  hubRepository: IHubRepository;
}
export default (dependency: IUpdateStatusHubDependecy) => {
  const { hubRepository } = dependency;
  return async (id: number, status: boolean) => {
    const hub = await hubRepository.getOneEntityOrFail({ id }, ["hotels"]);

    const { length } = hub.hotels.count;
    if (!status && length) {
      throw new ConflictError("This hub has hotels that need to be assigned to another hub.");
    }

    wrap(hub).assign({ active: status });
    await hubRepository.flush();

    const payload = {
      entity: ENTITY.NETWORK.HUB,
      ...hub
    };
    await eventProvider.client().publish<Hub>(SNS_TOPIC.NETWORK.HUB, HUB_EVENT.UPDATED, null, payload);

    return hub;
  };
};
