"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Migration = require("@mikro-orm/migrations").Migration;

class Migration20220426120056 extends Migration {
	async up() {
    this.addSql("ALTER TABLE hotel ADD phone_number VARCHAR(255)");
  }

  async down() {
    this.addSql("ALTER TABLE hotel DROP COLUMN phone_number");
  }
}
exports.Migration20220426120056 = Migration20220426120056;
