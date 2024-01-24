"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Migration = require("@mikro-orm/migrations").Migration;

class Migration20220420131011 extends Migration {
  async up() {
    this.addSql("ALTER TABLE public.iam_user ADD oms_id bigint unique");
    this.addSql("ALTER TABLE public.iam_user ADD phone_number varchar(100)");
  }

  async down() {
    this.addSql("ALTER TABLE public.iam_user DROP COLUMN oms_id");
    this.addSql("ALTER TABLE public.iam_user DROP COLUMN phone_number");
  }
}
exports.Migration20220420131011 = Migration20220420131011;
