import getDBConfig from "./get-db-config";
import { dropTestDatabase, services } from "./util";

export default async ({ rootDir }) => {
  const isOrderService = rootDir.substring(rootDir.lastIndexOf("/") + 1) === "service-order";

  if (isOrderService) {
    console.log("Disposing the test environment and databases for the orders app...");
    for (const { app, database } of Object.values(services)) {
      const config = getDBConfig(rootDir.replace("service-order", app), `${database}_test`);
      await dropTestDatabase(config);
    }
  } else {
    console.log("Disposing the test environment and database...");
    const config = getDBConfig(rootDir);
    await dropTestDatabase(config);
  }
};
