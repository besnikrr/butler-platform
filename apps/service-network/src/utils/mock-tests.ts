
import { faker } from "@faker-js/faker";
import { ICreateCityInput } from "../city/usecases/create-city";
import { ICreateHotelInput } from "../hotel/usecases/create-hotel";
import { ICreateHubInput } from "../hub/usecases/create-hub";

const generateMockCity = (nullable: boolean): ICreateCityInput => {
  const mockCity: ICreateCityInput = {
    name: nullable ? null : `City ${faker.address.zipCodeByState("??")} ${faker.address.zipCodeByState("??")}`,
    time_zone: nullable ? null : faker.address.timeZone(),
    state: nullable ? null : faker.address.state()
  };

  return mockCity;
};

const generateMockHub = (nullable: boolean): ICreateHubInput => {
  const mockHub: ICreateHubInput = {
    name: nullable ? null : `Hub ${faker.address.zipCodeByState("??")} ${faker.address.zipCodeByState("??")}`,
    city_id: null,
    active: true,
    contact_email: nullable ? null : faker.internet.email(),
    contact_phone: nullable ? null : faker.phone.phoneNumber(),
    address_town: nullable ? null : faker.address.city(),
    address_street: nullable ? null : faker.address.streetAddress(),
    address_number: nullable ? null : faker.random.alpha(),
    address_zip_code: nullable ? null : faker.address.zipCode(),
    tax_rate: nullable ? null : 20,
    address_coordinates: nullable ? null : "1, 1",
    has_nextmv_enabled: false,
    color: faker.internet.color(),
    has_expeditor_app_enabled: false
  };
  return mockHub;
};

const generateMockHotel = (nullable: boolean): ICreateHotelInput => {
  const code = Math.random().toString(36).substring(2, 7);
  const web_code = Math.random().toString(36).substring(2, 5);

  const mockHotel: ICreateHotelInput = {
    name: nullable ? null : `Hotel ${faker.address.zipCodeByState("??")} ${faker.address.zipCodeByState("??")}`,
    hub_id: null,
    formal_name: nullable ? null : faker.random.word(),
    is_tax_exempt: false,
    active: false,
    code: nullable ? null : `${faker.address.zipCodeByState("??")} ${faker.address.zipCodeByState("??")}`,
    address_street: nullable ? null : faker.address.streetAddress(),
    address_number: nullable ? null : faker.random.alpha(),
    address_town: nullable ? null : faker.address.city(),
    address_zip_code: nullable ? null : faker.address.zipCode(),
    address_coordinates: nullable ? null : "(1, 1)",
    web_active: false,
    web_phone: nullable ? null : faker.phone.phoneNumber(),
    web_url_id: nullable ? null : `${faker.address.zipCodeByState("??")} ${faker.address.zipCodeByState("??")}`,
    web_code: nullable ? null : `${faker.address.zipCodeByState("??")} ${faker.address.zipCodeByState("??")}`,
    contact_person: nullable ? null : faker.random.alpha(),
    contact_email: nullable ? null : faker.random.alpha(),
    account_manager_id: nullable ? null : 2,
    room_count: nullable ? null : 23,
    room_numbers: null,
    delivery_instructions: nullable ? null : faker.random.alpha(),
    allow_payment_room_charge: true,
    allow_payment_credit_card: true,
    allow_scheduled_orders: true,
    has_vouchers_enabled: true,
    has_pms_enabled: false,
    has_car_service_enabled: true,
    has_activities_enabled: true,
    phone_number: nullable ? null : faker.phone.phoneNumber()
  };
  return mockHotel;
};

export { generateMockCity, generateMockHub, generateMockHotel };
