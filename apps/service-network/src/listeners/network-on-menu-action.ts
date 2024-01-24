import {
  BadRequestError, getConnection, IBaseEntity, IPublishableEntity, validateInput, ValidationError
} from "@butlerhospitality/service-sdk";
import { MealPeriod, MENU_EVENT, warmupkey, AppEnum } from "@butlerhospitality/shared";
import { plainToInstance } from "class-transformer";
import { wrap } from "@mikro-orm/core";
import Hotel, { IHotel } from "../hotel/entity";
import { getDefaultOperatingHours, OperatingHoursValidation } from "../utils/operating-hours";
import { NetworkEntities } from "../entities";

export interface IAssignedHotel extends IBaseEntity {
  name: string,
  hub: number
}

export interface IAssignMenuHotelPublish extends IPublishableEntity, IBaseEntity {
  unassignedHotelIds: number[];
  hotels: IAssignedHotel[]
}

const hotelEvents = (hotelRepository) => {
  const hotelsAssigned = async (data: IAssignMenuHotelPublish) => {
    const unassignedHotels = await hotelRepository.find({ id: { $in: data.unassignedHotelIds } });
    unassignedHotels?.forEach((hotel: IHotel) => {
      wrap(hotel).assign({ operating_hours: "[]" });
      wrap(hotel).assign({ menu_id: null });
    });
    await hotelRepository.flush();

    const hotels = await hotelRepository.find({ id: { $in: data.hotels.map((el) => el.id) } });
    // To do: Remove default known categories and accept categories from data
    const operatingHours = getDefaultOperatingHours([
      MealPeriod.Breakfast,
      MealPeriod.Lunch_Dinner,
      MealPeriod.Convenience
    ]);
    const defaultOperatingHours = plainToInstance(OperatingHoursValidation, operatingHours);
    const errors = await validateInput(defaultOperatingHours);
    if (errors.length > 0) {
      throw new ValidationError(errors);
    }

    hotels.forEach((hotel) => {
      wrap(hotel).assign({ operating_hours: operatingHours });
      wrap(hotel).assign({ menu_id: data.id });
    });

    await hotelRepository.flush();
  };

  return {
    hotelsAssigned
  };
};

export default async function hotelAction(event: any): Promise<void> {
  if (event.source === warmupkey) {
    console.log("WarmUP - Lambda is warm!");
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
  const hotelRepository = em.getRepository(Hotel);

  for (const record of event.Records) {
    const bodyParsed = JSON.parse(record.body);
    const { data } = bodyParsed;
    const messageAttributes = record.MessageAttributes || record.messageAttributes;
    switch (messageAttributes.eventName.StringValue || messageAttributes.eventName.stringValue) {
    case MENU_EVENT.HOTELS_ASSIGNED:
      await hotelEvents(hotelRepository).hotelsAssigned(data);
      break;
    default:
      throw new BadRequestError("Bad event name provided");
    }
  }
}

export { hotelAction, hotelEvents };
