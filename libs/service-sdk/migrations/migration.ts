import { Connection, MikroORM, Options } from "@mikro-orm/core";
import { Migrator } from "@mikro-orm/migrations";
import { PostgreSqlDriver } from "@mikro-orm/postgresql";
import * as path from "path";
import { logger } from "../logger";
import { createDatabase, createMigrationsTable } from "./utils";

export default class Migration {
  private config: Options<PostgreSqlDriver>;

  private orm: MikroORM<PostgreSqlDriver>;

  private connection: Connection;

  private migrator: Migrator;

  constructor(config: Options<PostgreSqlDriver>) {
    this.config = config;
    this.orm = null;
    this.connection = null;
    this.migrator = null;
  }

  private async init() {
    try {
      if (process.env.STAGE !== "local") {
        await createDatabase(this.config);
      }

      this.orm = await MikroORM.init({
        ...this.config,
        migrations: {
          ...this.config.migrations,
          path: path.join(__dirname, "./migrations")
        }
      });

      this.connection = this.orm.em.getConnection();
      this.migrator = this.orm.getMigrator();
    } catch (error) {
      logger.log("Could not initialize DB connection during migration.");
      throw error;
    }
  }

  async runMigrations() {
    await this.init();

    try {
      await createMigrationsTable(this.connection);
    } catch (error) {
      console.error("Could not create the 'batch_migrations' table while running the migrations.", error);
      await this.connection?.close(true);
      throw error;
    }

    const pending = await this.migrator.getPendingMigrations();
    if (pending && pending.length > 0) {
      logger.log("Executing the latest batch of migrations...");
      try {
        const migrations = await this.migrator.up();

        if (migrations.length > 0) {
          const migrationsArray =
            `{${
              migrations
                .reverse()
                .map((a) => a.file)
                .join(", ")
            }}`;
          await this.connection.execute(`insert into batch_migrations("migrations") values (?);`, [migrationsArray]);
        }

        logger.log("All the pending migrations were executed successfully.");
      } catch (error) {
        console.error(`Something went wrong while executing the pending migrations${error}`);
        throw error;
      } finally {
        logger.log("Migrations run", pending.map((a) => a.file).join(", "));
        await this.connection?.close(true);
      }
    } else {
      logger.log("No new migrations were found.");
    }

    await this.connection?.close(true);

    return {
      migrations_up: pending.map((a) => a.file)
    };
  }

  async undoLastMigrations() {
    logger.log("Rolling back the latest batch of migrations...");
    await this.init();
    const migrations = await this.connection.execute(
      "select \"id\", \"migrations\", \"deleted_at\" from batch_migrations order by id desc limit 1"
    );

    let migrationsArray = [];

    if (migrations && migrations.length > 0 && !migrations[0].deleted_at) {
      const migration = migrations[0];
      migrationsArray = migration.migrations;

      try {
        await this.migrator.down({
          migrations: migrationsArray
        });

        await this.connection.execute(`update "batch_migrations" set deleted_at = now() where id = ?;`, [migration.id]);

        logger.log("Latest batch of migrations was rolled back successfully.");
      } catch (error) {
        console.error(`Something went wrong while reverting the latest batch of migrations${error}`);
        throw error;
      } finally {
        logger.log("Latest batch of migrations: ", migrationsArray);

        await this.connection?.close(true);
      }
    } else {
      logger.log("No batch of latest migrations was found or the last migration sequence has already been rolled back.");
    }

    await this.connection?.close(true);

    return {
      migrations_down: migrationsArray
    };
  }
}
