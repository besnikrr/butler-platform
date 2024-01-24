"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Migration = require("@mikro-orm/migrations").Migration;

class Migration20220422143159 extends Migration {
  async up() {
    this.addSql("alter table iam_user drop constraint iam_user_email_key");
  }

  async down() {
    this.addSql("alter table iam_user add constraint iam_user_email_key unique (email)");
  }
}
exports.Migration20220422143159 = Migration20220422143159;
