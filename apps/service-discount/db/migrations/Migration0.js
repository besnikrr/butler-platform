'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
const Migration = require('@mikro-orm/migrations').Migration;

class Migration0 extends Migration {

  async up() {
    this.addSql('create table "discount" ("id" serial primary key, "created_at" timestamptz(0) not null default now(), "updated_at" timestamptz(0) null, "deleted_at" timestamptz(0) null, "oms_id" bigint null, "name" varchar(255) not null, "code" varchar(100) not null, "amount" numeric(19,2) not null, "start_date" timestamptz not null, "end_date" timestamptz null, "type" text check ("type" in (\'AMOUNT\', \'PERCENTAGE\')) not null, "usage" text check ("usage" in (\'SINGLE_USE\', \'MULTIPLE_USE\', \'DOLLAR_ALLOTMENT\')) not null, "unlock_limit" numeric(19,2) not null default 0);');
    this.addSql('alter table "discount" add constraint "discount_oms_id_unique" unique ("oms_id");');
    this.addSql('alter table "discount" add constraint "discount_code_unique" unique ("code");');

    this.addSql('create table "discount_client" ("id" serial primary key, "created_at" timestamptz(0) not null default now(), "updated_at" timestamptz(0) null, "deleted_at" timestamptz(0) null, "discount_id" int4 not null, "oms_id" bigint null, "amount_used" numeric(19,2) not null, "client_phone_number" varchar(50) not null);');
    this.addSql('alter table "discount_client" add constraint "discount_client_oms_id_unique" unique ("oms_id");');

    this.addSql('create table "hub" ("id" serial primary key, "created_at" timestamptz(0) not null default now(), "updated_at" timestamptz(0) null, "deleted_at" timestamptz(0) null, "name" varchar(255) not null, "active" bool not null, "oms_id" bigint null);');
    this.addSql('alter table "hub" add constraint "hub_oms_id_unique" unique ("oms_id");');

    this.addSql('create table "discount_hub" ("discount_id" int4 not null, "hub_id" int4 not null);');
    this.addSql('alter table "discount_hub" add constraint "discount_hub_pkey" primary key ("discount_id", "hub_id");');

    this.addSql('alter table "discount_client" add constraint "discount_client_discount_id_foreign" foreign key ("discount_id") references "discount" ("id") on update cascade;');

    this.addSql('alter table "discount_hub" add constraint "discount_hub_discount_id_foreign" foreign key ("discount_id") references "discount" ("id") on update cascade on delete cascade;');
    this.addSql('alter table "discount_hub" add constraint "discount_hub_hub_id_foreign" foreign key ("hub_id") references "hub" ("id") on update cascade on delete cascade;');
  }

}
exports.Migration0 = Migration0;
