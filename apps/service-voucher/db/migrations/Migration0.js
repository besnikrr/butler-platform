Object.defineProperty(exports, "__esModule", { value: true });
const { Migration } = require("@mikro-orm/migrations");

class Migration20220214135442 extends Migration {
  async up() {
    this.addSql(`
      
    drop table if exists hub cascade;
create table hub(
  id int not null,
  name varchar(255) not null,
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
  active boolean not null default false,
  oms_id bigint unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz,
  deleted_at timestamptz,
  primary key (id),
  foreign key (hub_id) references hub(id)
);

drop table if exists category cascade;
create table category(
  id int not null,
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

drop table if exists program cascade;
create table program(
  id serial not null,
  name varchar(255) not null,
  description varchar(500),
  type varchar(50) not null,
  status varchar(50) not null default 'ACTIVE',
  payer varchar(255) not null,
  payer_percentage numeric(19, 2) not null,
  amount numeric(19, 2) not null,
  amount_type varchar(50) not null,
  code_limit smallint,
  oms_id bigint unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz,
  deleted_at timestamptz,
  primary key (id)
);

drop table if exists code cascade;
create table code(
  id serial not null,
  code varchar(255) not null,
  program_id int not null,
  order_id int,
  hotel_id int not null,
  amount_used numeric(19, 2),
  oms_id bigint unique,
  claimed_date timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz,
  deleted_at timestamptz,
  primary key (id),
  foreign key (program_id) references program(id)
);

drop table if exists rule cascade;
create table rule(
  id serial not null,
  program_id int not null,
  quantity smallint not null default 1,
  max_price numeric(19, 2),
  oms_id bigint unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz,
  deleted_at timestamptz,
  primary key (id),
  foreign key (program_id) references program(id)
);

drop table if exists rule_category cascade;
create table rule_category(
  rule_id int not null,
  category_id int not null,
  primary key (rule_id, category_id),
  foreign key (rule_id) references rule(id),
  foreign key (category_id) references category(id)
);

drop table if exists program_hotel cascade;
create table program_hotel(
  program_id int not null,
  hotel_id int not null,
  primary key (program_id, hotel_id),
  foreign key (program_id) references program(id),
  foreign key (hotel_id) references hotel(id)
);

    `);
  }

  async down() {
    // schema creation...
  }
}
exports.Migration20220214135442 = Migration20220214135442;
