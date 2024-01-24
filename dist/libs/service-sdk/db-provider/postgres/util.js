"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PG = void 0;
const tslib_1 = require("tslib");
const errors_1 = require("libs/service-sdk/errors");
const logger_1 = require("libs/service-sdk/logger");
const pg_1 = require("pg");
var PG;
(function (PG) {
    PG.pool = new pg_1.Pool({
        user: "admin",
        host: "0.0.0.0",
        database: "mikroorm_menu",
        password: "admin",
        port: 5432
    });
    PG.queryexec = (input) => tslib_1.__awaiter(this, void 0, void 0, function* () {
        const start = Date.now();
        const res = yield PG.pool.query(input);
        const duration = Date.now() - start;
        logger_1.logger.log("executed query", { input, duration, rows: res.rowCount });
        return res;
    });
    PG.getMultiple = (input) => tslib_1.__awaiter(this, void 0, void 0, function* () {
        const res = yield PG.queryexec(input);
        return res.command == "SELECT" && res.rows && res.rows.length ? res.rows : [];
    });
    PG.getSingle = (input) => tslib_1.__awaiter(this, void 0, void 0, function* () {
        const res = yield PG.queryexec(input);
        return res.command == "SELECT" && res.rows && res.rows.length ? res.rows[0] : {};
    });
    PG.insertquery = (table, input, onConstraintQuery = "") => {
        const params = [];
        const values = [];
        const paramvalues = [];
        const bulk = input.length > 0;
        if (bulk) {
            let i = 0;
            let idx = 0;
            input.forEach((ob) => {
                const keys = [];
                Object.keys(ob).forEach((key) => {
                    if (i === 0) {
                        params.push(key);
                    }
                    values.push(`$${idx + 1}`);
                    keys.push(`$${idx + 1}`);
                    idx++;
                });
                i++;
                paramvalues.push(`(${keys.concat("now()").toString()})`);
            });
        }
        else {
            Object.keys(input).forEach((key, idx) => {
                params.push(key);
                values.push(`$${idx + 1}`);
            });
            paramvalues.push(`(${values.concat("now()").toString()})`).toString();
        }
        let inputvals = [];
        if (bulk) {
            const collectedValues = input.map((ob) => Object.values(ob).map((e) => (!e ? null : e)));
            inputvals = [].concat.apply([], collectedValues); // .toString().split(',')
            logger_1.logger.log("bulk-input: ", input);
            logger_1.logger.log("bulk-inputvals: ", inputvals);
        }
        else {
            inputvals = Object.values(input);
            logger_1.logger.log("input: ", input);
            logger_1.logger.log("inputvals: ", inputvals);
        }
        const txt = `insert into ${table} (${params.concat(["created_at"]).toString()}) values ${paramvalues} ${onConstraintQuery} returning *`;
        return {
            text: txt,
            values: inputvals
        };
    };
    PG.insert = (table, input, onConstraintQuery = "") => tslib_1.__awaiter(this, void 0, void 0, function* () {
        const queryinput = PG.insertquery(table, input, onConstraintQuery);
        const output = yield PG.queryexec(queryinput);
        if (output && output.rows && output.rows.length) {
            return output.rows[0];
        }
        throw errors_1.generalError("0", "INSERT failure");
    });
    PG.updatequery = (table, id, input) => {
        const params = ["updated_at = $1"];
        Object.keys(input).forEach((key, idx) => {
            params.push(`${key} = $${idx + 2}`);
        });
        return {
            text: `update ${table} set ${params.toString()} where id = $${Object.keys(input).length + 2} returning *`,
            values: ["now()"].concat(Object.values(input)).concat([id.toString()])
        };
    };
    PG.update = (table, id, input) => tslib_1.__awaiter(this, void 0, void 0, function* () {
        const queryinput = PG.updatequery(table, id, input);
        const output = yield PG.queryexec(queryinput);
        if (output && output.rows && output.rows.length) {
            return output.rows[0];
        }
        throw errors_1.generalError("0", "UPDATE failure");
    });
    PG.softdeletequery = (table, id) => {
        const params = ["deleted_at = $1"];
        return {
            text: `update ${table} set ${params.toString()} where id in (${Array.isArray(id) ? id.toString() : id}) returning *`,
            values: ["now()"]
        };
    };
    PG.deletequery = (table, id) => {
        return {
            text: `delete from ${table} where id in (${Array.isArray(id) ? id.toString() : id})`
        };
    };
    PG.softdel = (table, id) => tslib_1.__awaiter(this, void 0, void 0, function* () {
        const queryinput = PG.softdeletequery(table, id);
        const output = yield PG.queryexec(queryinput);
        if (output && output.rows && output.rows.length) {
            return output.rows[0];
        }
        throw errors_1.generalError("0", "DELETE failure");
    });
    PG.del = (table, id) => tslib_1.__awaiter(this, void 0, void 0, function* () {
        const queryinput = PG.deletequery(table, id);
        const output = yield PG.queryexec(queryinput);
        if (output && output.rowCount) {
            return id;
        }
        throw errors_1.generalError("0", "DELETE failure");
    });
    PG.TABLE = {
        MODIFIER: process.env.MODIFIER_TABLE || "modifier",
        MODIFIER_OPTION: process.env.MODIFIER_OPTION_TABLE || "modifier_option",
        CATEGORY: process.env.CATEGORY_TABLE || "category",
        PRODUCT: process.env.PRODUCT_TABLE || "product",
        PRODUCT_CATEGORY: process.env.PRODUCT_CATEGORY_TABLE || "product_category",
        PRODUCT_MODIFIER: process.env.PRODUCT_MODIFIER_TABLE || "product_modifier",
        MENU: process.env.MENU_TABLE || "menu",
        PRODUCT_MENU: process.env.PRODUCT_MENU_TABLE || "product_menu",
        OUT_OF_STOCK: process.env.OUT_OF_STOCK_TABLE || "out_of_stock",
        MENU_HOTEL: process.env.MENU_HOTEL_TABLE || "menu_hotel"
    };
    PG.getPaginationString = (page, limit = 20) => {
        const offset = page > 0 ? (page - 1) * limit + 1 : 0;
        return `offset ${offset} limit ${limit}`;
    };
    PG.getOrderByClause = (attr, sort = "asc") => {
        return `order by ${attr} ${sort}`;
    };
    PG.addTotalCountQueryString = () => {
        return `count(*) OVER() AS total_count`;
    };
    PG.getClient = () => tslib_1.__awaiter(this, void 0, void 0, function* () {
        const client = yield PG.pool.connect();
        const { query } = client;
        const { release } = client;
        // set a timeout of 5 seconds, after which we will log this client's last query
        const timeout = setTimeout(() => {
            console.error("A client has been checked out for more than 5 seconds!");
            console.error(`The last executed query on this client was: ${client.lastQuery}`);
        }, 5000);
        // monkey patch the query method to keep track of the last query executed
        client.query = (...args) => {
            client.lastQuery = args;
            return query.apply(client, args);
        };
        client.release = () => {
            // clear our timeout
            clearTimeout(timeout);
            // set the methods back to their old un-monkey-patched version
            client.query = query;
            client.release = release;
            return release.apply(client);
        };
        return client;
    });
})(PG = exports.PG || (exports.PG = {}));
//# sourceMappingURL=util.js.map