Object.defineProperty(exports, "__esModule", { value: true });
const { Migration } = require("@mikro-orm/migrations");

class Migration20220307124416 extends Migration {
  async up() {
    this.addSql("ALTER TABLE public.hub ALTER COLUMN tax_rate TYPE numeric");
  }

  async down() {
    this.addSql("ALTER TABLE public.hub ALTER COLUMN tax_rate TYPE numeric(10,2)");
  }
}
exports.Migration20220307124416 = Migration20220307124416;
