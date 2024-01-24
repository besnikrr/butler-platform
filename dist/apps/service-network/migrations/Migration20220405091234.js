"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Migration = require("@mikro-orm/migrations").Migration;

class Migration20220405091234 extends Migration {
  async up() {
    this.addSql("ALTER TABLE public.city ADD voice_url varchar(255)");
  }

  async down() {
    this.addSql("ALTER TABLE public.city DROP COLUMN voice_url");
  }
}
exports.Migration20220405091234 = Migration20220405091234;
