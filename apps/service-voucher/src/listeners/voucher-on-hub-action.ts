
import { BadRequestError, getConnection, logger } from "@butlerhospitality/service-sdk";
import { AppEnum, HUB_EVENT, warmupkey } from "@butlerhospitality/shared";
import { wrap } from "@mikro-orm/core";
import Hub from "../hub/entities/hub";
import { IHubRepository } from "../hub/repository";
import { VoucherEntities } from "../entities";

export const hubEvents = (hubRepository: IHubRepository) => {
  const hubCreated = async (context, data: Hub) => {
    const hub = hubRepository.create(data);
    await hubRepository.persistAndFlush(hub);
  };

  const hubUpdated = async (context, data: Hub) => {
    const existingHub = await hubRepository.getOneEntityOrFail(data.id);
    wrap(existingHub).assign(data);

    await hubRepository.flush();
  };

  const hubDeleted = async (context, data: Hub) => {
    await hubRepository.softDelete(data.id);
    await hubRepository.flush();
  };

  return {
    hubCreated,
    hubUpdated,
    hubDeleted
  };
};

export default async function voucherOnHubAction(event: any): Promise<void> {
  logger.log("event -> ", event);
  if (event.source === warmupkey) {
    logger.log("WarmUP - Lambda is warm!");
    return;
  }

  // TODO revisit for tenant implementation
  const {
    conn: { em }
  } = await getConnection({
    tenant: process.env.DEFAULT_TENANT,
    service: AppEnum.VOUCHER,
    dbname: process.env.DB,
    entities: VoucherEntities.asArray(),
    pooling: false,
    subscribers: []
  });
  const hubRepository = em.getRepository(Hub) as IHubRepository;

  for (const record of event.Records) {
    const bodyParsed = JSON.parse(record.body);
    const { context, data } = bodyParsed;
    const messageAttributes = record.MessageAttributes || record.messageAttributes;
    switch (messageAttributes.eventName.StringValue || messageAttributes.eventName.stringValue) {
    case HUB_EVENT.CREATED_ADAPTER:
      logger.log("hub create event sent to adapter");
      break;
    case HUB_EVENT.CREATED:
      await hubEvents(hubRepository).hubCreated(context, data);
      break;
    case HUB_EVENT.UPDATED:
      await hubEvents(hubRepository).hubUpdated(context, data);
      break;
    case HUB_EVENT.DELETED:
      await hubEvents(hubRepository).hubDeleted(context, data);
      break;
    default:
      throw new BadRequestError("Bad event name provided");
    }
  }
}
