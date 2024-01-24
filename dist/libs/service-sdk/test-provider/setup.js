"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const core_1 = require("@mikro-orm/core");
const get_db_config_1 = require("./get-db-config");
const util_1 = require("./util");
exports.default = ({ rootDir }) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    const isOrderService = rootDir.substring(rootDir.lastIndexOf("/") + 1) === "service-order";
    if (isOrderService) {
        console.log("Setting up the testing environment and databases for the orders app...");
        for (const { app, database } of Object.values(util_1.services)) {
            console.log(`Creating test database for the ${app} service...`);
            const config = get_db_config_1.default(rootDir.replace("service-order", app), `${database}_test`);
            yield util_1.createTestDatabase(config);
            const connection = yield core_1.MikroORM.init(config);
            yield util_1.runMigrations(connection);
            yield (connection === null || connection === void 0 ? void 0 : connection.close(true));
        }
    }
    else {
        console.log("Setting up the testing environment and database...");
        const config = get_db_config_1.default(rootDir);
        yield util_1.createTestDatabase(config);
        const connection = yield core_1.MikroORM.init(config);
        yield util_1.runMigrations(connection);
        yield (connection === null || connection === void 0 ? void 0 : connection.close(true));
    }
});
//# sourceMappingURL=setup.js.map