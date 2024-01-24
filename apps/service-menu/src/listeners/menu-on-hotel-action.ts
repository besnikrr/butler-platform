
import { BadRequestError, getConnection, logger } from "@butlerhospitality/service-sdk";
import { AppEnum, HOTEL_EVENT } from "@butlerhospitality/shared";
import { wrap } from "@mikro-orm/core";
import Hotel from "../hotel/entities/hotel";
import { MenuEntities } from "../entities";

const hotelEvents = (hotelRepository) => {
  const hotelCreated = async (data: Hotel) => {
    const createdHotel = hotelRepository.create({ ...data, hub: data.hub.id });
    await hotelRepository.persistAndFlush(createdHotel);
  };

  const hotelUpdated = async (data: Hotel) => {
    const existingHotel = await hotelRepository.findOne({ id: data.id });
    wrap(existingHotel).assign({ ...data, hub: data.hub.id });

    await hotelRepository.flush(existingHotel);
  };

  const hotelDeleted = async (data: Hotel) => {
    const existingHotel = await hotelRepository.findOne({ id: data.id });
    existingHotel.deleted_at = new Date();

    await hotelRepository.flush(existingHotel);
  };

  return {
    hotelCreated,
    hotelUpdated,
    hotelDeleted
  };
};

async function menuHotelOnNetworkHotelAction(event: any): Promise<void> {
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
  const hotelRepository = em.getRepository(Hotel);

  for (const record of event.Records) {
    const bodyParsed = JSON.parse(record.body);
    const { data } = bodyParsed;

    logger.log(data);
    const messageAttributes = record.MessageAttributes || record.messageAttributes;
    switch (messageAttributes.eventName.StringValue || messageAttributes.eventName.stringValue) {
    case HOTEL_EVENT.CREATED_ADAPTER:
      logger.log("hotel create event sent to adapter");
      break;
    case HOTEL_EVENT.CREATED:
      await hotelEvents(hotelRepository).hotelCreated(data);
      break;
    case HOTEL_EVENT.UPDATED:
      await hotelEvents(hotelRepository).hotelUpdated(data);
      break;
    case HOTEL_EVENT.DELETED:
      await hotelEvents(hotelRepository).hotelDeleted(data);
      break;
    default:
      throw new BadRequestError("Bad event name provided");
    }
  }
}

export { menuHotelOnNetworkHotelAction };
