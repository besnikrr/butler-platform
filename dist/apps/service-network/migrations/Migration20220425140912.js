"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Migration = require("@mikro-orm/migrations").Migration;

class Migration20220420131011 extends Migration {
  async up() {
    this.addSql("ALTER TABLE public.hub ADD color varchar(50) NOT NULL DEFAULT '#004438'");
  }

  async down() {
    this.addSql("ALTER TABLE public.hub DROP COLUMN color");
  }
}
exports.Migration20220420131011 = Migration20220420131011;
