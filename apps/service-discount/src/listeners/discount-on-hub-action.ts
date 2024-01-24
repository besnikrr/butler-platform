import { BadRequestError, getConnection, logger, SoftDeleteSubscriber } from "@butlerhospitality/service-sdk";
import { AppEnum, HUB_EVENT } from "@butlerhospitality/shared";
import Hub from "../hub/entities/hub";
import { HubRepository } from "../hub/repository";
import entities from "../utils/entities";

const hubEvents = (hubRepository: HubRepository) => {
  const hubCreated = async (data: Hub) => {
    const hub = hubRepository.create(data);
    hubRepository.persist(hub);

    await hubRepository.flush();
  };

  const hubUpdated = async (data: Hub) => {
    const hub = await hubRepository.findOne(data.id);
    hubRepository.assign(hub, data);

    await hubRepository.flush();
  };

  const hubDeleted = async (data: Hub) => {
    const hub = await hubRepository.findOne(data.id);
    hubRepository.remove(hub);

    await hubRepository.flush();
  };

  return {
    hubCreated,
    hubUpdated,
    hubDeleted
  };
};

async function discountHubOnNetworkHubAction(event): Promise<void> {
  const {
    conn: { em }
  } = await getConnection({
    tenant: process.env.DEFAULT_TENANT,
    service: AppEnum.DISCOUNT,
    dbname: process.env.DB,
    entities: entities,
    pooling: false,
    subscribers: [new SoftDeleteSubscriber()]
  });

  const hubRepository = em.getRepository(Hub) as HubRepository;

  for (const record of event.Records) {
    const bodyParsed = JSON.parse(record.body);
    const { data } = bodyParsed;

    logger.log(data);
    const messageAttributes = record.MessageAttributes || record.messageAttributes;
    switch (messageAttributes.eventName.StringValue || messageAttributes.eventName.stringValue) {
    case HUB_EVENT.CREATED_ADAPTER:
      logger.log("Hub create event sent to adapter");
      break;
    case HUB_EVENT.CREATED:
      await hubEvents(hubRepository).hubCreated(data);
      break;
    case HUB_EVENT.UPDATED:
      await hubEvents(hubRepository).hubUpdated(data);
      break;
    case HUB_EVENT.DELETED:
      await hubEvents(hubRepository).hubDeleted(data);
      break;
    default:
      throw new BadRequestError("Bad event name provided");
    }
  }
}

export { discountHubOnNetworkHubAction };
