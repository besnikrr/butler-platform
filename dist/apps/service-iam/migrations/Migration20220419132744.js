"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Migration = require("@mikro-orm/migrations").Migration;

class Migration20220419132744 extends Migration {
  async up() {
    this.addSql(`ALTER TABLE public.iam_user ADD oms_id bigint unique`);
    this.addSql(`
      create table hub(
        id int not null,
        name varchar(255) not null,
        oms_id bigint unique,
        active boolean not null default true,
        created_at timestamptz not null default now(),
        updated_at timestamptz,
        deleted_at timestamptz,
        primary key (id)
      );

      create table iam_user_hub (
        user_id int not null,
        hub_id int not null,
        is_active boolean not null default false,
        is_default boolean not null default false,
        foreign key (user_id) references iam_user(id),
        foreign key (hub_id) references hub(id),
        primary key(user_id, hub_id)
      );
    `);
  }

  async down() {
    this.addSql("ALTER TABLE public.iam_user DROP COLUMN oms_id");
    this.addSql(`
      DROP TABLE IF EXISTS hub, iam_user_hub;
    `);
  }
}
exports.Migration20220419132744 = Migration20220419132744;
