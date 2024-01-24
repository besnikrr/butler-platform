"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Migration = require("@mikro-orm/migrations").Migration;

class Migration20220429145857 extends Migration {
  async up() {
    this.addSql(`
    create table label(
      id serial not null,
      name varchar(255) not null unique,
      oms_id bigint unique,
      created_at timestamptz not null default now(),
      updated_at timestamptz,
      deleted_at timestamptz,
      primary key (id)
    );

    create table product_labels(
      product_id int not null,
      label_id int not null,
      primary key (product_id, label_id),
      foreign key (product_id) references product(id),
      foreign key (label_id) references label(id)
    );
		`);
  }

  async down() {
    this.addSql(`
      drop table if exists product_labels cascade;
      drop table if exists label cascade;
		 `);
  }
}
exports.Migration20220429145857 = Migration20220429145857;
