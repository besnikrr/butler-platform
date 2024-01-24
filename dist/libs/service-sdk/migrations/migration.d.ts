import { Options } from "@mikro-orm/core";
import { PostgreSqlDriver } from "@mikro-orm/postgresql";
export default class Migration {
    private config;
    private orm;
    private connection;
    private migrator;
    constructor(config: Options<PostgreSqlDriver>);
    private init;
    runMigrations(): Promise<{
        migrations_up: string[];
    }>;
    undoLastMigrations(): Promise<{
        migrations_down: any[];
    }>;
}
