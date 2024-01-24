"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Migration = require("@mikro-orm/migrations").Migration;

class Migration20220421110647 extends Migration {
  async up() {
    this.addSql("ALTER TABLE public.hotel ADD service_fee jsonb DEFAULT '[]'");
  }

  async down() {
    this.addSql("ALTER TABLE public.hotel DROP COLUMN service_fee");
  }
}
exports.Migration20220421110647 = Migration20220421110647;
