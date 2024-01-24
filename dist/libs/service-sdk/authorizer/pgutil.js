"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSingle = exports.queryexec = exports.pool = void 0;
const tslib_1 = require("tslib");
/* eslint-disable @typescript-eslint/no-explicit-any */
const pg_1 = require("pg");
const logger_1 = require("../logger");
exports.pool = new pg_1.Pool({
    user: process.env.POSTGRES_USER || "platform",
    host: process.env.POSTGRES_HOST || "0.0.0.0",
    database: "service_iam",
    password: process.env.POSTGRES_PASSWORD || "platform",
    port: 5432
});
const queryexec = (input) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    const start = Date.now();
    try {
        const res = yield exports.pool.query(input);
        const duration = Date.now() - start;
        logger_1.logger.log("executed query", { input, duration, rows: res.rowCount });
        return res;
    }
    catch (e) {
        logger_1.logger.log("exec query error: ", e);
    }
    return { command: "", rows: [], rowCount: 0 };
});
exports.queryexec = queryexec;
const getSingle = (input) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    const res = yield exports.queryexec(input);
    return res.command == "SELECT" && res.rows && res.rows.length ? res.rows[0] : {};
});
exports.getSingle = getSingle;
//# sourceMappingURL=pgutil.js.map