import { Options } from "@mikro-orm/core";
import { PostgreSqlDriver } from "@mikro-orm/postgresql";
import entities from "../src/utils/entities";

export default {
  entities: entities,
  dbName: process.env.DB,
  type: "postgresql",
  port: 5432,
  user: process.env.POSTGRES_USER || "platform",
  password: process.env.POSTGRES_PASSWORD || "platform",
  migrations: {
    tableName: "mikroorm_migrations",
    path: "./db/migrations",
    pattern: /^[\w-]+\d+\.js$/,
    emit: "js"
  }
} as Options<PostgreSqlDriver>;
