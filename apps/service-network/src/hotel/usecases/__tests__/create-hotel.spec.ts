import {
  clearDatabase,
  ConflictError,
  CustomEntityRepository,
  getTestConnection,
  NotFoundError,
  seedDatabase
} from "@butlerhospitality/service-sdk";
import { MikroORM, NotNullConstraintViolationException } from "@mikro-orm/core";
import { generateMockHotel } from "../../../utils/mock-tests";
import { NetworkEntities } from "../../../entities";
import createHotel, { ICreateHotelOutput } from "../create-hotel";
import Hub from "../../../hub/entity";
import Hotel from "../../entity";
import { HotelRepository } from "../../repository";
import path = require("path");

const provisionPhoneNumberMocked = jest.fn();
jest.mock("@butlerhospitality/service-sdk", () => {
  const originalModule = jest.requireActual("@butlerhospitality/service-sdk");
  originalModule.communicationClient = () => {
    return {
      provisionPhoneNumber: provisionPhoneNumberMocked
    };
  };
  return originalModule;
});

const expectResponseToHaveKeys = (hub: ICreateHotelOutput) => {
  Object.getOwnPropertyNames(hub).forEach((property) => {
    expect(hub).toHaveProperty(property);
  });
};

const validateValuesToHave = (data: ICreateHotelOutput, hotel: ICreateHotelOutput, hub: Hub) => {
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
};

describe("create hotel", () => {
  let orm: MikroORM;
  let hotelRepository: HotelRepository;
  let hubRepository: CustomEntityRepository<Hub>;

  let hub: Hub;
  let hotel: ICreateHotelOutput;

  const validCreateHotelInput = generateMockHotel(false);
  const validCreateHotelInput2 = generateMockHotel(false);
  const invalidCreateHotelInput = generateMockHotel(true);
  beforeAll(async () => {
    const connection = await getTestConnection(process.env.TEST_DB, NetworkEntities.asArray());
    await seedDatabase(connection, path.join(__dirname, "..", "..", "..", ".."));

    orm = connection;

    hotelRepository = orm.em.getRepository(Hotel);
    hubRepository = orm.em.getRepository(Hub);
    hub = await hubRepository.findOne({});
  });

  afterAll(async () => {
    await clearDatabase(orm);
    await orm?.close(true);
  });

  beforeEach(() => {
    jest.restoreAllMocks();
    jest.resetAllMocks();
  });

  it("should create hotel", async () => {
    hotel = await createHotel({
      hotelRepository,
      hubRepository
    })(validCreateHotelInput, false);
    expect(hub).toBeTruthy();
    expectResponseToHaveKeys(hotel);
    validateValuesToHave(hotel, hotel, hub);
    expect(provisionPhoneNumberMocked).toHaveBeenCalled();
  });

  it("should not create hotel due to constraint of duplicate hotel name", async () => {
    await expect(async () => {
      await createHotel({
        hotelRepository,
        hubRepository
      })(validCreateHotelInput);
    }).rejects.toThrowError(ConflictError);
  });

  it("should throw not found error when trying to save hotel with a hub that does not exist", async () => {
    await expect(async () => {
      await createHotel({
        hotelRepository,
        hubRepository
      })({
        ...validCreateHotelInput2,
        hub_id: -1
      }, false);
    }).rejects.toThrowError(NotFoundError);
  });

  it("should not create hotel because of validation constraints", async () => {
    expect(hotel).toBeTruthy();
    await expect(async () => {
      await createHotel({
        hotelRepository,
        hubRepository
      })(invalidCreateHotelInput, false);
    }).rejects.toThrowError(NotNullConstraintViolationException);
  });
});
