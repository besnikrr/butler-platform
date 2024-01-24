
import { CustomEntityRepository } from "@butlerhospitality/service-sdk";
import City from "./entity";

export interface ICityRepository extends CustomEntityRepository<City> {}
export class CityRepository extends CustomEntityRepository<City> implements ICityRepository {}
