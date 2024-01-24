import * as AWS from "aws-sdk";
import { Connection, MikroORM, Options } from "@mikro-orm/core";
import { PostgreSqlDriver } from "@mikro-orm/postgresql";
import * as path from "path";
import { logger } from "../logger";

export async function getConnectionOptions(
  customConfig?: Options<PostgreSqlDriver>
): Promise<Options<PostgreSqlDriver>> {
  if (customConfig) {
    return customConfig;
  }
  const SecretId = `${process.env.STAGE}/infra`;
  const smClient = new AWS.SecretsManager({ region: process.env.REGION });
  const secretValues = await smClient.getSecretValue({ SecretId }).promise();
  const {
    aurora_master_user: auroraUsername,
    aurora_master_user_password: auroraPassword
  } = JSON.parse(secretValues.SecretString);

  return {
    type: "postgresql",
    dbName: process.env.DB,
    host: process.env.AURORA_ENDPOINT,
    port: 5432,
    discovery: {
      warnWhenNoEntities: false,
      requireEntitiesArray: false
    },
    user: auroraUsername,
    password: auroraPassword,
    migrations: {
      tableName: "mikroorm_migrations",
      path: path.join(__dirname, "./migrations"),
      dropTables: true,
      allOrNothing: true,
      pattern: /^[\w-]+\d+\.js$/,
      emit: "js"
    }
  };
}

export async function createMigrationsTable(connection: Connection) {
  await connection.execute(`
    CREATE TABLE IF NOT EXISTS batch_migrations
    (
        id serial NOT NULL,
        migrations character varying[] NOT NULL,
        created_at timestamp with time zone NOT NULL DEFAULT now(),
        deleted_at timestamp with time zone,
        CONSTRAINT migrations_custom_pkey PRIMARY KEY (id)
    );
  `);
}

export async function createDatabase(config: Options<PostgreSqlDriver>): Promise<void> {
  const connection = await MikroORM.init({
    ...config,
    dbName: "postgres"
  });

  if (!config.dbName) {
    logger.error("DB environment variable missing");
    throw new Error("DB not defined");
  }

  try {
    logger.log("Creating database if it doesn't already exist...");
    await connection.em.getConnection().execute(`CREATE DATABASE "${config.dbName}"`);
  } catch (error) {
    if (error.code !== "42P04") {
      logger.error("An error happened while creating the database", error);
      throw error;
    }
  } finally {
    logger.log(`Database ${config.dbName} was created or already exists.`);
  }

  await connection?.close(true);
}
