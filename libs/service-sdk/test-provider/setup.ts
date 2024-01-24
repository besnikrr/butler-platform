import { MikroORM } from "@mikro-orm/core";
import getDBConfig from "./get-db-config";
import { createTestDatabase, runMigrations, services } from "./util";

export default async ({ rootDir }) => {
  const isOrderService = rootDir.substring(rootDir.lastIndexOf("/") + 1) === "service-order";

  if (isOrderService) {
    console.log("Setting up the testing environment and databases for the orders app...");
    for (const { app, database } of Object.values(services)) {
      console.log(`Creating test database for the ${app} service...`);
      const config = getDBConfig(rootDir.replace("service-order", app), `${database}_test`);

      await createTestDatabase(config);

      const connection = await MikroORM.init(config);

      await runMigrations(connection);

      await connection?.close(true);
    }
  } else {
    console.log("Setting up the testing environment and database...");
    const config = getDBConfig(rootDir);
    await createTestDatabase(config);

    const connection = await MikroORM.init(config);

    await runMigrations(connection);

    await connection?.close(true);
  }
};
