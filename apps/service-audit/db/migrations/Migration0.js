"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Migration = require("@mikro-orm/migrations").Migration;

class Migration0 extends Migration {
  async up() {
    this.addSql(`DROP TABLE IF EXISTS "log";`);
    this.addSql(`CREATE TABLE "log" (
        "service" VARCHAR(50) NOT NULL,
        "entity_id" INT NOT NULL,
        "entity_table" VARCHAR(50) NOT NULL,
        "version" SMALLINT NOT NULL,
        "action" text check ("action" in ('CREATED', 'UPDATED', 'DELETED')) NOT NULL,
        "topic" VARCHAR(100) NOT NULL,
        "data" JSONB NOT NULL,
        "who" VARCHAR(50) NOT NULL,
        "when" TIMESTAMPTZ(0) NOT NULL,
        "timestamp" TIMESTAMPTZ(0) NOT NULL DEFAULT NOW(),
        PRIMARY KEY ("service", "entity_id", "entity_table", "version")
      );
      `
    );
  }

  async down() {
    // schema creation...
  }
}
exports.Migration0 = Migration0;
