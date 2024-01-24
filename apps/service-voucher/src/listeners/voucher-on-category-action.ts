
import {
  BadRequestError, CustomEntityRepository, getConnection, logger
} from "@butlerhospitality/service-sdk";
import { wrap } from "@mikro-orm/core";
import { AppEnum, CATEGORY_EVENT, warmupkey } from "@butlerhospitality/shared";
import Category from "../category/entities/category";
import { VoucherEntities } from "../entities";

export const categoryEvents = (categoryRepository: CustomEntityRepository<Category>) => {
  const categoryCreated = async (context, data) => {
    const category = categoryRepository.create(data);
    await categoryRepository.persistAndFlush(category);
  };

  const categoryUpdated = async (context, data) => {
    const existingCategory = await categoryRepository.getOneEntityOrFail(data.id);
    wrap(existingCategory).assign(data);
    await categoryRepository.flush();
  };

  const categoryDeleted = async (context, data) => {
    await categoryRepository.softDelete(data.id);
    await categoryRepository.flush();
  };

  return {
    categoryCreated,
    categoryUpdated,
    categoryDeleted
  };
};

export default async function voucherOnCategoryAction(event: any): Promise<void> {
  if (event.source === warmupkey) {
    logger.log("WarmUP - Lambda is warm!");
    return;
  }

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
  const categoryRepository = em.getRepository(Category) as CustomEntityRepository<Category>;

  for (const record of event.Records) {
    const bodyParsed = JSON.parse(record.body);
    const { context, data } = bodyParsed;

    const messageAttributes = record.MessageAttributes || record.messageAttributes;
    switch (messageAttributes.eventName.StringValue || messageAttributes.eventName.stringValue) {
    case CATEGORY_EVENT.CREATED_ADAPTER:
      logger.log("category create event sent to adapter");
      break;
    case CATEGORY_EVENT.CREATED:
      await categoryEvents(categoryRepository).categoryCreated(context, data);
      break;
    case CATEGORY_EVENT.UPDATED:
      await categoryEvents(categoryRepository).categoryUpdated(context, data);
      break;
    case CATEGORY_EVENT.DELETED:
      await categoryEvents(categoryRepository).categoryDeleted(context, data);
      break;
    default:
      throw new BadRequestError("Bad event name provided");
    }
  }
}
