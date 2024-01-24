import { promises } from "fs";
import { MikroORM, Options } from "@mikro-orm/core";
import { PostgreSqlDriver } from "@mikro-orm/postgresql";
import * as path from "path";
import { AnyEntity, EntityClass } from "@mikro-orm/core/typings";

const createTestDatabase = async (config: Options<PostgreSqlDriver>) => {
  try {
    await dropTestDatabase(config);

    const connection = await MikroORM.init({
      ...config,
      dbName: "postgres"
    });

    await connection.em.getConnection().execute(`CREATE DATABASE "${config.dbName}"`);
    await connection?.close(true);
  } catch (error) {
    console.error("An error happened while creating the database", error);
    throw error;
  }
};

const getTestConnection = (dbName: string, entities: EntityClass<AnyEntity>[]): Promise<MikroORM> => {
  return MikroORM.init({
    entities: entities,
    host: process.env.POSTGRES_HOST || "127.0.0.1",
    user: process.env.POSTGRES_USERNAME || "platform",
    password: process.env.POSTGRES_PASSWORD || "platform",
    port: +process.env.POSTGRES_PORT || 5432,
    type: "postgresql",
    dbName: dbName,
    debug: process.env.NODE_ENV === "development" && process.env.STAGE === "local",
    migrations: {
      tableName: "mikroorm_migrations",
      path: "./db/migrations",
      pattern: /^[\w-]+\d+\.js$/,
      emit: "js"
    }
  });
};

const runMigrations = async (connection: MikroORM) => {
  const migrator = connection.getMigrator();
  await migrator.up();
};

const getSeedFileContent = async (rootDir: string) => {
  let seedContent = "";
  const fileLocation = path.join(rootDir, "db", "seed.sql");

  try {
    const fileContent = await promises.readFile(fileLocation);

    seedContent = fileContent.toString();
  } catch (error) {
    console.error(`The "seed.sql" file is missing in the "${fileLocation}" path.`);
  }

  return seedContent;
};

const seedDatabase = async (connection: MikroORM, rootDir: string) => {
  const seedContent = await getSeedFileContent(rootDir);

  await connection.em.getConnection().execute(seedContent);
};

const clearDatabase = async (connection: MikroORM) => {
  const tableNames = [];

  for (const { tableName } of Object.values(connection.getMetadata().getAll())) {
    if (tableName) {
      tableNames.push(tableName);
    }
  }

  await connection.em.getConnection().execute(`TRUNCATE TABLE ${tableNames.join(", ")} RESTART IDENTITY CASCADE;`);
};

const dropTestDatabase = async (config: Options<PostgreSqlDriver>) => {
  const connection = await MikroORM.init({
    ...config,
    dbName: "postgres"
  });

  await connection?.em.getConnection().execute(`
    SELECT pg_terminate_backend(pg_stat_activity.pid)
    FROM pg_stat_activity
    WHERE pg_stat_activity.datname = '${config.dbName}'
      AND pid <> pg_backend_pid();
  `);

  await connection?.em.getConnection().execute(`DROP DATABASE IF EXISTS "${config.dbName}"`);

  await connection?.close();
};
const services = {
  IAM: {
    app: "service-iam",
    database: "service_iam"
  },
  MENU: {
    app: "service-menu",
    database: "service_menu"
  },
  NETWORK: {
    app: "service-network",
    database: "service_network"
  },
  VOUCHER: {
    app: "service-voucher",
    database: "service_voucher"
  },
  ORDER: {
    app: "service-order",
    database: "service_order"
  }
};

export { createTestDatabase, getTestConnection, runMigrations, getSeedFileContent, seedDatabase, clearDatabase, dropTestDatabase, services };
