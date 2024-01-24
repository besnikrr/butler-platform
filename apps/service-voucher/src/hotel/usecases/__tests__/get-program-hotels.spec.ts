import { clearDatabase, getTestConnection, seedDatabase } from "@butlerhospitality/service-sdk";
import { EntityManager, Knex } from "@mikro-orm/postgresql";
import { MikroORM } from "@mikro-orm/core";
import * as path from "path";
import { VoucherEntities } from "../../../entities";
import getProgramHotels, { IProgramFilter } from "../get-program-hotels";
import Hotel from "../../entities/hotel";
import { VoucherType } from "@butlerhospitality/shared";

describe("get multiple program hotels", () => {
  let orm: MikroORM;
  let knex: Knex;
  beforeAll(async () => {
    orm = await getTestConnection(process.env.TEST_DB, VoucherEntities.asArray());
    await seedDatabase(orm, path.join(__dirname, "..", "..", "..", ".."));
    knex = (orm.em as EntityManager).getKnex();
  });

  const validateOutput = (hotels: Hotel[], filters: IProgramFilter) => {
    expect(hotels.length).toBeTruthy();
    hotels.forEach((hotel: Hotel) => {
      if (filters.hotelName) {
        expect(hotel.name).toContain(filters.hotelName);
      }
      expect(filters.programType.sort()).toEqual(hotel.program_types.sort());
    });
  };

  it("should get multiple program hotels of type DISCOUNT", async () => {
    const filters: IProgramFilter = {
      limit: 10,
      page: 1,
      programType: [VoucherType.DISCOUNT]
    };

    const [programHotels] = await getProgramHotels({ knex })(filters);
    validateOutput(programHotels, filters);
  });

  it("should get multiple program hotels of type PRE_FIXE", async () => {
    const filters: IProgramFilter = {
      limit: 10,
      page: 1,
      programType: [VoucherType.PRE_FIXE]
    };

    const [programHotels] = await getProgramHotels({ knex })(filters);
    validateOutput(programHotels, filters);
  });

  it("should get multiple program hotels of type PER_DIEM", async () => {
    const filters: IProgramFilter = {
      limit: 10,
      page: 1,
      programType: [VoucherType.PER_DIEM]
    };

    const [programHotels] = await getProgramHotels({ knex })(filters);
    validateOutput(programHotels, filters);
  });

  afterAll(async () => {
    await clearDatabase(orm);
    await orm?.close(true);
  });
});
