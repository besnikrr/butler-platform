"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.services = exports.dropTestDatabase = exports.clearDatabase = exports.seedDatabase = exports.getSeedFileContent = exports.runMigrations = exports.getTestConnection = exports.createTestDatabase = void 0;
const tslib_1 = require("tslib");
const fs_1 = require("fs");
const core_1 = require("@mikro-orm/core");
const path = require("path");
const createTestDatabase = (config) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    try {
        yield dropTestDatabase(config);
        const connection = yield core_1.MikroORM.init(Object.assign(Object.assign({}, config), { dbName: "postgres" }));
        yield connection.em.getConnection().execute(`CREATE DATABASE "${config.dbName}"`);
        yield (connection === null || connection === void 0 ? void 0 : connection.close(true));
    }
    catch (error) {
        console.error("An error happened while creating the database", error);
        throw error;
    }
});
exports.createTestDatabase = createTestDatabase;
const getTestConnection = (dbName, entities) => {
    return core_1.MikroORM.init({
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
exports.getTestConnection = getTestConnection;
const runMigrations = (connection) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    const migrator = connection.getMigrator();
    yield migrator.up();
});
exports.runMigrations = runMigrations;
const getSeedFileContent = (rootDir) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    let seedContent = "";
    const fileLocation = path.join(rootDir, "db", "seed.sql");
    try {
        const fileContent = yield fs_1.promises.readFile(fileLocation);
        seedContent = fileContent.toString();
    }
    catch (error) {
        console.error(`The "seed.sql" file is missing in the "${fileLocation}" path.`);
    }
    return seedContent;
});
exports.getSeedFileContent = getSeedFileContent;
const seedDatabase = (connection, rootDir) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    const seedContent = yield getSeedFileContent(rootDir);
    yield connection.em.getConnection().execute(seedContent);
});
exports.seedDatabase = seedDatabase;
const clearDatabase = (connection) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    const tableNames = [];
    for (const { tableName } of Object.values(connection.getMetadata().getAll())) {
        if (tableName) {
            tableNames.push(tableName);
        }
    }
    yield connection.em.getConnection().execute(`TRUNCATE TABLE ${tableNames.join(", ")} RESTART IDENTITY CASCADE;`);
});
exports.clearDatabase = clearDatabase;
const dropTestDatabase = (config) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    const connection = yield core_1.MikroORM.init(Object.assign(Object.assign({}, config), { dbName: "postgres" }));
    yield (connection === null || connection === void 0 ? void 0 : connection.em.getConnection().execute(`
    SELECT pg_terminate_backend(pg_stat_activity.pid)
    FROM pg_stat_activity
    WHERE pg_stat_activity.datname = '${config.dbName}'
      AND pid <> pg_backend_pid();
  `));
    yield (connection === null || connection === void 0 ? void 0 : connection.em.getConnection().execute(`DROP DATABASE IF EXISTS "${config.dbName}"`));
    yield (connection === null || connection === void 0 ? void 0 : connection.close());
});
exports.dropTestDatabase = dropTestDatabase;
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
exports.services = services;
//# sourceMappingURL=util.js.map