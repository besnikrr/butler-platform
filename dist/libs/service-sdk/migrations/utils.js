"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createDatabase = exports.createMigrationsTable = exports.getConnectionOptions = void 0;
const tslib_1 = require("tslib");
const AWS = require("aws-sdk");
const core_1 = require("@mikro-orm/core");
const path = require("path");
const logger_1 = require("../logger");
function getConnectionOptions(customConfig) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        if (customConfig) {
            return customConfig;
        }
        const SecretId = `${process.env.STAGE}/infra`;
        const smClient = new AWS.SecretsManager({ region: process.env.REGION });
        const secretValues = yield smClient.getSecretValue({ SecretId }).promise();
        const { aurora_master_user: auroraUsername, aurora_master_user_password: auroraPassword } = JSON.parse(secretValues.SecretString);
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
    });
}
exports.getConnectionOptions = getConnectionOptions;
function createMigrationsTable(connection) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        yield connection.execute(`
    CREATE TABLE IF NOT EXISTS batch_migrations
    (
        id serial NOT NULL,
        migrations character varying[] NOT NULL,
        created_at timestamp with time zone NOT NULL DEFAULT now(),
        deleted_at timestamp with time zone,
        CONSTRAINT migrations_custom_pkey PRIMARY KEY (id)
    );
  `);
    });
}
exports.createMigrationsTable = createMigrationsTable;
function createDatabase(config) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const connection = yield core_1.MikroORM.init(Object.assign(Object.assign({}, config), { dbName: "postgres" }));
        if (!config.dbName) {
            logger_1.logger.error("DB environment variable missing");
            throw new Error("DB not defined");
        }
        try {
            logger_1.logger.log("Creating database if it doesn't already exist...");
            yield connection.em.getConnection().execute(`CREATE DATABASE "${config.dbName}"`);
        }
        catch (error) {
            if (error.code !== "42P04") {
                logger_1.logger.error("An error happened while creating the database", error);
                throw error;
            }
        }
        finally {
            logger_1.logger.log(`Database ${config.dbName} was created or already exists.`);
        }
        yield (connection === null || connection === void 0 ? void 0 : connection.close(true));
    });
}
exports.createDatabase = createDatabase;
//# sourceMappingURL=utils.js.map