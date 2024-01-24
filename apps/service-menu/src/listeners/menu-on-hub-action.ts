
import { BadRequestError, getConnection, logger } from "@butlerhospitality/service-sdk";
import { AppEnum, HUB_EVENT } from "@butlerhospitality/shared";
import { wrap } from "@mikro-orm/core";
import { MenuEntities } from "../entities";
import Hub from "../hub/entities/hub";

const hubEvents = (hubRepository) => {
  const hubCreated = async (data: Hub) => {
    const createdHub = hubRepository.create(data);
    await hubRepository.persistAndFlush(createdHub);
  };

  const hubUpdated = async (data: Hub) => {
    const existingHub = await hubRepository.findOne({ id: data.id });
    wrap(existingHub).assign(data);

    await hubRepository.flush(existingHub);
  };

  const hubDeleted = async (data: Hub) => {
    const existingHub = await hubRepository.findOne({ id: data.id });
    existingHub.deleted_at = new Date();

    await hubRepository.flush(existingHub);
  };

  return {
    hubCreated,
    hubUpdated,
    hubDeleted
  };
};

async function menuHubOnNetworkHubAction(event: any): Promise<void> {
  const {
    conn: { em }
  } = await getConnection({
    tenant: process.env.DEFAULT_TENANT,
    service: AppEnum.MENU,
    dbname: process.env.DB,
    entities: MenuEntities.asArray(),
    pooling: false,
    subscribers: []
  });
  const hubRepository = em.getRepository(Hub);

  for (const record of event.Records) {
    const bodyParsed = JSON.parse(record.body);
    const { data } = bodyParsed;

    logger.log(data);
    const messageAttributes = record.MessageAttributes || record.messageAttributes;
    switch (messageAttributes.eventName.StringValue || messageAttributes.eventName.stringValue) {
    case HUB_EVENT.CREATED_ADAPTER:
      logger.log("hub create event sent to adapter");
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

export { menuHubOnNetworkHubAction };
