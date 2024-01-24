import {
  BadRequestError, getConnection, IBaseEntity, IPublishableEntity, logger
} from "@butlerhospitality/service-sdk";
import { AppEnum, MENU_EVENT, warmupkey } from "@butlerhospitality/shared";
import { wrap } from "@mikro-orm/core";
import Category from "../category/entities/category";
import { VoucherEntities } from "../entities";
import Hotel from "../hotel/entities/hotel";
import { IHotelRepository } from "../hotel/repository";

export interface IAssignMenuHotelPublish extends IPublishableEntity, IBaseEntity {
  categories?: Category[];
  unassignedHotelIds: number[];
  hotels: Hotel[]
}

export const menuEvents = (hotelRepository: IHotelRepository) => {
  const hotelsAssigned = async (data: IAssignMenuHotelPublish) => {
    const existingHotels = await hotelRepository.find({ menu_id: data.id });
    const menuHotelIds = data.hotels.map((e) => e.id);
    existingHotels.forEach((hotel) => {
      if (!(menuHotelIds.includes(hotel.id))) {
        wrap(hotel).assign({ menu_id: null });
      }
    });
    const hotels = await hotelRepository.getEntitiesOrFailIfNotFound(menuHotelIds);
    hotels.forEach((h) => {
      wrap(h).assign({ menu_id: data.id });
    });
    await hotelRepository.flush();
  };

  return {
    hotelsAssigned
  };
};

export default async function voucherOnMenuAssignAction(event: any): Promise<void> {
  if (event.source === warmupkey) {
    logger.log("WarmUP - Lambda is warm!");
    return;
  }

  const { conn: { em } } = await getConnection({
    tenant: process.env.DEFAULT_TENANT,
    service: AppEnum.VOUCHER,
    dbname: process.env.DB,
    entities: VoucherEntities.asArray(),
    pooling: false,
    subscribers: []
  });
  const hotelRepository = em.getRepository(Hotel) as IHotelRepository;

  for (const record of event.Records) {
    const bodyParsed = JSON.parse(record.body);
    const { data } = bodyParsed;
    const messageAttributes = record.MessageAttributes || record.messageAttributes;
    switch (messageAttributes.eventName.StringValue || messageAttributes.eventName.stringValue) {
      case MENU_EVENT.HOTELS_ASSIGNED:
        await menuEvents(hotelRepository).hotelsAssigned(data as IAssignMenuHotelPublish);
        break;
      default:
        throw new BadRequestError("Bad event name provided");
    }
  }
}

