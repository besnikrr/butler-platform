'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
const Migration = require('@mikro-orm/migrations').Migration;

class Migration20220303141102 extends Migration {

  async up() {
   this.addSql(`
      ALTER TABLE out_of_stock ALTER COLUMN available_at SET NOT NULL;
   `)
  }

  async down() {
    this.addSql(`
      ALTER TABLE out_of_stock ALTER COLUMN available_at DROP NOT NULL;
    `)
  }

}
exports.Migration20220303141102 = Migration20220303141102;
