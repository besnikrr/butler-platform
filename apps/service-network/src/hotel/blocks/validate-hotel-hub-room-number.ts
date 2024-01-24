import Hotel from "../entity";
import { MikroORM } from "@mikro-orm/core";
import { IHotelRepository } from "../repository";
import { BadRequestError } from "@butlerhospitality/service-sdk";
import { PaymentType } from "@butlerhospitality/shared";

export interface IGetHotelDependency {
  connection: MikroORM;
}

export interface IGetHotelDependenciesInput {
  hotelId: number;
  hotelName: string;
  hubId: number;
  hubName: string;
  menuId: number;
  roomNumber: string;
  paymentType: PaymentType;
}

export interface IHubFilter {
  id: number,
  name: string,
  active: boolean;
}
export interface IHotelFilter {
  id: number,
  active: boolean,
  hub: IHubFilter,
  room_numbers?: string,
  allow_payment_credit_card?: boolean,
  allow_payment_room_charge?: boolean;
}

export default (
  dependency: IGetHotelDependency
) => {
  return async (input: IGetHotelDependenciesInput): Promise<boolean> => {
    const repo = dependency.connection.em.getRepository(Hotel) as IHotelRepository;
    const hotel = await repo.getOneEntityOrFail(input.hotelId, ["hub"]);

    if (hotel.name !== input.hotelName) {
      throw new BadRequestError("Hotel name is incorrect.");
    }

    if (!hotel.active) {
      throw new BadRequestError("Hotel is not active.");
    }

    if (hotel.hub.id !== input.hubId) {
      throw new BadRequestError("The hub of this hotel is not correct.");
    }

    if (!hotel.hub.active) {
      throw new BadRequestError("Hub is not active.");
    }

    if (hotel.hub.name !== input.hubName) {
      throw new BadRequestError("Hub name is incorrect.");
    }

    if (input.paymentType === PaymentType.CREDIT_CARD && !hotel.allow_payment_credit_card) {
      throw new BadRequestError("Payment card is not allowed for this hotel.");
    }

    if (input.paymentType === PaymentType.CHARGE_TO_ROOM && !hotel.allow_payment_room_charge) {
      throw new BadRequestError("Charge to room is not allowed for this hotel.");
    }

    if (hotel.room_numbers && Object.values(hotel.room_numbers).length > 0) {
      const hotelRooms = Object.values(hotel.room_numbers);

      if (hotelRooms.length > 0 && !hotelRooms.includes(input.roomNumber)) {
        throw new BadRequestError("Room number is not valid.");
      }
    }

    return true;
  };
};
