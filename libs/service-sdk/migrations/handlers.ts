import Migration from "./migration";
import { Context, Callback } from "aws-lambda";
import { getConnectionOptions } from "./utils";
import { PostgreSqlDriver } from "@mikro-orm/postgresql";
import { Options } from "@mikro-orm/core";

const success = (response: any) => ({
  statusCode: 200,
  body: JSON.stringify(response)
});
const handler =
  (handlerName: string) => async (event: any, context: Context, callback: Callback, customConfig?: Options<PostgreSqlDriver>) => {
    const stage = process.env.STAGE || "local";
    const migration = new Migration(await getConnectionOptions(customConfig));

    try {
      const response = await migration[handlerName]();

      if (stage !== "local") {
        callback(null, success(response));
      }
    } catch (error) {
      console.error(error);
      if (stage !== "local") {
        callback(error);
      } else {
        throw error;
      }
    }
  };

const up = handler("runMigrations");

const down = handler("undoLastMigrations");

export { up, down };
