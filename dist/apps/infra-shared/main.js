/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./apps/infra-shared/pgutil.ts":
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.update = exports.updatequery = exports.insert = exports.insertquery = exports.getSingle = exports.queryexec = exports.pool = void 0;
const tslib_1 = __webpack_require__("tslib");
const pg_1 = __webpack_require__("pg");
// export namespace PG {
exports.pool = new pg_1.Pool({
    user: process.env.POSTGRES_USER,
    host: process.env.POSTGRES_HOST,
    database: 'service_iam',
    password: process.env.POSTGRES_PASSWORD,
    port: 5432,
});
const queryexec = (input) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    const start = Date.now();
    try {
        console.log('pool-config: ', exports.pool);
        const res = yield exports.pool.query(input);
        const duration = Date.now() - start;
        console.log('executed query', { input, duration, rows: res.rowCount });
        return res;
    }
    catch (e) {
        console.log('exec query error: ', e);
    }
    return { command: '', rows: [], rowCount: 0 };
});
exports.queryexec = queryexec;
const getSingle = (input) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    const res = yield exports.queryexec(input);
    return res.command == 'SELECT' && res.rows && res.rows.length ? res.rows[0] : {};
});
exports.getSingle = getSingle;
const insertquery = (table, input, onConstraintQuery = '') => {
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
            paramvalues.push(`(${keys.toString()})`);
        });
    }
    else {
        Object.keys(input).forEach((key, idx) => {
            params.push(key);
            values.push(`$${idx + 1}`);
        });
        paramvalues.push(`(${values})`).toString();
    }
    let inputvals = [];
    if (bulk) {
        const collectedValues = input.map((ob) => Object.values(ob).map((e) => (!e ? null : e)));
        inputvals = [].concat.apply([], collectedValues); //.toString().split(',')
        console.log('bulk-input: ', input);
        console.log('bulk-inputvals: ', inputvals);
    }
    else {
        inputvals = Object.values(input);
        console.log('input: ', input);
        console.log('inputvals: ', inputvals);
    }
    const txt = `insert into ${table} (${params.toString()}) values ${paramvalues} ${onConstraintQuery} returning *`;
    return {
        text: txt,
        values: inputvals
    };
};
exports.insertquery = insertquery;
const insert = (table, input, onConstraintQuery = '') => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    const queryinput = exports.insertquery(table, input, onConstraintQuery);
    console.log('queryinput: ', queryinput);
    const output = yield exports.queryexec(queryinput);
    console.log('output: ', output);
    if (output && output.rows && output.rows.length) {
        return Array.isArray(input) ? output.rows : output.rows[0];
    }
    throw 'INSERT failure';
});
exports.insert = insert;
const updatequery = (table, id, input) => {
    const params = [];
    Object.keys(input).forEach((key, idx) => {
        params.push(`${key} = $${idx + 1}`);
    });
    return {
        text: `update ${table} set ${params.toString()} where id = $${Object.keys(input).length + 1} returning *`,
        values: Object.values(input).concat([id.toString()])
    };
};
exports.updatequery = updatequery;
const update = (table, id, input) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    const queryinput = exports.updatequery(table, id, input);
    const output = yield exports.queryexec(queryinput);
    if (output && output.rows && output.rows.length) {
        return output.rows[0];
    }
    throw 'UPDATE failure';
});
exports.update = update;


/***/ }),

/***/ "aws-sdk":
/***/ ((module) => {

module.exports = require("aws-sdk");

/***/ }),

/***/ "pg":
/***/ ((module) => {

module.exports = require("pg");

/***/ }),

