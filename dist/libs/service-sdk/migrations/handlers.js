"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.down = exports.up = void 0;
const tslib_1 = require("tslib");
const migration_1 = require("./migration");
const utils_1 = require("./utils");
const success = (response) => ({
    statusCode: 200,
    body: JSON.stringify(response)
});
const handler = (handlerName) => (event, context, callback, customConfig) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    const stage = process.env.STAGE || "local";
    const migration = new migration_1.default(yield utils_1.getConnectionOptions(customConfig));
    try {
        const response = yield migration[handlerName]();
        if (stage !== "local") {
            callback(null, success(response));
        }
    }
    catch (error) {
        console.error(error);
        if (stage !== "local") {
            callback(error);
        }
        else {
            throw error;
        }
    }
});
const up = handler("runMigrations");
exports.up = up;
const down = handler("undoLastMigrations");
exports.down = down;
//# sourceMappingURL=handlers.js.map