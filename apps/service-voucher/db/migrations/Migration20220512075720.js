"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Migration = require("@mikro-orm/migrations").Migration;

class Migration20220512075720 extends Migration {
  async up() {
    this.addSql("UPDATE public.code SET amount_used = 0.0 WHERE amount_used IS NULL;");
    this.addSql("ALTER TABLE public.code ALTER COLUMN amount_used SET DEFAULT 0.0;");
    this.addSql("ALTER TABLE public.code ALTER COLUMN amount_used SET NOT NULL;");
  }

  async down() {
    this.addSql("ALTER TABLE public.code ALTER COLUMN amount_used DROP NOT NULL;");
    this.addSql("ALTER TABLE public.code ALTER COLUMN amount_used DROP DEFAULT;");
  }
}
exports.Migration20220512075720 = Migration20220512075720;
