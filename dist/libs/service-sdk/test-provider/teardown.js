"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const get_db_config_1 = require("./get-db-config");
const util_1 = require("./util");
exports.default = ({ rootDir }) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    const isOrderService = rootDir.substring(rootDir.lastIndexOf("/") + 1) === "service-order";
    if (isOrderService) {
        console.log("Disposing the test environment and databases for the orders app...");
        for (const { app, database } of Object.values(util_1.services)) {
            const config = get_db_config_1.default(rootDir.replace("service-order", app), `${database}_test`);
            yield util_1.dropTestDatabase(config);
        }
    }
    else {
        console.log("Disposing the test environment and database...");
        const config = get_db_config_1.default(rootDir);
        yield util_1.dropTestDatabase(config);
    }
});
//# sourceMappingURL=teardown.js.map