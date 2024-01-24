import { ENTITY, SNS_TOPIC, HOTEL_EVENT } from "@butlerhospitality/shared";
import { eventProvider } from "@butlerhospitality/service-sdk";
import { IHotelRepository } from "../repository";

export interface IDeleteHotelDependency {
  hotelRepository: IHotelRepository;
}

export default (dependency: IDeleteHotelDependency) => {
  const { hotelRepository } = dependency;
  return async (id: number): Promise<boolean> => {
    const deleted = await hotelRepository.softDelete(id);
    await eventProvider.client().publish<{ id: number; entity: string }>(
      SNS_TOPIC.NETWORK.HOTEL, HOTEL_EVENT.DELETED, null, {
        id,
        entity: ENTITY.NETWORK.HOTEL
      }
    );

    return deleted;
  };
};
