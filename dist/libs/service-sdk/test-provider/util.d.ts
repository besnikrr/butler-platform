import { MikroORM, Options } from "@mikro-orm/core";
import { PostgreSqlDriver } from "@mikro-orm/postgresql";
import { AnyEntity, EntityClass } from "@mikro-orm/core/typings";
declare const createTestDatabase: (config: Options<PostgreSqlDriver>) => Promise<void>;
declare const getTestConnection: (dbName: string, entities: EntityClass<AnyEntity>[]) => Promise<MikroORM>;
declare const runMigrations: (connection: MikroORM) => Promise<void>;
declare const getSeedFileContent: (rootDir: string) => Promise<string>;
declare const seedDatabase: (connection: MikroORM, rootDir: string) => Promise<void>;
declare const clearDatabase: (connection: MikroORM) => Promise<void>;
declare const dropTestDatabase: (config: Options<PostgreSqlDriver>) => Promise<void>;
declare const services: {
    IAM: {
        app: string;
        database: string;
    };
    MENU: {
        app: string;
        database: string;
    };
    NETWORK: {
        app: string;
        database: string;
    };
    VOUCHER: {
        app: string;
        database: string;
    };
    ORDER: {
        app: string;
        database: string;
    };
};
export { createTestDatabase, getTestConnection, runMigrations, getSeedFileContent, seedDatabase, clearDatabase, dropTestDatabase, services };
