import Hotel from "../entity";
import { MikroORM } from "@mikro-orm/core";
import { HotelRepository } from "../repository";
import { BadRequestError } from "@butlerhospitality/service-sdk";

export interface IValidateHotelHasVouchersDependency {
  connection: MikroORM;
}

export default (
  dependency: IValidateHotelHasVouchersDependency
) => {
  return async (id: number): Promise<boolean> => {
    const repo = dependency.connection.em.getRepository(Hotel) as HotelRepository;
    const hotel = await repo.getOneEntityOrFail(id, ["hub"]);

    if (!hotel.has_vouchers_enabled) {
      throw new BadRequestError("This hotel does not have vouchers enabled.");
    }

    return true;
  };
};
