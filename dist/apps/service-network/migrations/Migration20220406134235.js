"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Migration = require("@mikro-orm/migrations").Migration;

class Migration20220406134235 extends Migration {
  async up() {
    this.addSql("ALTER TABLE public.hotel ADD menu_id numeric");
  }

  async down() {
    this.addSql("ALTER TABLE public.hotel DROP COLUMN menu_id");
  }
}
exports.Migration20220406134235 = Migration20220406134235;
