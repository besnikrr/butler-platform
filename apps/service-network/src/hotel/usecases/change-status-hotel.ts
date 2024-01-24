import { wrap } from "@mikro-orm/core";
import { eventProvider } from "@butlerhospitality/service-sdk";
import { HOTEL_EVENT, ENTITY, SNS_TOPIC } from "@butlerhospitality/shared";
import { IHotelPublish } from "../entity";
import { IHotelRepository } from "../repository";

export interface IChangeStatusHotelDependency {
  hotelRepository: IHotelRepository;
}

export default (dependency: IChangeStatusHotelDependency) => {
  const { hotelRepository } = dependency;
  return async (id: number, status: boolean) => {
    const hotel = await hotelRepository.getOneEntityOrFail({ id });

    wrap(hotel).assign({ active: status });
    await hotelRepository.flush();
    await eventProvider.client().publish<IHotelPublish>(
      SNS_TOPIC.NETWORK.HOTEL, HOTEL_EVENT.UPDATED, null, {
        entity: ENTITY.NETWORK.HOTEL,
        ...hotel
      }
    );

    return hotel;
  };
};
