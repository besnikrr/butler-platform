Object.defineProperty(exports, "__esModule", { value: true });
const { Migration } = require("@mikro-orm/migrations");

class Migration20220405125907 extends Migration {
  async up() {
    this.addSql("ALTER TABLE public.hotel ADD menu_id int");
  }

  async down() {
    this.addSql("ALTER TABLE public.hotel DROP COLUMN menu_id");
  }
}
exports.Migration20220405125907 = Migration20220405125907;
