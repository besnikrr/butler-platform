import { Context, Callback } from "aws-lambda";
import { PostgreSqlDriver } from "@mikro-orm/postgresql";
import { Options } from "@mikro-orm/core";
declare const up: (event: any, context: Context, callback: Callback, customConfig?: Options<PostgreSqlDriver>) => Promise<void>;
declare const down: (event: any, context: Context, callback: Callback, customConfig?: Options<PostgreSqlDriver>) => Promise<void>;
export { up, down };
