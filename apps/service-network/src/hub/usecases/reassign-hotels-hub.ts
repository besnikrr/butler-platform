
import { wrap, Collection } from "@mikro-orm/core";
import { ConflictError, eventProvider, NotFoundError } from "@butlerhospitality/service-sdk";
import { HOTEL_EVENT, SNS_TOPIC, ENTITY } from "@butlerhospitality/shared";
import Hotel, { IHotelPublish } from "../../hotel/entity";
import { IHubRepository } from "../repository";
import { IHotelRepository } from "../../hotel/repository";
import { IHubPublish } from "../entity";

export interface IHotelHubs {
  hotelId: number;
  hubId: number;
}

export interface IReassignHotelsHubDependency {
  hubRepository: IHubRepository;
  hotelRepository: IHotelRepository;
}

export default (dependency: IReassignHotelsHubDependency) => {
  const { hubRepository, hotelRepository } = dependency;
  function validateHotelIds(hotels: Collection<Hotel>, hotelHubs: IHotelHubs[]) {
    hotels.getItems().forEach((hotel) => {
      if (!hotelHubs.find((element) => element.hotelId === hotel.id)) {
        return false;
      }
      return true;
    });
    return true;
  }

  return async (hotelHubs: IHotelHubs[], hubIdToDeactivate: number) => {
    const hubToDeactivate = await hubRepository.getOneEntityOrFail({ id: hubIdToDeactivate }, ["hotels"]);

    const length = hubToDeactivate.hotels.count();
    if (length !== hotelHubs.length) {
      throw new ConflictError("Please make sure to reassign all hotels!");
    }

    if (!validateHotelIds(hubToDeactivate.hotels, hotelHubs)) {
      throw new NotFoundError("Hotel ids are not relevant!");
    }

    const hubs = await hubRepository.find({ id: { $in: hotelHubs.map((el) => el.hubId) }, deleted_at: null });
    const hotels = await hotelRepository.find({ id: { $in: hotelHubs.map((el) => el.hotelId) }, deleted_at: null });

    const hotelsForEvent = [];

    hotelHubs.forEach((data) => {
      const hub = hubs.find((el) => el.id === data.hubId);
      if (!hub) {
        throw new NotFoundError("Hub not found");
      }

      if (!hub.active) {
        throw new ConflictError("You can not assign Hotel to an inactive Hub!");
      }

      const hotel = hotels.find((el) => el.id === data.hotelId);
      if (!hotel) {
        throw new NotFoundError("Hotel not found");
      }

      if (data.hubId === hubIdToDeactivate) {
        throw new ConflictError("Can not set deactivated hub on reassign hotels");
      }
      wrap(hotel).assign({ hub: data.hubId });
      hotelsForEvent.push(hotel);
    });

    await hotelRepository.flush();

    if (!hubToDeactivate) {
      throw new NotFoundError("Hub not found");
    }

    wrap(hubToDeactivate).assign({ active: false });
    await hubRepository.flush();

    for (const hotel of hotelsForEvent) {
      await eventProvider.client().publish<IHotelPublish>(
        SNS_TOPIC.NETWORK.HOTEL, HOTEL_EVENT.UPDATED, null, {
          entity: ENTITY.NETWORK.HOTEL,
          ...hotel
        }
      );
    }

    await eventProvider.client().publish<IHubPublish>(SNS_TOPIC.NETWORK.HUB, HOTEL_EVENT.UPDATED, null, {
      entity: ENTITY.NETWORK.HUB,
      ...hubToDeactivate
    });

    return hubRepository.findOne({ id: hubIdToDeactivate });
  };
};
