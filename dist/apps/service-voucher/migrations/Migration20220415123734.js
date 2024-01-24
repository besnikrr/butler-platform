"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Migration = require("@mikro-orm/migrations").Migration;

class Migration20220415123734 extends Migration {
  async up() {
    this.addSql("create table \"discount\" (\"id\" serial primary key, \"name\" varchar(255) not null, \"code\" varchar(100) not null, \"amount\" numeric(19,2) not null, \"type\" text check (\"type\" in ('AMOUNT', 'PERCENTAGE')) not null, \"usage\" text check (\"usage\" in ('SINGLE_USE', 'MULTIPLE_USE', 'DOLLAR_ALLOTMENT')) not null, \"unlock_limit\" numeric(19,2) not null default 0, \"start_date\" timestamptz not null, \"end_date\" timestamptz null, \"hub_ids\" bigint[] not null default '{}', \"created_at\" timestamptz(0) not null default now(), \"updated_at\" timestamptz(0) null, \"deleted_at\" timestamptz(0) null);");
    this.addSql("alter table \"discount\" add constraint \"discount_code_unique\" unique (\"code\");");
  }

  async down() {
    this.addSql("drop table \"discount\"");
  }
}
exports.Migration20220415123734 = Migration20220415123734;
