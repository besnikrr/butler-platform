"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const core_1 = require("@mikro-orm/core");
const path = require("path");
const logger_1 = require("../logger");
const utils_1 = require("./utils");
class Migration {
    constructor(config) {
        this.config = config;
        this.orm = null;
        this.connection = null;
        this.migrator = null;
    }
    init() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            try {
                if (process.env.STAGE !== "local") {
                    yield utils_1.createDatabase(this.config);
                }
                this.orm = yield core_1.MikroORM.init(Object.assign(Object.assign({}, this.config), { migrations: Object.assign(Object.assign({}, this.config.migrations), { path: path.join(__dirname, "./migrations") }) }));
                this.connection = this.orm.em.getConnection();
                this.migrator = this.orm.getMigrator();
            }
            catch (error) {
                logger_1.logger.log("Could not initialize DB connection during migration.");
                throw error;
            }
        });
    }
    runMigrations() {
        var _a, _b, _c;
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            yield this.init();
            try {
                yield utils_1.createMigrationsTable(this.connection);
            }
            catch (error) {
                console.error("Could not create the 'batch_migrations' table while running the migrations.", error);
                yield ((_a = this.connection) === null || _a === void 0 ? void 0 : _a.close(true));
                throw error;
            }
            const pending = yield this.migrator.getPendingMigrations();
            if (pending && pending.length > 0) {
                logger_1.logger.log("Executing the latest batch of migrations...");
                try {
                    const migrations = yield this.migrator.up();
                    if (migrations.length > 0) {
                        const migrationsArray = `{${migrations
                            .reverse()
                            .map((a) => a.file)
                            .join(", ")}}`;
                        yield this.connection.execute(`insert into batch_migrations("migrations") values (?);`, [migrationsArray]);
                    }
                    logger_1.logger.log("All the pending migrations were executed successfully.");
                }
                catch (error) {
                    console.error(`Something went wrong while executing the pending migrations${error}`);
                    throw error;
                }
                finally {
                    logger_1.logger.log("Migrations run", pending.map((a) => a.file).join(", "));
                    yield ((_b = this.connection) === null || _b === void 0 ? void 0 : _b.close(true));
                }
            }
            else {
                logger_1.logger.log("No new migrations were found.");
            }
            yield ((_c = this.connection) === null || _c === void 0 ? void 0 : _c.close(true));
            return {
                migrations_up: pending.map((a) => a.file)
            };
        });
    }
    undoLastMigrations() {
        var _a, _b;
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            logger_1.logger.log("Rolling back the latest batch of migrations...");
            yield this.init();
            const migrations = yield this.connection.execute("select \"id\", \"migrations\", \"deleted_at\" from batch_migrations order by id desc limit 1");
            let migrationsArray = [];
            if (migrations && migrations.length > 0 && !migrations[0].deleted_at) {
                const migration = migrations[0];
                migrationsArray = migration.migrations;
                try {
                    yield this.migrator.down({
                        migrations: migrationsArray
                    });
                    yield this.connection.execute(`update "batch_migrations" set deleted_at = now() where id = ?;`, [migration.id]);
                    logger_1.logger.log("Latest batch of migrations was rolled back successfully.");
                }
                catch (error) {
                    console.error(`Something went wrong while reverting the latest batch of migrations${error}`);
                    throw error;
                }
                finally {
                    logger_1.logger.log("Latest batch of migrations: ", migrationsArray);
                    yield ((_a = this.connection) === null || _a === void 0 ? void 0 : _a.close(true));
                }
            }
            else {
                logger_1.logger.log("No batch of latest migrations was found or the last migration sequence has already been rolled back.");
            }
            yield ((_b = this.connection) === null || _b === void 0 ? void 0 : _b.close(true));
            return {
                migrations_down: migrationsArray
            };
        });
    }
}
exports.default = Migration;
//# sourceMappingURL=migration.js.map