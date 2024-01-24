
import { CustomEntityRepository } from "@butlerhospitality/service-sdk";
import Hotel from "./entity";

export interface IHotelRepository extends CustomEntityRepository<Hotel> {}
export class HotelRepository extends CustomEntityRepository<Hotel> implements IHotelRepository {}
