import { Options } from "@mikro-orm/core";
import { PostgreSqlDriver } from "@mikro-orm/postgresql";
import * as path from "path";

export default (rootDir: string, customDbName?: string): Options<PostgreSqlDriver> => ({
  type: "postgresql",
  entities: [],
  discovery: {
    warnWhenNoEntities: false
  },
  dbName: customDbName || process.env.TEST_DB,
  user: process.env.POSTGRES_USERNAME || "platform",
  password: process.env.POSTGRES_PASSWORD || "platform",
  host: process.env.POSTGRES_HOST || "127.0.0.1",
  port: +process.env.POSTGRES_PORT || 5432,
  migrations: {
    tableName: "mikroorm_migrations",
    path: path.join(rootDir, "db", "migrations"),
    pattern: /^[\w-]+\d+\.js$/,
    emit: "js"
  }
});
