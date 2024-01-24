
import { BadRequestError, getConnection, logger } from "@butlerhospitality/service-sdk";
import { wrap } from "@mikro-orm/core";
import { AppEnum, HOTEL_EVENT, warmupkey } from "@butlerhospitality/shared";
import { VoucherEntities } from "../entities";
import Hotel from "../hotel/entities/hotel";
import Hub from "../hub/entities/hub";
import { IHotelRepository } from "../hotel/repository";
import { IHubRepository } from "../hub/repository";

const constructHotelData = (hotel) => ({
  id: hotel.id,
  name: hotel.name,
  hub_id: hotel.hub.id,
  active: hotel.active,
  oms_id: hotel.oms_id,
  created_at: hotel.created_at,
  deleted_at: hotel.deleted_at
});

export const hotelEvents = (hotelRepository: IHotelRepository, hubRepository?: IHubRepository) => {
  const hotelCreated = async (context, data: Hotel) => {
    const hotel = hotelRepository.create({ ...data, hub: data.hub.id });

    const existingHub = await hubRepository.findOne(data.hub.id);

    if (!existingHub) {
      const hub = hubRepository.create(data.hub);
      await hubRepository.persistAndFlush(hub);
    }

    await hotelRepository.persistAndFlush(hotel);
  };

  const hotelUpdated = async (context, data: Hotel) => {
    const existingHotel = await hotelRepository.getOneEntityOrFail(data.id);
    wrap(existingHotel).assign(constructHotelData(data));

    await hotelRepository.flush();
  };

  const hotelDeleted = async (context, data: Hotel) => {
    await hotelRepository.softDelete(data.id);
    await hotelRepository.flush();
  };

  return {
    hotelCreated,
    hotelUpdated,
    hotelDeleted
  };
};

export default async function voucherOnHotelAction(event: any): Promise<void> {
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
  const hotelRepository = em.getRepository(Hotel) as IHotelRepository;
  const hubRepository = em.getRepository(Hub) as IHubRepository;

  for (const record of event.Records) {
    const bodyParsed = JSON.parse(record.body);
    const { context, data } = bodyParsed;

    logger.log(context, data);

    const messageAttributes = record.MessageAttributes || record.messageAttributes;
    switch (messageAttributes.eventName.StringValue || messageAttributes.eventName.stringValue) {
    case HOTEL_EVENT.CREATED_ADAPTER:
      logger.log("hotel create event sent to adapter");
      break;
    case HOTEL_EVENT.CREATED:
      await hotelEvents(hotelRepository, hubRepository).hotelCreated(context, data);
      break;
    case HOTEL_EVENT.UPDATED:
      await hotelEvents(hotelRepository).hotelUpdated(context, data);
      break;
    case HOTEL_EVENT.DELETED:
      await hotelEvents(hotelRepository).hotelDeleted(context, data);
      break;
    default:
      throw new BadRequestError("Bad event name provided");
    }
  }
}
