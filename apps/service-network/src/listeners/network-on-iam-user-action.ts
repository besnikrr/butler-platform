import { BadRequestError, getConnection, logger } from "@butlerhospitality/service-sdk";
import { wrap } from "@mikro-orm/core";

import { AppEnum, DEFAULT_EVENT_ERROR_MESSAGE, USER_EVENT, warmupkey } from "@butlerhospitality/shared";
import User from "../user/entity";
import { NetworkEntities } from "../entities";
import { IUserRepository } from "../user/repository";

const userEvents = (userRepository: IUserRepository) => {
  const userCreated = async (context, data) => {
    const user = userRepository.create(data);

    await userRepository.persistAndFlush(user);
  };

  const userUpdated = async (context, data) => {
    const user = await userRepository.findOneOrFail({ id: data.id });
    wrap(user).assign(data);
    await userRepository.flush();
  };

  const userDeleted = async (context, data) => {
    const user = await userRepository.findOneOrFail({ id: data.id });
    user.deleted_at = new Date();
    await userRepository.flush();
  };

  return {
    userCreated,
    userUpdated,
    userDeleted
  };
};

export default async function networkOnUserAction(event: any): Promise<void> {
  if (event.source === warmupkey) {
    logger.log("WarmUP - Lambda is warm!");
    return;
  }

  // TODO revisit for tenant implementation
  const {
    conn: { em }
  } = await getConnection({
    tenant: process.env.DEFAULT_TENANT,
    service: AppEnum.NETWORK,
    dbname: process.env.DB,
    entities: NetworkEntities.asArray(),
    pooling: false,
    subscribers: []
  });
  const userRepository = em.getRepository(User) as IUserRepository;

  for (const record of event.Records) {
    const bodyParsed = JSON.parse(record.body);
    const { context, data } = bodyParsed;

    const messageAttributes = record.MessageAttributes || record.messageAttributes;
    switch (messageAttributes.eventName.StringValue || messageAttributes.eventName.stringValue) {
    case USER_EVENT.CREATED_ADAPTER:
      logger.log("user create event sent to adapter");
      break;
    case USER_EVENT.CREATED:
      await userEvents(userRepository).userCreated(context, data);
      break;
    case USER_EVENT.UPDATED:
      await userEvents(userRepository).userUpdated(context, data);
      break;
    case USER_EVENT.DELETED:
      await userEvents(userRepository).userDeleted(context, data);
      break;
    default:
      throw new BadRequestError(DEFAULT_EVENT_ERROR_MESSAGE);
    }
  }
}