/***/ "tslib":
/***/ ((module) => {

module.exports = require("tslib");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
(() => {
var exports = __webpack_exports__;

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.afterServiceDeploy = void 0;
const tslib_1 = __webpack_require__("tslib");
const AWS = __webpack_require__("aws-sdk");
const pgutil_1 = __webpack_require__("./apps/infra-shared/pgutil.ts");
const dynamoDB = new AWS.DynamoDB.DocumentClient(process.env.STAGE === 'local' ? {
    region: 'localhost',
    endpoint: 'http://localhost:4566',
} : {});
const afterServiceDeploy = (event) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d;
    console.log('event: ', event);
    const record = JSON.parse(event.Records[0].Sns.Message);
    const serviceName = record.serviceName; //this is our app name also
    const data = yield dynamoDB.query({
        TableName: process.env.MAIN_TABLE || '',
        KeyConditionExpression: '#pk = :pk and begins_with(#sk, :sk)',
        ExpressionAttributeNames: {
            '#pk': 'pk',
            '#sk': 'sk'
        },
        ExpressionAttributeValues: {
            ':pk': 'permission',
            ':sk': `permission::${serviceName}`
        }
    }).promise();
    const appdata = yield dynamoDB.get({
        TableName: process.env.MAIN_TABLE || '',
        Key: {
            pk: 'app',
            sk: `app::${serviceName}`
        },
    }).promise();
    console.log('app-=data: ', appdata);
    console.log('event-came-here', record);
    console.log('data: ', data);
    let app = yield pgutil_1.getSingle({
        text: 'select * from app where name = $1',
        values: [serviceName]
    });
    console.log('found-app: ', app);
    if (Object.keys(app).length === 0) {
        console.log('not-found-app: ', app);
        app = yield pgutil_1.insert('app', {
            name: serviceName,
            description: (_a = appdata.Item) === null || _a === void 0 ? void 0 : _a.description,
            dashboard_settings: (_b = appdata.Item) === null || _b === void 0 ? void 0 : _b.dashboardSettings
        });
        console.log('inserted-new-app: ', app);
    }
    else {
        //update the dashboard settings
        try {
            yield pgutil_1.update('app', app.id, { dashboard_settings: (_c = appdata.Item) === null || _c === void 0 ? void 0 : _c.dashboardSettings });
        }
        catch (e) {
            console.log('error-updating-app-dbsettings: ', e);
        }
    }
    console.log('app-in-the-end: ', app);
    const permissionsToInsert = [];
    const generalPermissionGroupName = `${String(app.name)}-ALL-GROUP`;
    let permissionGroup = yield pgutil_1.getSingle({
        text: 'select * from permissiongroup where name = $1',
        values: [generalPermissionGroupName]
    });
    if (Object.keys(permissionGroup).length === 0) {
        permissionGroup = yield pgutil_1.insert('permissiongroup', { name: generalPermissionGroupName });
    }
    (_d = data.Items) === null || _d === void 0 ? void 0 : _d.forEach((el) => {
        const permComposite = el.sk.split('::');
        if (el.arn)
            permissionsToInsert.push({ name: String(permComposite[2]), arn: el.arn, app_id: app.id });
        return;
    });
    const permissionGroupPermissionMapper = (permgroup, permissions) => {
        return permissions.map((permission) => {
            return {
                permissiongroup_id: permgroup.id,
                permission_id: permission.id
            };
        });
    };
    if (permissionsToInsert) {
        try {
            //todo: make this a transaction
            yield pgutil_1.queryexec({
                text: 'delete from permission where app_id = $1',
                values: [app.id]
            });
            const insertedPermissions = yield pgutil_1.insert('permission', permissionsToInsert);
            console.log('insertedPermissions: ', insertedPermissions);
            const insertedPermissionsGroupPermissions = yield pgutil_1.insert('permissiongroup_permission', permissionGroupPermissionMapper(permissionGroup, insertedPermissions));
            console.log('permission-group-permissions: ', insertedPermissionsGroupPermissions);
        }
        catch (e) {
            console.log('error-insert: ', e);
        }
    }
});
exports.afterServiceDeploy = afterServiceDeploy;

})();

var __webpack_export_target__ = exports;
for(var i in __webpack_exports__) __webpack_export_target__[i] = __webpack_exports__[i];
if(__webpack_exports__.__esModule) Object.defineProperty(__webpack_export_target__, "__esModule", { value: true });
/******/ })()
;
//# sourceMappingURL=main.js.map