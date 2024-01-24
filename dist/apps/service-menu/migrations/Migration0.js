"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Migration = require("@mikro-orm/migrations").Migration;

class Migration20220214135442 extends Migration {
  async up() {
    this.addSql(`
      
drop table if exists hub cascade;
create table hub(
  id int not null,
  name varchar(255),
  oms_id bigint unique,
  active boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz,
  deleted_at timestamptz,
  primary key (id)
);

drop table if exists hotel cascade;
create table hotel(
  id int not null,
  name varchar(500) not null,
  hub_id int not null,
  oms_id bigint unique,
  active boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz,
  deleted_at timestamptz,
  primary key (id),
  foreign key (hub_id) references hub(id)
);

drop table if exists category cascade;
create table category(
  id serial not null,
  name varchar(255) not null,
  parent_category_id int,
  start_date date,
  end_date date,
  oms_id bigint unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz,
  deleted_at timestamptz,
  primary key (id),
  foreign key (parent_category_id) references category(id) on delete cascade
);


drop table if exists product cascade;
create table product(
  id serial not null,
  name varchar(255) not null,
  price numeric(19,2) not null,
  description varchar(500),
  needs_cutlery boolean not null default false,
  guest_view boolean not null default false,
  raw_food boolean not null default false,
  image varchar(255) not null,
  image_base_url varchar(255) not null,
  oms_id bigint unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz,
  deleted_at timestamptz,
  primary key (id)
);

drop table if exists modifier cascade;
create table modifier(
  id serial not null,
  name varchar(255) not null,
  multiselect boolean not null default false,
  oms_id bigint unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz,
  deleted_at timestamptz,
  primary key (id)
);

drop table if exists modifier_option cascade;
create table modifier_option(
  id serial not null,
  name varchar(255) not null,
  price numeric(19,2) not null,
  modifier_id int not null,
  oms_id bigint unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz,
  deleted_at timestamptz,
  primary key (id),
  foreign key (modifier_id) references modifier(id)
);

drop table if exists menu cascade;
create table menu(
  id serial not null,
  name varchar(255) not null,
  status varchar(50) not null default 'INACTIVE',
  oms_id bigint unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz,
  deleted_at timestamptz,
  primary key (id)
);

drop table if exists menu_hotel cascade;
create table menu_hotel(
  hotel_id int not null,
  menu_id int not null,
  foreign key (hotel_id) references hotel(id) on delete cascade,
  foreign key (menu_id) references menu(id) on delete cascade,
  primary key (hotel_id, menu_id)
);

CREATE UNIQUE INDEX index_mh_menu_id_hotel_id ON menu_hotel (menu_id, hotel_id);

drop table if exists product_category cascade;
create table product_category(
    product_id int not null,
    category_id int not null,
    primary key (product_id, category_id),
    foreign key (product_id) references product(id) on delete cascade,
    foreign key (category_id) references category(id) on delete cascade
);
CREATE UNIQUE INDEX index_pc_category_id_product_id ON product_category (category_id, product_id);

drop table if exists product_menu cascade;
create table product_menu(
  product_id int not null,
  category_id int not null,
  menu_id int not null,
  sort_order smallint default 0,
  price numeric (19,2),
  is_popular boolean not null default false,
  is_favorite boolean not null default false,
  suggested_items json[] not null default '{}',
  oms_id bigint unique,
  primary key (product_id, category_id, menu_id),
  foreign key (menu_id) references menu(id) on delete cascade,
  foreign key (product_id) references product(id) on delete cascade,
  foreign key (category_id) references category(id) on delete cascade
);

drop table if exists product_modifier cascade;
create table product_modifier(
    product_id int not null,
    modifier_id int not null,
    oms_id bigint unique,
    primary key (product_id, modifier_id),
    foreign key (modifier_id) references modifier(id) on delete cascade,
    foreign key (product_id) references product(id) on delete cascade
);
CREATE UNIQUE INDEX index_productmodifier_modifier_id_product_id ON product_modifier (modifier_id, product_id);

drop table if exists out_of_stock cascade;
create table out_of_stock(
    id serial not null,
    product_id int not null,
    hub_id int not null,
    oms_id bigint unique,
    available_at timestamptz not null,
    created_at timestamptz not null default now(),
    updated_at timestamptz,
    deleted_at timestamptz,
    primary key (id),
    foreign key (hub_id) references hub(id) on delete cascade,
    foreign key (product_id) references product(id) on delete cascade
);

CREATE UNIQUE INDEX index_oos_product_id_hub_id_deleted_at_key ON out_of_stock (product_id, hub_id, deleted_at) WHERE deleted_at IS NULL;
      `);
  }

  async down() {
    // schema creation...
  }
}
exports.Migration20220214135442 = Migration20220214135442;
