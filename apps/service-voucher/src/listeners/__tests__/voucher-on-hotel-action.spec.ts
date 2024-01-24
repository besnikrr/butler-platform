import {
  clearDatabase, getTestConnection, NotFoundError, seedDatabase
} from "@butlerhospitality/service-sdk";
import { Collection, MikroORM } from "@mikro-orm/core";
import * as path from "path";
import Hotel from "../../hotel/entities/hotel";
import { HotelRepository } from "../../hotel/repository";
import { VoucherEntities } from "../../entities";
import { hotelEvents } from "../voucher-on-hotel-action";
import Program from "../../program/entities/program";
import { HubRepository } from "../../hub/repository";
import Hub from "../../hub/entities/hub";
import { VoucherType } from "@butlerhospitality/shared";
describe("hotel event listener", () => {
  let orm: MikroORM;
  const data: Hotel = {
    id: 9,
    name: "hotel from test",
    hub: {
      id: 2,
      active: true,
      name: "Test",
      created_at: new Date(),
      hotels: new Collection<Hotel>(this)
    },
    program_types: [],
    getProgramTypes: (): VoucherType[] => [],
    programs: new Collection<Program>(this),
    active: true,
    created_at: new Date()
  };
  const context = {};
  let hotelRepository: HotelRepository;
  let hubRepository: HubRepository;
  beforeAll(async () => {
    orm = await getTestConnection(process.env.TEST_DB, VoucherEntities.asArray());
    await seedDatabase(orm, path.join(__dirname, "..", "..", ".."));
    hotelRepository = orm.em.getRepository(Hotel);
    hubRepository = orm.em.getRepository(Hub);
  });

  it("should create hotel", async () => {
    await hotelEvents(hotelRepository, hubRepository).hotelCreated(context, data);
    const hotel = await hotelRepository.getOneEntityOrFail(data.id);
    expect(hotel).toBeDefined();
  });
  it("should update hotel", async () => {
    await hotelEvents(hotelRepository).hotelUpdated(context, data);
    const hotel = await hotelRepository.getOneEntityOrFail(data.id);
    expect(hotel).toBeDefined();
    expect(hotel.name).toBe(data.name);
  });
  it("should delete hotel", async () => {
    await hotelEvents(hotelRepository).hotelDeleted(context, data);

    expect(async () => {
      await hotelRepository.getOneEntityOrFail(data.id);
    }).rejects.toThrowError(NotFoundError);
  });

  afterAll(async () => {
    await clearDatabase(orm);
    await orm?.close(true);
  });
});
