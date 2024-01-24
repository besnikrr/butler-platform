import {
  clearDatabase,
  ConflictError,
  getTestConnection,
  NotFoundError,
  seedDatabase
} from "@butlerhospitality/service-sdk";
import { MikroORM } from "@mikro-orm/core";
import path = require("path");
import { NetworkEntities } from "../../../entities";
import { ICreateHotelInput, ICreateHotelOutput } from "../create-hotel";
import Hub from "../../../hub/entity";
import Hotel from "../../entity";
import { generateMockHotel } from "../../../utils/mock-tests";
import updateHotel from "../update-hotel";
import { HotelRepository } from "../../repository";
import { HubRepository } from "../../../hub/repository";

const expectResponseToHaveKeys = (hub: ICreateHotelOutput) => {
  Object.getOwnPropertyNames(hub).forEach((property) => {
    expect(hub).toHaveProperty(property);
  });
};

const validateValuesToHave = (data: ICreateHotelOutput, hotel: ICreateHotelInput, hub: Hub) => {
  expect(data.name).toBe(hotel.name);
  expect(data.hub.id).toBe(hub.id);
  expect(data.formal_name).toBe(hotel.formal_name);
  expect(data.is_tax_exempt).toBe(hotel.is_tax_exempt);
  expect(data.active).toBe(hotel.active);
  expect(data.code).toBe(hotel.code);
  expect(data.address_street).toBe(hotel.address_street);
  expect(data.address_number).toBe(hotel.address_number);
  expect(data.address_town).toBe(hotel.address_town);
  expect(data.address_zip_code).toBe(hotel.address_zip_code);
  expect(data.address_coordinates).toBe(hotel.address_coordinates);
  expect(data.web_active).toBe(hotel.web_active);
  expect(data.web_phone).toBe(hotel.web_phone);
  expect(data.web_url_id).toBe(hotel.web_url_id);
  expect(data.web_code).toBe(hotel.web_code);
  expect(data.contact_person).toBe(hotel.contact_person);
  expect(data.contact_email).toBe(hotel.contact_email);
  expect(data.account_manager_id).toBe(hotel.account_manager_id);
  expect(data.room_count).toBe(hotel.room_count);
  expect(data.room_numbers).toBe(hotel.room_numbers);
  expect(data.delivery_instructions).toBe(hotel.delivery_instructions);
  expect(data.phone_number).toBe(hotel.phone_number);
};

describe("update hotel", () => {
  let orm: MikroORM;
  let hotelRepository: HotelRepository;
  let hubRepository: HubRepository;

  let hub: Hub;

  const mockHotel = generateMockHotel(false);
  const validUpdateHotelInput = generateMockHotel(false);
  const invalidUpdateHotelInput = generateMockHotel(true);

  let hotel: Hotel;
  let hotel2: Hotel;

  beforeAll(async () => {
    const connection = await getTestConnection(process.env.TEST_DB, NetworkEntities.asArray());
    await seedDatabase(connection, path.join(__dirname, "..", "..", "..", ".."));

    orm = connection;

    hotelRepository = orm.em.getRepository(Hotel);
    hubRepository = orm.em.getRepository(Hub);

    hub = await hubRepository.findOne({});
    hotel = await hotelRepository.findOne({});
    hotel2 = await hotelRepository.findOne({ id: { $ne: hotel.id } });
  });

  afterAll(async () => {
    await clearDatabase(orm);
    await orm?.close(true);
  });
  it("should update hotel", async () => {
    expect(hotel).toBeDefined();
    const updatedHotel = await updateHotel({
      hotelRepository,
      hubRepository
    })(hotel.id, { ...validUpdateHotelInput, hub_id: hub.id });
    expectResponseToHaveKeys(updatedHotel);
    validateValuesToHave(updatedHotel, validUpdateHotelInput, hub);
  });

  it("should throw not found when a hotel does not exist", async () => {
    await expect(async () => {
      await updateHotel({
        hotelRepository,
        hubRepository
      })(-1, {});
    }).rejects.toThrowError(NotFoundError);
  });

  it("should fail to update hotel due to constraint of duplicate hotel name", async () => {
    expect(hotel).toBeTruthy();
    expect(hotel2).toBeTruthy();
    await expect(async () => {
      await updateHotel({
        hotelRepository,
        hubRepository
      })(hotel2.id, { ...validUpdateHotelInput, hub_id: hub.id });
    }).rejects.toThrowError(ConflictError);
  });

  it("should throw not found error when trying to update a hotel with a hub that does not exist", async () => {
    await expect(async () => {
      await updateHotel({
        hotelRepository,
        hubRepository
      })(hotel.id, { ...mockHotel, hub_id: -1 });
    }).rejects.toThrowError(NotFoundError);
  });

  it("should fail to update hotel because of validation constraint", async () => {
    await expect(async () => {
      await updateHotel({
        hotelRepository,
        hubRepository
      })(hotel.id, { ...invalidUpdateHotelInput, hub_id: hub.id });
    }).rejects.toThrowError(Error);
  });
});
