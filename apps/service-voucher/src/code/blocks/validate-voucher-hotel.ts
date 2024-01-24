import { BadRequestError } from "@butlerhospitality/service-sdk";
import { IHotelRepository } from "../../hotel/repository";
import { ICodeRepository } from "../repository";

interface IValidateVoucherHotelDependency {
  codeRepository: ICodeRepository;
  hotelRepository: IHotelRepository;
}

export default (dependency: IValidateVoucherHotelDependency) => {
  return async (codeId: number, hotelId: number) => {
    const code = await dependency.codeRepository.findOne(codeId, ["program.hotels"]);
    const hotel = await dependency.hotelRepository.findOne(hotelId);

    if (!code.program.hotels.contains(hotel)) {
      throw new BadRequestError(`This voucher does not belong to the given hotel.`);
    }
  };
};
