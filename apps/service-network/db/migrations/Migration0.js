Object.defineProperty(exports, "__esModule", { value: true });
const { Migration } = require("@mikro-orm/migrations");

class Migration0 extends Migration {
  async up() {
    this.addSql(`
    drop table if exists iam_user cascade;
    create table iam_user (
      id int not null,
      name varchar(255),
      email varchar(255) unique,
      status varchar(255),
      roles jsonb default '[]',
      created_at timestamptz not null default now(),
      updated_at timestamptz,
      deleted_at timestamptz,
      primary key (id)
    );
    
    
    ----- City -----
    drop table if exists city cascade;
    
    create table city(
      id serial not null,
      oms_id bigint unique,
      name varchar(255) not null,
      state varchar(255),
      time_zone varchar(255) not null,
      created_at timestamptz not null default now(),
      updated_at timestamptz,
      deleted_at timestamptz,
      primary key (id)
    );
    
    ----- Hub -----
    drop table if exists hub cascade;
    
    create table hub(
      -- basic
      id serial not null,
      oms_id bigint unique,
      city_id int not null,
      name varchar(255) not null,
      active boolean not null default true,
      tax_rate numeric(10, 2),
      -- contact
      contact_phone varchar(255),
      contact_email varchar(255),
      -- address
      address_street varchar(255),
      address_number varchar(255),
      address_town varchar(255),
      address_zip_code varchar(255),
      address_coordinates point,
      -- configs
      has_nextmv_enabled boolean not null default false,
      has_expeditor_app_enabled boolean not null default false,
      -- audit fields
      created_at timestamptz not null default now(),
      updated_at timestamptz,
      deleted_at timestamptz,
      primary key (id),
      foreign key (city_id) references city(id)
    );
    
    ----- Hotel -----
    drop table if exists hotel cascade;
    create table hotel(
      -- basic
      id serial not null,
      oms_id bigint unique,
      hub_id int not null,
      name varchar(500) not null,
      formal_name varchar(255),
      is_tax_exempt boolean not null default false,
      active boolean not null default true,
      code varchar(255),
      -- address
      address_street varchar(255),
      address_number varchar(255),
      address_town varchar(255),
      address_zip_code varchar(255),
      address_coordinates point,
      -- web
      web_active boolean not null default false,
      web_phone varchar(255),
      web_url_id varchar(255),
      web_code varchar(255),
      -- contact
      contact_person varchar(255),
      contact_email text,
      account_manager_id int,
      -- room
      room_count int,
      room_numbers jsonb,
      delivery_instructions varchar(500),
      reskin_config jsonb,
      -- payment / orders
      allow_payment_room_charge boolean not null default false,
      allow_payment_credit_card boolean not null default false,
      allow_scheduled_orders boolean not null default false,
      -- config for services
      has_vouchers_enabled boolean not null default false,
      has_pms_enabled boolean not null default false,
      has_car_service_enabled boolean not null default false,
      has_activities_enabled boolean not null default false,
      -- menu
      operating_hours jsonb default '[]',
      -- audit fields
      created_at timestamptz not null default now(),
      updated_at timestamptz,
      deleted_at timestamptz,
      primary key (id),
      foreign key (hub_id) references hub(id),
      foreign key (account_manager_id) references iam_user(id)
    );
    `);
  }

  async down() {
    // schema creation...
  }
}
exports.Migration0 = Migration0;
