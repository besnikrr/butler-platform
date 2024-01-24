"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Migration = require("@mikro-orm/migrations").Migration;

class Migration20220421091739 extends Migration {
  async up() {
		this.addSql(`
			ALTER TABLE product ADD is_active BOOLEAN DEFAULT true NOT NULL;
		`);
	 }

	 async down() {
		 this.addSql(`
			 ALTER TABLE product DROP COLUMN is_active;
		 `);
	 }
}
exports.Migration20220421091739 = Migration20220421091739;
