import { eventProvider, getConnection, logger } from "@butlerhospitality/service-sdk";
import { AppEnum, ENTITY, PRODUCT_EVENT, SNS_TOPIC } from "@butlerhospitality/shared";
import OutOfStock, { IOutOfStockPublish } from "../entities/out-of-stock";
import { MenuEntities } from "../../entities";
import { IOutOfStockRepository } from "../repository";

export const returnProductsBackInStock = async (...args) => {
  // TODO check for warmup
  logger.log(args);
  const { conn } = await getConnection({
    tenant: process.env.DEFAULT_TENANT,
    service: AppEnum.MENU,
    dbname: process.env.DB,
    entities: MenuEntities.asArray(),
    pooling: false,
    subscribers: []
  });
  const outOfStockRepository = conn.em.getRepository(OutOfStock) as IOutOfStockRepository;

  const availableProducts = await outOfStockRepository.find({
    available_at: {
      $lte: new Date().toISOString()
    }
  });
  await outOfStockRepository.softDelete(availableProducts.map((item) => item.id));

  const eventData = availableProducts.map((element) => {
    return {
      id: element.product_id,
      entity: ENTITY.MENU.OUT_OF_STOCK
    };
  });

  if (eventData.length) {
    await eventProvider.client()
      .publish<IOutOfStockPublish[]>(SNS_TOPIC.MENU.PRODUCT, PRODUCT_EVENT.BACK_IN_STOCK, null, eventData);
  }
};
