import { Connection, Options } from "@mikro-orm/core";
import { PostgreSqlDriver } from "@mikro-orm/postgresql";
export declare function getConnectionOptions(customConfig?: Options<PostgreSqlDriver>): Promise<Options<PostgreSqlDriver>>;
export declare function createMigrationsTable(connection: Connection): Promise<void>;
export declare function createDatabase(config: Options<PostgreSqlDriver>): Promise<void>;
