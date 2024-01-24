/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./apps/service-dashboard/main.ts":
/***/ ((module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
const express = __webpack_require__("express");
const serverless = __webpack_require__("serverless-http");
const cors = __webpack_require__("cors");
const service_sdk_1 = __webpack_require__("./libs/service-sdk/index.ts");
const user_apps_1 = __webpack_require__("./apps/service-dashboard/route/user-apps.ts");
const bodyParser = __webpack_require__("body-parser");
const shared_1 = __webpack_require__("./libs/shared/index.ts");
const jsonParser = bodyParser.json();
const app = express();
app.use(cors());
app.use(service_sdk_1.contextInjector);
app.use(jsonParser);
/*
 * Use Routes
 */
app.use('/api/dashboard/user-apps', user_apps_1.default);
if (process.env.STAGE === 'local') {
    service_sdk_1.expressLocal(app, shared_1.AppEnum.DASHBOARD);
}
module.exports.handler = serverless(app);
// eof2


/***/ }),

/***/ "./apps/service-dashboard/repository/user-apps.ts":
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
const tslib_1 = __webpack_require__("tslib");
const service_sdk_1 = __webpack_require__("./libs/service-sdk/index.ts");
const APP_PK = 'app';
function getApps(context) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        try {
            const getAllApps = yield service_sdk_1.Query({
                tableName: `${process.env.TABLE_MAIN}`,
                action: service_sdk_1.ActionType.GET,
                keys: ['pk', 'sk'],
                filterInput: service_sdk_1.getListFilters(APP_PK, APP_PK),
            });
            const permissions = context.authorizedUser.permissions;
            const userAppPermissions = permissions
                .map((permission) => permission.split('::')[1])
                .filter((app, index, self) => {
                return index === self.findIndex((a) => a === app);
            });
            const result = getAllApps.result.filter((app) => userAppPermissions.includes(app.id.split('::')[1]));
            return { result };
        }
        catch (exception) {
            const errorMessage = 'Error while getting tenant';
            console.log(errorMessage, exception);
            return {
                error: {
                    code: 'service-getuser-apps',
                    message: 'Unknown Error',
                },
            };
        }
    });
}
const repository = {
    getApps,
};
exports["default"] = repository;


/***/ }),

/***/ "./apps/service-dashboard/route/user-apps.ts":
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
const tslib_1 = __webpack_require__("tslib");
const express = __webpack_require__("express");
const user_apps_1 = __webpack_require__("./apps/service-dashboard/service/user-apps.ts");
const router = express.Router();
router.get('/', (req, res) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    const result = yield user_apps_1.default.getUserApps(req.actionContext);
    res.status(result.error ? 500 : 200).send(result);
}));
exports["default"] = router;


/***/ }),

/***/ "./apps/service-dashboard/service/user-apps.ts":
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
const tslib_1 = __webpack_require__("tslib");
const user_apps_1 = __webpack_require__("./apps/service-dashboard/repository/user-apps.ts");
function getUserApps(context) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        try {
            return user_apps_1.default.getApps(context);
        }
        catch (exception) {
            const errorMessage = 'Error while getting user apps';
            console.log(errorMessage, exception);
            return {
                error: {
                    code: 'service-getuserapps',
                    message: 'Unknown Error',
                },
            };
        }
    });
}
const service = {
    getUserApps,
};
exports["default"] = service;


/***/ }),

/***/ "./libs/service-sdk/authorizer/authorizer.ts":
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.getOrigin = exports.handler = void 0;
const tslib_1 = __webpack_require__("tslib");
const use_cases_1 = __webpack_require__("./libs/service-sdk/authorizer/use-cases/index.ts");
const validate_local_1 = __webpack_require__("./libs/service-sdk/authorizer/validators/validate-local.ts");
const validate_request_headers_1 = __webpack_require__("./libs/service-sdk/authorizer/validators/validate-request-headers.ts");
const jwt = __webpack_require__("jsonwebtoken");
const AWS = __webpack_require__("aws-sdk");
const toPem = __webpack_require__("jwk-to-pem");
const getOrigin = (event) => {
    const origin = event.headers.origin || event.headers.host;
    event.headers.referer || event.headers.Referer || event.headers.authority || event.header.Authority;
    if (origin) {
        const spl = origin.split('.');
        if (spl && spl.length) {
            const protomatch = /^(https?):\/\//;
            return spl[0].replace(protomatch, '');
        }
    }
};
exports.getOrigin = getOrigin;
const getTenantId = (tenant) => {
    return tenant.sk.split('::')[1];
};
const dynamoDB = new AWS.DynamoDB.DocumentClient(
// eslint-disable-next-line no-undef
process.env.STAGE === 'local'
    ? {
        region: 'localhost',
        endpoint: 'http://localhost:8000',
    }
    : {});
const handler = (event, context, callback) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    let tenant = null;
    try {
        yield validate_request_headers_1.validateRequestHeaders(event);
        const origin = getOrigin(event);
        tenant = yield use_cases_1.loadTenant(dynamoDB, origin); // process.env.TENANTS[origin];
    }
    catch (err) {
        console.log('not found tenant: ', err);
        return callback(null, use_cases_1.getDenyPolicy());
    }
    const tenantId = getTenantId(tenant);
    const token = event.headers.Authorization || event.headers.authorization;
    const decoded = jwt.decode(token, { complete: true });
    const jwk = yield use_cases_1.loadJwk(decoded.payload.iss, (decoded === null || decoded === void 0 ? void 0 : decoded.header.kid) || '');
    if (!jwk) {
        return callback(null, use_cases_1.getDenyPolicy());
    }
    const pem = toPem(jwk);
    let payload = null;
    try {
        payload = yield use_cases_1.verifyToken(jwt, jwk, pem, token);
    }
    catch (err) {
        console.log('err111: ', err);
        return callback(null, use_cases_1.getDenyPolicy());
    }
    if (!payload) {
        return callback(null, use_cases_1.getDenyPolicy());
    }
    let permissions = [];
    const user = yield use_cases_1.getUser(dynamoDB, payload.username, tenantId);
    try {
        const groups = context.local ? user.roles.map((role) => role.replace('role::', '')) : payload['cognito:groups'];
        permissions = yield use_cases_1.getPermissions(dynamoDB, groups, tenantId);
    }
    catch (err) {
        console.log('err2222: ', err);
        return callback(null, use_cases_1.getDenyPolicy());
    }
    const permissionsList = (permissions) => {
        return permissions.map((perm) => perm.sk);
    };
    if (context.local) {
        const localDenyPolicy = yield validate_local_1.validateLocal(permissions, {
            uri: event.path,
            action: event.requestContext.httpMethod,
        });
        console.log('localdeny: ', localDenyPolicy);
        if (localDenyPolicy) {
            return callback(null, localDenyPolicy);
        }
    }
    const policyDocument = yield use_cases_1.generatePolicyDocument(permissions);
    const userId = user.sk;
    delete user.pk;
    delete user.sk;
    user.hotel_id = user.gs1sk || null;
    policyDocument.context = {
        tenant: JSON.stringify(tenant),
        permissions: JSON.stringify(permissions),
        email: payload.username,
        user: JSON.stringify(Object.assign(Object.assign({ id: userId }, user), { permissions: permissionsList(permissions) })),
    };
    console.log('polica e doksumentit: ', policyDocument);
    return callback(null, policyDocument);
});
exports.handler = handler;


/***/ }),

/***/ "./libs/service-sdk/authorizer/context-injector.ts":
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.contextInjector = exports.dbctxInjector = void 0;
const tslib_1 = __webpack_require__("tslib");
const authorizer_1 = __webpack_require__("./libs/service-sdk/authorizer/authorizer.ts");
const passthrough_1 = __webpack_require__("./libs/service-sdk/authorizer/validators/passthrough.ts");
const shared_1 = __webpack_require__("./libs/shared/index.ts");
const connection_1 = __webpack_require__("./libs/service-sdk/db-provider/postgres/connection.ts");
const dbctxInjector = (servicedb, entities) => {
    return (req, res, next) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
        try {
            const origin = authorizer_1.getOrigin(req);
            const { conn, repositories } = yield connection_1.getConnection(origin, servicedb, entities);
            req.conn = conn;
            req.repositories = repositories;
            console.log('setting-connection dbx-injector');
            return next();
        }
        catch (err) {
            console.log('dbctx-injector-error: ', err);
            res.status(500).json({
                status: 500,
                message: 'Connection could not be established',
            });
        }
    });
};
exports.dbctxInjector = dbctxInjector;
const contextInjector = (req, res, next) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d;
    console.log('context-injector-warmup-event: ', (_b = (_a = req === null || req === void 0 ? void 0 : req.apiGateway) === null || _a === void 0 ? void 0 : _a.event) === null || _b === void 0 ? void 0 : _b.source);
    if (((_d = (_c = req === null || req === void 0 ? void 0 : req.apiGateway) === null || _c === void 0 ? void 0 : _c.event) === null || _d === void 0 ? void 0 : _d.source) === shared_1.warmupkey) {
        console.log('WarmUP - Lambda is warm!');
        return;
    }
    try {
        if (passthrough_1.isExempt(req.path)) {
            return next();
        }
        const requestContext = req.requestContext || createRequestContext(req);
        requestContext.authorizer = requestContext.authorizer || (yield authorize(createEvent(req, requestContext)));
        req.actionContext = createActionContext(requestContext);
        console.log('LOGGER HERE');
        return next();
    }
    catch (err) {
        console.log({ err });
        res.status(403).json({
            status: 403,
            message: err.message,
        });
    }
});
exports.contextInjector = contextInjector;
const createActionContext = (requestContext) => {
    const tenant = JSON.parse(requestContext.authorizer.tenant || requestContext.authorizer.context.tenant);
    let userDetails = requestContext.authorizer.user || requestContext.authorizer.context.user;
    if (process.env.STAGE === 'local') {
        userDetails = JSON.parse(userDetails);
        userDetails.permissions = userDetails.permissions.map(permission => {
            const perm = permission.split("::");
            return perm[perm.length - 1];
        });
    }
    return {
        tenant: tenant,
        authorizedUser: typeof userDetails === 'string' ? JSON.parse(userDetails) : userDetails,
    };
};
const createRequestContext = (req) => {
    return {
        accountId: '',
        apiId: '',
        httpMethod: req.method.toUpperCase(),
        identity: undefined,
        path: req.path,
        protocol: '',
        requestId: '',
        requestTimeEpoch: 0,
        resourceId: '',
        resourcePath: '',
        stage: '',
        authorizer: undefined,
    };
};
const createEvent = (req, requestContext) => {
    return {
        headers: req.headers,
        httpMethod: req.method.toUpperCase(),
        isBase64Encoded: false,
        multiValueHeaders: undefined,
        multiValueQueryStringParameters: undefined,
        path: req.path,
        pathParameters: req.params,
        queryStringParameters: req.query,
        requestContext,
        resource: '',
        stageVariables: undefined,
        body: req.body,
    };
};
const authorize = (event) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    return new Promise((resolve, reject) => {
        authorizer_1.handler(event, {
            local: process.env.STAGE === 'local',
        }, (err, data) => {
            if (err) {
                reject(err);
            }
            if (data.context && data.context.deny) {
                reject(new Error('Permission denied'));
            }
            resolve(data);
        });
    });
});


/***/ }),

/***/ "./libs/service-sdk/authorizer/index.ts":
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
const tslib_1 = __webpack_require__("tslib");
tslib_1.__exportStar(__webpack_require__("./libs/service-sdk/authorizer/authorizer.ts"), exports);
tslib_1.__exportStar(__webpack_require__("./libs/service-sdk/authorizer/context-injector.ts"), exports);


/***/ }),

/***/ "./libs/service-sdk/authorizer/use-cases/generate-policy-document.ts":
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.policyObject = exports.generatePolicyDocument = void 0;
const tslib_1 = __webpack_require__("tslib");
const policyObject = {
    principalId: '1234',
    policyDocument: {
        Version: '2012-10-17',
    },
};
exports.policyObject = policyObject;
const generatePolicyDocument = (permissions) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    const statements = [];
    permissions.forEach((permission) => {
        statements.push({
            Action: 'execute-api:Invoke',
            Effect: 'Allow',
            Resource: permission.arn,
        });
    });
    policyObject.policyDocument.Statement = statements;
    return policyObject;
});
exports.generatePolicyDocument = generatePolicyDocument;


/***/ }),

/***/ "./libs/service-sdk/authorizer/use-cases/get-deny-policy.ts":
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.getDenyPolicy = void 0;
const generate_policy_document_1 = __webpack_require__("./libs/service-sdk/authorizer/use-cases/generate-policy-document.ts");
const getDenyPolicy = () => {
    generate_policy_document_1.policyObject.policyDocument.Statement = [
        {
            Action: 'execute-api:Invoke',
            Effect: 'Deny',
            Resource: '*',
        },
    ];
    generate_policy_document_1.policyObject.context = {
        deny: true,
    };
    return generate_policy_document_1.policyObject;
};
exports.getDenyPolicy = getDenyPolicy;


/***/ }),

/***/ "./libs/service-sdk/authorizer/use-cases/get-permissions.ts":
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.getPermissions = void 0;
const tslib_1 = __webpack_require__("tslib");
const get_roles_1 = __webpack_require__("./libs/service-sdk/authorizer/use-cases/get-roles.ts");
const getPermissions = (dynamoDb, roles, tenantId) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    const roleData = yield get_roles_1.getRoles(dynamoDb, roles, tenantId);
    if (!roleData || !roleData.length) {
        throw new Error('No roles found');
    }
    let permissions = [];
    roleData.forEach((item) => {
        if (item.permissions) {
            permissions.push(...item.permissions);
        }
    });
    permissions = permissions.filter((value, index, self) => {
        return self.indexOf(value) === index;
    });
    const permKeys = [];
    permissions.forEach((perm) => {
        permKeys.push({
            pk: 'permission',
            sk: perm,
        });
    });
    const permissionData = yield dynamoDb
        .batchGet({
        RequestItems: {
            [`${process.env.TABLE_MAIN}`]: {
                Keys: permKeys,
            },
        },
    })
        .promise();
    return permissionData.Responses[`${process.env.TABLE_MAIN}`];
});
exports.getPermissions = getPermissions;


/***/ }),

/***/ "./libs/service-sdk/authorizer/use-cases/get-roles.ts":
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.getRoles = void 0;
const tslib_1 = __webpack_require__("tslib");
const getRoles = (dynamoDb, roles, tenantId) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    const keys = [];
    roles.forEach((role) => {
        keys.push({ pk: 'role', sk: 'role::' + role });
    });
    const { Responses } = yield dynamoDb
        .batchGet({
        RequestItems: {
            [`iam-${process.env.STAGE}-${tenantId}`]: {
                Keys: keys,
            },
        },
    })
        .promise();
    return Responses[`iam-${process.env.STAGE}-${tenantId}`];
});
exports.getRoles = getRoles;


/***/ }),

/***/ "./libs/service-sdk/authorizer/use-cases/get-user.ts":
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.getUser = void 0;
const tslib_1 = __webpack_require__("tslib");
const getUser = (dynamoDb, email, tenantId) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    const params = {
        TableName: `iam-${process.env.STAGE}-${tenantId}`,
        KeyConditionExpression: ' #pk = :pk and #sk = :sk',
        ExpressionAttributeValues: {
            ':pk': 'user',
            ':sk': 'user::' + email,
        },
        ExpressionAttributeNames: {
            '#pk': 'pk',
            '#sk': 'sk',
        },
    };
    const result = yield dynamoDb.query(params).promise();
    if (result.Items && result.Items.length > 0) {
        return result.Items[0];
    }
    throw new Error('No user found');
});
exports.getUser = getUser;


/***/ }),

/***/ "./libs/service-sdk/authorizer/use-cases/index.ts":
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.loadTenant = exports.getPermissions = exports.getDenyPolicy = exports.generatePolicyDocument = exports.verifyToken = exports.getUser = exports.loadJwk = void 0;
const load_jwk_1 = __webpack_require__("./libs/service-sdk/authorizer/use-cases/load-jwk.ts");
Object.defineProperty(exports, "loadJwk", ({ enumerable: true, get: function () { return load_jwk_1.loadJwk; } }));
const get_user_1 = __webpack_require__("./libs/service-sdk/authorizer/use-cases/get-user.ts");
Object.defineProperty(exports, "getUser", ({ enumerable: true, get: function () { return get_user_1.getUser; } }));
const get_permissions_1 = __webpack_require__("./libs/service-sdk/authorizer/use-cases/get-permissions.ts");
Object.defineProperty(exports, "getPermissions", ({ enumerable: true, get: function () { return get_permissions_1.getPermissions; } }));
const verify_token_1 = __webpack_require__("./libs/service-sdk/authorizer/use-cases/verify-token.ts");
Object.defineProperty(exports, "verifyToken", ({ enumerable: true, get: function () { return verify_token_1.verifyToken; } }));
const generate_policy_document_1 = __webpack_require__("./libs/service-sdk/authorizer/use-cases/generate-policy-document.ts");
Object.defineProperty(exports, "generatePolicyDocument", ({ enumerable: true, get: function () { return generate_policy_document_1.generatePolicyDocument; } }));
const get_deny_policy_1 = __webpack_require__("./libs/service-sdk/authorizer/use-cases/get-deny-policy.ts");
Object.defineProperty(exports, "getDenyPolicy", ({ enumerable: true, get: function () { return get_deny_policy_1.getDenyPolicy; } }));
const load_tenant_1 = __webpack_require__("./libs/service-sdk/authorizer/use-cases/load-tenant.ts");
Object.defineProperty(exports, "loadTenant", ({ enumerable: true, get: function () { return load_tenant_1.loadTenant; } }));


/***/ }),

/***/ "./libs/service-sdk/authorizer/use-cases/load-jwk.ts":
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.loadJwk = void 0;
const tslib_1 = __webpack_require__("tslib");
const https_1 = __webpack_require__("https");
// const jwks = {"keys":[{"alg":"RS256","e":"AQAB","kid":"5YlnNGxAFWTvHX7ZXV3RWFK4oXwRDp7kWLamZv7za08=","kty":"RSA","n":"rZarF5SgV7Mru-bjatgOEqkpPPtKByb6DsbIocqZeP0X9LmyVmfzR_1mrs2Jex_CNU3Pmr2d-GT3HInawqWjdl3r0w-f1Vc0okJLu_GLDeRo_PpS110IsOh7kVN3tFIwoc9yc7V8HMNafSD01W1DguEySbcT4c2D9D5fczdJ6MI7WxXkhE8j6XsA7q8fee9DZ_MhUmKrq-wMXC3QtdPLmSwrWkwo9ZG4HVg5b2B1EN5b-HwZAtyAeM7vxfDtQchAy0YXHgBCOJ40zatpAMrTeKFTYcUL9o-VS_qir-DSzZxURGDZmNUQSsKF94PknXnhExFpaaDumWiP_-rd5uj4vw","use":"sig"},{"alg":"RS256","e":"AQAB","kid":"Ps20amm3Q+gjHdVdt933tDzZkuM0djcClA+rgXyG3X4=","kty":"RSA","n":"wWbTznD8g9M6ASF-JSzjdWF-O0Y6uiC7Cte0RifVNfe0ZgdEb5emvcryDrMhYKdWKcBEl4CvIRBL09b8LhJZZ2ONmM5So-GnmwBUuj5VPb96KdCy8SxQWqNdmY7EbYPT_Wag5Ay8cA8JBlc6J9lN53luHc5hONcvJy79UdJJBh1s_8e6XusUcUVLUzQZ5ms7GpPY5wg0n6iavRQLHx_1ZUYWBdSgkoW11BEhFD9BpM0oO0YKg1F9oeBZ1UZKobUfGHRt5jTW5ARRDhrAbvKpzEYeQ8aj7mTX1-QyJEXNvUFQXw8L5P7r1I-YAthlD6qtSgzy1BViPidPJ_vVkVPLMw","use":"sig"}]}
const loadJwk = (iss, kid) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    // return findJwk(jwks, kid)
    //todo: to be implemented later with cache mechanism
    const cognitoKeyUrl = `${iss}/.well-known/jwks.json`;
    return new Promise((resolve, reject) => {
        https_1.get(cognitoKeyUrl, (res) => {
            const data = [];
            res.on('data', (chunk) => {
                data.push(chunk);
            });
            res.on('end', () => {
                // eslint-disable-next-line no-undef
                const jwkResponse = JSON.parse(Buffer.concat(data).toString());
                resolve(findJwk(jwkResponse, kid));
            });
        }).on('error', (err) => {
            console.log('cant get jwks ', err);
            reject(err);
        });
    });
});
exports.loadJwk = loadJwk;
const findJwk = (jwkResponse, kidInput) => {
    var _a;
    return (_a = jwkResponse === null || jwkResponse === void 0 ? void 0 : jwkResponse.keys) === null || _a === void 0 ? void 0 : _a.find((key) => {
        return key.kid === kidInput;
    });
};


/***/ }),

/***/ "./libs/service-sdk/authorizer/use-cases/load-tenant.ts":
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.loadTenant = void 0;
const tslib_1 = __webpack_require__("tslib");
const loadTenant = (dynamoDB, tenantName) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    const params = {
        TableName: `${process.env.TABLE_MAIN}`,
        KeyConditionExpression: ' #pk = :pk and #sk = :sk',
        ExpressionAttributeValues: {
            ':pk': 'tenant',
            ':sk': `tenant::${tenantName}`,
        },
        ExpressionAttributeNames: {
            '#pk': 'pk',
            '#sk': 'sk',
        },
    };
    console.log('params: ', params);
    const result = yield dynamoDB.query(params).promise();
    if (result.Items && result.Items.length > 0) {
        return result.Items[0];
    }
    throw new Error('No tenant found');
});
exports.loadTenant = loadTenant;


/***/ }),

/***/ "./libs/service-sdk/authorizer/use-cases/verify-token.ts":
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.verifyToken = void 0;
const tslib_1 = __webpack_require__("tslib");
const verifyToken = (jwt, jwk, pem, token) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    return new Promise((resolve, reject) => {
        jwt.verify(token, pem, { algorithms: [jwk.alg] }, (err, decoded) => {
            if (err) {
                return reject(err);
            }
            return resolve(decoded);
        });
    });
});
exports.verifyToken = verifyToken;


/***/ }),

/***/ "./libs/service-sdk/authorizer/validators/passthrough.ts":
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.isExempt = void 0;
const exemptURIs = {
    '/api/iam/users/reset/password': true
};
const isExempt = (uri) => {
    return exemptURIs[uri];
};
exports.isExempt = isExempt;


/***/ }),

/***/ "./libs/service-sdk/authorizer/validators/validate-local.ts":
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.validateLocal = void 0;
const tslib_1 = __webpack_require__("tslib");
const get_deny_policy_1 = __webpack_require__("./libs/service-sdk/authorizer/use-cases/get-deny-policy.ts");
const validateLocal = (permissions, actionUriObj) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    const uris = [];
    if (permissions.length === 1 && permissions[0].sk === '*') {
        return null;
    }
    permissions.forEach((permission) => {
        const permissionSplit = permission.arn.split(':');
        const lastKey = permissionSplit[permissionSplit.length - 1];
        const uri = lastKey.split('/').slice(3, lastKey.length).join('/');
        const action = lastKey.split('/').slice(2, lastKey.length)[0];
        if (action === actionUriObj.action) {
            uris.push({
                uri: `/${uri}`,
                action: action,
            });
        }
    });
    const allowedPermissions = [];
    uris.forEach((arnUri) => {
        allowedPermissions.push(compareUris(arnUri.uri.substring(1).split('/'), actionUriObj.uri.substring(1).split('/')));
    });
    if (!allowedPermissions.includes(true)) {
        return get_deny_policy_1.getDenyPolicy();
    }
});
exports.validateLocal = validateLocal;
const compareUris = (arnUri, uriB) => {
    let cnt = 0;
    if (arnUri.length !== uriB.length && arnUri.length !== 0) {
        return false;
    }
    for (let i = 0; i < arnUri.length; i++) {
        if (arnUri[i] === '*') {
            cnt++;
            continue;
        }
        if (arnUri[i] === uriB[i]) {
            cnt++;
        }
    }
    return cnt === arnUri.length;
};


/***/ }),

/***/ "./libs/service-sdk/authorizer/validators/validate-request-headers.ts":
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.validateRequestHeaders = void 0;
const tslib_1 = __webpack_require__("tslib");
const validateRequestHeaders = (event) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    const requiredHeaders = {
        Origin: event.headers.referer ||
            event.headers.Referer ||
            event.headers.Authority ||
            event.headers.authority,
        Authorization: event.headers.Authorization || event.headers.authorization,
        Host: event.headers.Host || event.headers.host,
    };
    const missingHeaders = Object.keys(requiredHeaders).filter((key) => {
        const header = requiredHeaders[key];
        return header === undefined || header === null;
    });
    if (missingHeaders && missingHeaders.length) {
        let msg = '';
        missingHeaders.forEach((header) => {
            msg += 'Missing header [' + header + ']\n';
        });
        throw new Error(msg);
    }
});
exports.validateRequestHeaders = validateRequestHeaders;


/***/ }),

/***/ "./libs/service-sdk/db-provider/dynamodb/audit.ts":
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.update = exports.remove = exports.create = void 0;
const create = (actionContext, item) => {
    item.created_at = Date.now();
    // item.created_by_id = actionContext.authorizedUser.id;
    item.created_by = actionContext.authorizedUser;
};
exports.create = create;
const remove = (actionContext, item) => {
    item.deleted_at = Date.now();
    // item.deleted_by_id = actionContext.authorizedUser.id;
    item.deleted_by = actionContext.authorizedUser;
};
exports.remove = remove;
const update = (actionContext, item) => {
    item.created_at = Date.now();
    // item.created_by_id = actionContext.authorizedUser.id;
    item.created_by = actionContext.authorizedUser;
};
exports.update = update;


/***/ }),

/***/ "./libs/service-sdk/db-provider/dynamodb/client.ts":
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.dynamoDBClient = void 0;
const client_dynamodb_1 = __webpack_require__("@aws-sdk/client-dynamodb");
const lib_dynamodb_1 = __webpack_require__("@aws-sdk/lib-dynamodb");
// Set the AWS Region.
const isTest = process.env.JEST_WORKER_ID;
const config = process.env.STAGE === 'local' || isTest ? {
    region: 'local',
    endpoint: 'http://localhost:8000',
    sslEnabled: false,
} : { region: process.env.REGION };
const marshallOptions = {
    // Whether to automatically convert empty strings, blobs, and sets to `null`.
    convertEmptyValues: false,
    // Whether to delete-resource undefined values while marshalling.
    removeUndefinedValues: true,
    // Whether to convert typeof object to map attribute.
    convertClassInstanceToMap: false, // false, by default.
};
// Create an Amazon DynamoDB service client object.
const client = new client_dynamodb_1.DynamoDBClient(config);
// const client = new DynamoDBClient({ region: 'us-east-1' });
const dynamoDBClient = lib_dynamodb_1.DynamoDBDocument.from(client, { marshallOptions });
exports.dynamoDBClient = dynamoDBClient;


/***/ }),

/***/ "./libs/service-sdk/db-provider/dynamodb/filter.ts":
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.getListFilters = exports.parseGroupFilters = exports.parseArrayFilters = exports.parseListFilters = exports.getSingleFilters = exports.filter = exports.parseDynamoFilters = exports.parseFilters = exports.constructFilterExpression = exports.operationExecute = exports.general = exports.conditionMapper = exports.QUERY_GROUP_IDENTIFIER = exports.QUERY_ARRAY_GROUP_IDENTIFIER = exports.SpecialOperations = exports.GeneralOperations = void 0;
const tslib_1 = __webpack_require__("tslib");
const util_dynamodb_1 = __webpack_require__("@aws-sdk/util-dynamodb");
const _ = __webpack_require__("lodash");
const util_1 = __webpack_require__("./libs/service-sdk/db-provider/dynamodb/util.ts");
var GeneralOperations;
(function (GeneralOperations) {
    GeneralOperations["EQ"] = "eq";
    GeneralOperations["NEQ"] = "neq";
    GeneralOperations["GT"] = "gt";
    GeneralOperations["GTE"] = "gte";
    GeneralOperations["LT"] = "lt";
    GeneralOperations["LTE"] = "lte";
})(GeneralOperations = exports.GeneralOperations || (exports.GeneralOperations = {}));
var SpecialOperations;
(function (SpecialOperations) {
    SpecialOperations["BEGINS_WITH"] = "begins_with";
    SpecialOperations["BETWEEN"] = "between";
    SpecialOperations["CONTAINS"] = "contains";
    SpecialOperations["ATTR_EXISTS"] = "attribute_exists";
    SpecialOperations["ATTR_NOT_EXISTS"] = "attribute_not_exists";
    SpecialOperations["IN"] = "in";
})(SpecialOperations = exports.SpecialOperations || (exports.SpecialOperations = {}));
exports.QUERY_ARRAY_GROUP_IDENTIFIER = 'ARRAY-GROUPED(';
exports.QUERY_GROUP_IDENTIFIER = 'GROUP-';
/**
 *
 * @param {string} input
 * @return {string}
 */
function conditionMapper(input) {
    const map = {
        eq: '=',
        neq: '<>',
        gt: '>',
        lt: '<',
        gte: '>=',
        lte: '<=',
        ge: '>=',
        le: '<=',
        begins_with: 'begins_with',
        between: 'between',
        contains: 'contains',
        attribute_exists: 'attribute_exists',
        attribute_not_exists: 'attribute_not_exists',
        in: 'in',
    };
    return map[input];
}
exports.conditionMapper = conditionMapper;
/**
 *
 * @param {string} condition
 * @return {GeneralOperations | SpecialOperations}
 */
function conditionToOperation(condition) {
    const map = {
        eq: GeneralOperations.EQ,
        neq: GeneralOperations.NEQ,
        gt: GeneralOperations.GT,
        lt: GeneralOperations.LT,
        gte: GeneralOperations.GTE,
        lte: GeneralOperations.LTE,
        begins_with: SpecialOperations.BEGINS_WITH,
        between: SpecialOperations.BETWEEN,
        contains: SpecialOperations.CONTAINS,
        attribute_exists: SpecialOperations.ATTR_EXISTS,
        attribute_not_exists: SpecialOperations.ATTR_NOT_EXISTS,
        in: SpecialOperations.IN,
    };
    return map[condition];
}
const ComparisonOperator = Object.values(GeneralOperations).concat(Object.values(SpecialOperations));
/**
 *
 * @param {FilterType} filter
 * @param {number} index
 * @return {string}
 */
function general(filter, index) {
    const addedVal = (filter.nestedParamKey && filter.nestedParamVals) ? ('.#' + filter.nestedParamVals[0]) : '';
    return (index !== 0 ? ` ${filter.logicalOperator} ` : ' ') +
        '#' + filter.key + (addedVal ? addedVal : '') + ' ' +
        conditionMapper(filter.condition) +
        ' :' + filter.key +
        (filter.uniqueIdentifier ? filter.uniqueIdentifier : '');
}
exports.general = general;
/**
 *
 * @param {FilterType} filter
 * @param {number} index
 * @return {string}
 */
function beginsWith(filter, index) {
    return ((index !== 0 ? ` ${filter.logicalOperator} ` : ' ') +
        ' begins_with(#' +
        filter.key +
        ', :' +
        filter.key +
        ')');
}
/**
 *
 * @param {FilterType} filter
 * @param {number} index
 * @return {string}
 */
function between(filter, index) {
    return ((index !== 0 ? ` ${filter.logicalOperator} ` : ' ') +
        '(' +
        filter.key +
        ' between(' +
        ':' +
        filter.betweenA +
        ' and ' +
        ':' +
        filter.betweenB +
        ')' +
        ')');
}
/**
 *
 * @param {FilterType} filter
 * @param {number} index
 * @return {string}
 */
function contains(filter, index) {
    return ((index !== 0 ? ` ${filter.logicalOperator} ` : ' ') +
        ' contains(#' +
        `${filter.key}${filter.nestedParamVals.length > 0 ? filter.nestedParamVals.map(val => `.#${val}`) : ""} ` +
        ', :' +
        `${filter.key}${filter.uniqueIdentifier ? filter.uniqueIdentifier : ""}` +
        ')');
}
/**
 *
 * @param {FilterType} filter
 * @param {number} index
 * @return {string}
 */
function attrExists(filter, index) {
    // to be implemented
    console.log(filter, index);
    return '';
}
/**
 *
 * @param {FilterType} filter
 * @param {number} index
 * @return {string}
 */
function attrNotExists(filter, index) {
    // to be implemented
    console.log(filter, index);
    return '';
}
function inCondition(filter, index) {
    // to be implemented
    console.log(filter, index);
    return '';
}
function operationExecute(operation) {
    return {
        [GeneralOperations.EQ]: general,
        [GeneralOperations.NEQ]: general,
        [GeneralOperations.GT]: general,
        [GeneralOperations.GTE]: general,
        [GeneralOperations.LT]: general,
        [GeneralOperations.LTE]: general,
        [SpecialOperations.BEGINS_WITH]: beginsWith,
        [SpecialOperations.CONTAINS]: contains,
        [SpecialOperations.BEGINS_WITH]: beginsWith,
        [SpecialOperations.BETWEEN]: between,
        [SpecialOperations.BEGINS_WITH]: beginsWith,
        [SpecialOperations.ATTR_EXISTS]: attrExists,
        [SpecialOperations.ATTR_NOT_EXISTS]: attrNotExists,
        [SpecialOperations.IN]: inCondition,
    }[operation];
}
exports.operationExecute = operationExecute;
function constructFilterExpression(filter, index) {
    return operationExecute(conditionToOperation(filter.condition))(filter, index);
}
exports.constructFilterExpression = constructFilterExpression;
function parseFilters(keys, filters) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const filterHolder = [];
        const validationObj = {};
        if (filters) {
            for (const key in filters) {
                if ({}.hasOwnProperty.call(filters, key)) {
                    let param = '';
                    let comparsionOperator = '';
                    let logicalOperator = 'and';
                    let randomNumber = null;
                    let nestedParamKey = '';
                    let nestedParamVals = [];
                    if (key.includes('[') && key.includes(']')) {
                        comparsionOperator = key.substring(key.lastIndexOf('[') + 1, key.lastIndexOf(']'));
                        if (comparsionOperator.includes('|')) {
                            logicalOperator = comparsionOperator.substring(0, comparsionOperator.lastIndexOf('|'));
                            comparsionOperator = comparsionOperator.substring(comparsionOperator.lastIndexOf('|') + 1);
                        }
                        if (!ComparisonOperator.includes(comparsionOperator)) {
                            throw new Error('Invalid comparison operator used');
                        }
                        param = key.substring(0, key.lastIndexOf('['));
                        if (param.startsWith('(')) {
                            param = param.substring(param.lastIndexOf(')') + 1);
                            randomNumber = Math.floor(Math.random() * 1000);
                        }
                        if (param.startsWith('GROUP')) {
                            logicalOperator = "or";
                        }
                        const nestedParam = param.includes('.') ? param.split('.') : [];
                        nestedParamKey = nestedParam[0] || '';
                        nestedParamVals = nestedParam.slice(1) || [];
                        if (validationObj[param]) {
                            randomNumber = Math.floor(Math.random() * 1000);
                        }
                        validationObj[param] = filters[key];
                    }
                    else {
                        throw new Error(`No [comparison-operator] found in ${key}`);
                    }
                    filterHolder.push({
                        logicalOperator: logicalOperator,
                        keyExpression: isKeyExpression(keys, param),
                        key: nestedParamKey ? nestedParamKey : param,
                        condition: comparsionOperator,
                        value: filters[key],
                        uniqueIdentifier: randomNumber,
                        nestedParamKey,
                        nestedParamVals
                    });
                }
            }
        }
        return filterHolder;
    });
}
exports.parseFilters = parseFilters;
function isKeyExpression(keys, param) {
    for (let i = 0; i < keys.length; i++) {
        if (keys[i] === param) {
            return true;
        }
    }
    return false;
}
//fix return type
const filter = (keys, filters) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    return yield parseDynamoFilters(yield parseFilters(keys, filters));
});
exports.filter = filter;
const parsePaginationFilters = (filters) => {
    const { limit, lastEvaluatedKey, back } = filters;
    const limitFilter = limit ? { 'limit[eq]': +limit } : { 'limit[eq]': +util_1.DEFAULT_TABLE_LIMIT };
    const lastEvaluatedKeyFilter = lastEvaluatedKey
        ? { 'lastEvaluatedKey[eq]': lastEvaluatedKey }
        : null;
    const backFilter = back ? { 'scanIndexForward[eq]': false } : null;
    return Object.assign(Object.assign(Object.assign({}, limitFilter), lastEvaluatedKeyFilter), backFilter);
};
const getSingleFilters = (pk, sk) => {
    return {
        pk: { S: pk },
        sk: { S: sk },
    };
};
exports.getSingleFilters = getSingleFilters;
const parseListFilters = (pk, beginsWith, filters) => {
    const paginationFilters = parsePaginationFilters(filters);
    const baseFilter = {
        'pk[eq]': pk,
        'sk[begins_with]': beginsWith,
    };
    return Object.assign(Object.assign({}, baseFilter), paginationFilters);
};
exports.parseListFilters = parseListFilters;
const getListFilters = (pk, beginsWith) => {
    const baseFilter = {
        'pk[eq]': pk,
        'sk[begins_with]': beginsWith,
    };
    console.log("baseFilter", baseFilter);
    return Object.assign({}, baseFilter);
};
exports.getListFilters = getListFilters;
const parseArrayFilters = (filters, column, 
//TODO make options object
booleanValues, grouped) => {
    const filterObj = {};
    filters === null || filters === void 0 ? void 0 : filters.forEach((value, id) => {
        filterObj[`${grouped ? `${exports.QUERY_ARRAY_GROUP_IDENTIFIER}${column})` : ''}(${id})${column}[${id == 0 ? 'eq' : 'or|eq'}]`] = booleanValues
            ? value == 'true'
            : value;
    });
    return filterObj;
};
exports.parseArrayFilters = parseArrayFilters;
const parseGroupFilters = (filters) => {
    const filterObj = {};
    filters === null || filters === void 0 ? void 0 : filters.forEach(({ key, value, operator }) => {
        filterObj[`${exports.QUERY_GROUP_IDENTIFIER}${key}[${operator}]`] = value;
    });
    return filterObj;
};
exports.parseGroupFilters = parseGroupFilters;
/**
 * todo: move to the dynamodb package
 * @param {Array<FilterType>} filters
 * @return {any}
 */
function parseDynamoFilters(filters) {
    var _a, _b;
    if (filters.length === 0) {
        throw new Error('No empty filters - pk is mandatory');
    }
    let filterExpression = '';
    let keyConditionExpression = '';
    const expressionAttributeValues = {};
    const expressionAttributeNames = {};
    let groupedArrayFilters = {};
    const filteredFilters = _.groupBy(filters, 'keyExpression');
    const limit = _.remove(filteredFilters.false, function (filter) {
        return filter.key === 'limit';
    });
    const lastEvaluatedKey = _.remove(filteredFilters.false, function (filter) {
        return filter.key === 'lastEvaluatedKey';
    });
    const groupFilters = _.remove(filteredFilters.false, function (filter) {
        return filter.key.startsWith("GROUP");
    });
    const groupArrayFilters = _.remove(filteredFilters.false, function (filter) {
        return filter.key.startsWith(exports.QUERY_ARRAY_GROUP_IDENTIFIER);
    });
    groupArrayFilters.forEach(filter => {
        if (filter.key.startsWith(exports.QUERY_ARRAY_GROUP_IDENTIFIER)) {
            /*
                  This regex gets the column name from the filter key
                  e.x.ARRAY - GROUPED(city_id)...and it extracts city_id
                  The regex returns a group:
                   - first element is text with parentheses -> access index 0
                   - second element is without parentheses -> access index 1
                  */
            const getColumnNameRegex = /\(([^)]+)\)/;
            const column = filter.key.match(getColumnNameRegex) && filter.key.match(getColumnNameRegex)[1];
            if (groupedArrayFilters.hasOwnProperty(column)) {
                groupedArrayFilters[column].push(filter);
            }
            else {
                groupedArrayFilters[column] = [filter];
            }
        }
    });
    const indexName = _.remove(filteredFilters.false, function (filter) {
        return filter.key === 'indexName';
    });
    const scanIndexForward = _.remove(filteredFilters.false, function (filter) {
        return filter.key === 'scanIndexForward';
    });
    let groupedFilterExpression = "";
    let groupedArrayFilterExpression = "";
    groupFilters.forEach((filter, idx) => {
        filter.key = filter.key.substring(filter.key.lastIndexOf('-') + 1);
        expressionAttributeNames[`#${filter.key}`] = filter.key;
        expressionAttributeValues[`:${filter.key}`] = util_dynamodb_1.marshall({ [filter.key]: filter.value })[filter.key];
        if (filter.condition == 'ATTR_EXISTS' ||
            filter.condition == 'ATTR_NOT_EXISTS' ||
            filter.condition == 'BETWEEN' ||
            filter.condition == 'IN') {
            throw new Error('The support for ATTR_EXISTS, ATTR_NOT_EXISTS, BETWEEN and IN operator is not supported yet on grouped filters');
        }
        const operation = operationExecute(conditionToOperation(filter.condition))(Object.assign(Object.assign({}, filter), { logicalOperator: idx != 0 ? filter.logicalOperator : "" }));
        groupedFilterExpression += operation;
    });
    (_a = filteredFilters.false) === null || _a === void 0 ? void 0 : _a.forEach((filter, index) => {
        filterExpression += constructFilterExpression(filter, index);
        expressionAttributeValues[`:${filter.key + (filter.uniqueIdentifier ? filter.uniqueIdentifier : '')}`] = util_dynamodb_1.marshall({ [filter.key]: filter.value })[filter.key];
        expressionAttributeNames[`#${filter.key}`] = filter.key;
        if (filter.nestedParamKey && filter.nestedParamVals) {
            filter.nestedParamVals.forEach(nestedVal => {
                expressionAttributeNames[`#${nestedVal}`] = nestedVal;
            });
        }
    });
    (_b = filteredFilters.true) === null || _b === void 0 ? void 0 : _b.forEach((filter, index) => {
        keyConditionExpression += constructFilterExpression(filter, index);
        expressionAttributeValues[`:${filter.key}`] = util_dynamodb_1.marshall({
            [filter.key]: filter.value,
        })[filter.key];
        expressionAttributeNames[`#${filter.key}`] = filter.key;
        if (filter.nestedParamKey && filter.nestedParamVals) {
            filter.nestedParamVals.forEach(nestedVal => {
                expressionAttributeNames[`#${nestedVal}`] = nestedVal;
            });
        }
    });
    Object.keys(groupedArrayFilters).forEach((key) => {
        const filters = groupedArrayFilters[key];
        filters.forEach((filter, idx) => {
            filter.key = filter.key.substring(filter.key.lastIndexOf(')') + 1);
            filter.uniqueIdentifier = Math.floor(Math.random() * 1000);
            expressionAttributeNames[`#${filter.key}`] = filter.key;
            expressionAttributeValues[`:${filter.key}${filter.uniqueIdentifier}`] = util_dynamodb_1.marshall({ [filter.key]: filter.value })[filter.key];
            if (filter.nestedParamKey && filter.nestedParamVals) {
                filter.nestedParamVals.forEach((nestedVal) => {
                    expressionAttributeNames[`#${nestedVal}`] = nestedVal;
                });
            }
            const operation = constructFilterExpression(filter, idx);
            groupedArrayFilterExpression += operation;
        });
        filterExpression += filterExpression.length > 0 ? ` and (${groupedArrayFilterExpression})` : `(${groupedArrayFilterExpression})`;
        groupedArrayFilterExpression = '';
    });
    if (groupFilters.length > 0) {
        filterExpression += filterExpression.length > 0 ? ` and (${groupedFilterExpression})` : `(${groupedFilterExpression})`;
    }
    return Object.assign({}, filterExpression !== '' ? { FilterExpression: filterExpression } : null, keyConditionExpression
        ? {
            KeyConditionExpression: keyConditionExpression,
        }
        : null, expressionAttributeValues
        ? {
            ExpressionAttributeValues: expressionAttributeValues,
        }
        : null, expressionAttributeNames
        ? {
            ExpressionAttributeNames: expressionAttributeNames,
        }
        : null, limit.length > 0 ? { Limit: limit[0].value } : null, lastEvaluatedKey.length > 0
        ? {
            ExclusiveStartKey: JSON.parse(Buffer.from(lastEvaluatedKey[0].value.toString(), 'base64').toString('ascii')),
        }
        : null, indexName.length > 0 ? { IndexName: indexName[0].value } : null, scanIndexForward.length
        ? {
            ScanIndexForward: scanIndexForward[0].value,
        }
        : null);
}
exports.parseDynamoFilters = parseDynamoFilters;


/***/ }),

/***/ "./libs/service-sdk/db-provider/dynamodb/index.ts":
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
const tslib_1 = __webpack_require__("tslib");
tslib_1.__exportStar(__webpack_require__("./libs/service-sdk/db-provider/dynamodb/client.ts"), exports);
tslib_1.__exportStar(__webpack_require__("./libs/service-sdk/db-provider/dynamodb/query.ts"), exports);
tslib_1.__exportStar(__webpack_require__("./libs/service-sdk/db-provider/dynamodb/types.ts"), exports);
tslib_1.__exportStar(__webpack_require__("./libs/service-sdk/db-provider/dynamodb/filter.ts"), exports);
tslib_1.__exportStar(__webpack_require__("./libs/service-sdk/db-provider/dynamodb/wrapper.ts"), exports);
tslib_1.__exportStar(__webpack_require__("./libs/service-sdk/db-provider/dynamodb/util.ts"), exports);


/***/ }),

/***/ "./libs/service-sdk/db-provider/dynamodb/mapper.ts":
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.mapper = void 0;
const tslib_1 = __webpack_require__("tslib");
const client_dynamodb_1 = __webpack_require__("@aws-sdk/client-dynamodb");
const lib_dynamodb_1 = __webpack_require__("@aws-sdk/lib-dynamodb");
const util_1 = __webpack_require__("./libs/service-sdk/db-provider/dynamodb/util.ts");
const filter_1 = __webpack_require__("./libs/service-sdk/db-provider/dynamodb/filter.ts");
const transform_response_1 = __webpack_require__("./libs/service-sdk/db-provider/dynamodb/transform-response.ts");
const types_1 = __webpack_require__("./libs/service-sdk/db-provider/dynamodb/types.ts");
//fix return types
const getParam = (tableName, mainKeys, filterInput) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    const filters = yield filter_1.filter(mainKeys, filterInput);
    console.log('FILTEREXPRESSION', filters);
    return Object.assign({ TableName: tableName }, filters);
});
const getSingleParams = (tableName, mainKeys, filterInput) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    //todo: check logic between keys and filterInput
    return {
        TableName: tableName,
        Key: filterInput,
    };
});
const mapper = {
    [types_1.ActionType.CREATE]: {
        params: util_1.GetPutParams,
        action: lib_dynamodb_1.PutCommand,
        transform: () => {
            return;
        },
    },
    [types_1.ActionType.UPDATE]: {
        params: util_1.GetUpdateParams,
        action: lib_dynamodb_1.UpdateCommand,
        transform: () => {
            return;
        },
    },
    [types_1.ActionType.PATCH]: {
        params: util_1.GetUpdateParams,
        action: lib_dynamodb_1.UpdateCommand,
        transform: () => {
            return;
        },
    },
    [types_1.ActionType.DELETE]: {
        params: util_1.GetDeleteParams,
        action: lib_dynamodb_1.DeleteCommand,
        transform: () => {
            return;
        },
    },
    [types_1.ActionType.SOFT_DELETE]: {
        params: util_1.GetSoftDeleteParams,
        action: lib_dynamodb_1.TransactWriteCommand,
        transform: () => {
            return;
        },
    },
    [types_1.ActionType.GET]: {
        params: getParam,
        action: client_dynamodb_1.QueryCommand,
        transform: transform_response_1.transformMultiple,
    },
    [types_1.ActionType.GET_SINGLE]: {
        params: getSingleParams,
        action: client_dynamodb_1.GetItemCommand,
        transform: transform_response_1.transformSingle,
    },
};
exports.mapper = mapper;


/***/ }),

/***/ "./libs/service-sdk/db-provider/dynamodb/query.ts":
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Query = void 0;
const tslib_1 = __webpack_require__("tslib");
const mapper_1 = __webpack_require__("./libs/service-sdk/db-provider/dynamodb/mapper.ts");
const shared_1 = __webpack_require__("./libs/shared/index.ts");
const client_1 = __webpack_require__("./libs/service-sdk/db-provider/dynamodb/client.ts");
const types_1 = __webpack_require__("./libs/service-sdk/db-provider/dynamodb/types.ts");
const formatLastEvaluatedKey = (out) => {
    let { LastEvaluatedKey } = out;
    if (LastEvaluatedKey) {
        const nextKey = Buffer.from(JSON.stringify(LastEvaluatedKey));
        LastEvaluatedKey = nextKey.toString('base64');
    }
    out.LastEvaluatedKey = LastEvaluatedKey;
};
const Query = (queryInput) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    const { action, tableName, keys, filterInput, outputKeys, projection } = queryInput;
    try {
        const params = yield mapper_1.mapper[action].params(tableName, keys, filterInput);
        const out = yield client_1.dynamoDBClient.send(new mapper_1.mapper[action].action(params));
        if (!out['Item'] && !out['Items']) {
            return {
                key: '',
                result: null,
            };
        }
        formatLastEvaluatedKey(out);
        return mapper_1.mapper[action].transform(out, outputKeys);
    }
    catch (err) {
        console.log("dynamodb-query-sdk-err", err);
        throw shared_1.GENERAL_ACTION_ERROR(types_1.ActionType[action], 'error'); //todo: throw different error
    }
});
exports.Query = Query;


/***/ }),

/***/ "./libs/service-sdk/db-provider/dynamodb/transform-response.ts":
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.transformSingle = exports.transformMultiple = void 0;
const util_dynamodb_1 = __webpack_require__("@aws-sdk/util-dynamodb");
/**
 * TODO FIX THIS
 */
function getEnv(configs) {
    return {
        configs: {
            totalNumberOfIndexes: 10,
        },
    }[configs];
}
const removePartitionKeys = (out) => {
    delete out.pk;
    delete out.sk;
    const num = getEnv('configs').totalNumberOfIndexes;
    for (let i = 0; i <= num; i++) {
        delete out[`gs${i}pk`];
        delete out[`gs${i}sk`];
    }
};
const transformMultiple = function (data, outputKeys) {
    return {
        result: data.Items.map((item) => {
            const it = util_dynamodb_1.unmarshall(item);
            const transformed = Object.assign({ id: it.sk, createdAt: it.createdAt, createdBy: it.createdBy }, it);
            if (!outputKeys) {
                removePartitionKeys(transformed);
            }
            return transformed;
        }),
        lastEvaluatedKey: data.LastEvaluatedKey ? data.LastEvaluatedKey : '',
    };
};
exports.transformMultiple = transformMultiple;
const transformSingle = function (dataInput, outputKeys) {
    const data = dataInput.Item && Object.keys(dataInput.Item).length
        ? dataInput.Item
        : null;
    const item = util_dynamodb_1.unmarshall(data);
    const { sk } = item;
    if (!outputKeys) {
        removePartitionKeys(item);
    }
    return item
        ? {
            result: Object.assign({ id: sk, created_at: item.created_at, created_by: item.created_by }, item),
        }
        : {
            result: {},
        };
};
exports.transformSingle = transformSingle;


/***/ }),

/***/ "./libs/service-sdk/db-provider/dynamodb/types.ts":
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ActionType = void 0;
var ActionType;
(function (ActionType) {
    ActionType[ActionType["CREATE"] = 0] = "CREATE";
    ActionType[ActionType["UPDATE"] = 1] = "UPDATE";
    ActionType[ActionType["DELETE"] = 2] = "DELETE";
    ActionType[ActionType["SOFT_DELETE"] = 3] = "SOFT_DELETE";
    ActionType[ActionType["GET"] = 4] = "GET";
    ActionType[ActionType["GET_SINGLE"] = 5] = "GET_SINGLE";
    ActionType[ActionType["BATCH_GET"] = 6] = "BATCH_GET";
    ActionType[ActionType["PATCH"] = 7] = "PATCH";
})(ActionType || (ActionType = {}));
exports.ActionType = ActionType;


/***/ }),

/***/ "./libs/service-sdk/db-provider/dynamodb/util.ts":
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.transactGetAll = exports.transactWriteAll = exports.uuidv4 = exports.constructUpdateExpression = exports.generateKey = exports.ALL_PARTITION_SORT_KEYS = exports.stringEvaluatedKeyAsObject = exports.objectEvaluatedKeyAsString = exports.GetSoftDeleteParams = exports.GetDeleteParams = exports.GetUpdateParams = exports.GetPutParams = exports.dynamoUtil = exports.DEFAULT_TABLE_LIMIT = exports.uniqueID = void 0;
const tslib_1 = __webpack_require__("tslib");
const client_dynamodb_1 = __webpack_require__("@aws-sdk/client-dynamodb");
const uuid = __webpack_require__("uuid");
const client_1 = __webpack_require__("./libs/service-sdk/db-provider/dynamodb/client.ts");
const util_dynamodb_1 = __webpack_require__("@aws-sdk/util-dynamodb");
const ALL_PARTITION_SORT_KEYS = [
    'pk',
    'sk',
    'gs0pk',
    'gs0sk',
    'gs1pk',
    'gs1sk',
    'gs2pk',
    'gs2sk',
    'gs3pk',
    'gs3sk',
    'gs4pk',
    'gs4sk',
    'gs5pk',
    'gs5sk',
    'gs6pk',
    'gs6sk',
    'gs7pk',
    'gs7sk',
    'gs8pk',
    'gs8sk',
    'gs9pk',
    'gs9sk',
];
exports.ALL_PARTITION_SORT_KEYS = ALL_PARTITION_SORT_KEYS;
function dynamoUtil() {
    return 'dynamo-util';
}
exports.dynamoUtil = dynamoUtil;
function uuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = (Math.random() * 16) | 0;
        const v = c == 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
    });
}
exports.uuidv4 = uuidv4;
function uniqueID(input) {
    return input ? uuid.v5(input, uuid.v5.DNS) : uuidv4();
}
exports.uniqueID = uniqueID;
const generateKey = (partitionKey, sortKey) => {
    return {
        pk: partitionKey,
        sk: sortKey || `${partitionKey}::${uuidv4()}`,
    };
};
exports.generateKey = generateKey;
// todo: refactor
const setAuditData = (item, action, authUser) => {
    switch (action) {
        case 'create':
            if (!item.deleted_at) {
                item.created_at = Date.now();
                item.created_by_id = authUser.sk;
                item.created_by = { email: authUser.email };
            }
            break;
        case 'update':
            if (!item.deleted_at) {
                item.updated_at = Date.now();
                item.updated_by_id = authUser.sk;
                item.updated_by = { email: authUser.email };
            }
            break;
        case 'delete':
            item.deleted_at = Date.now();
            item.deleted_by_id = authUser.sk;
            item.deleted_by = { email: authUser.email };
            break;
    }
};
const GetPutParams = (tableName, pkIn, skIn, data, authUser) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    const { pk, sk } = generateKey(pkIn, skIn || null);
    const item = Object.assign({}, data);
    item.pk = pk;
    item.sk = sk;
    setAuditData(item, 'create', authUser);
    return {
        TableName: tableName,
        Item: item,
        ConditionExpression: 'attribute_not_exists(pk)',
    };
});
exports.GetPutParams = GetPutParams;
const constructUpdateExpression = (input, uniqueProperty) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    let updateExpression = 'set ';
    const expressionAttrValues = {};
    const expressionAttrNames = {};
    // const numUniqueKeys = ['pk', 'sk', uniqueProperty].length
    Object.keys(input).forEach((key) => {
        if (input[key] === undefined || input[key] === null || input[key] === '') {
            delete input[key];
        }
    });
    const obPropLength = Object.keys(input).length;
    Object.keys(input).forEach((key, index) => {
        const isKey = key === 'pk' || key === 'sk' || key === uniqueProperty;
        if (!isKey) {
            // if (input[key]) {
            updateExpression += `#n${index} = :t${index}${index !== obPropLength - 1 ? ', ' : ''}`;
            expressionAttrValues[`:t${index}`] = input[key];
            expressionAttrNames[`#n${index}`] = key;
            // }
        }
    });
    // todo: fix this
    updateExpression = updateExpression.replace(/,\s*$/, '');
    return {
        updateExpression,
        expressionAttrValues,
        expressionAttrNames,
    };
});
exports.constructUpdateExpression = constructUpdateExpression;
const GetUpdateParams = (tableName, pkIn, skIn, data, authUser) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    const { updateExpression, expressionAttrValues, expressionAttrNames, } = yield constructUpdateExpression(data, skIn);
    const { pk, sk } = generateKey(pkIn, skIn || null);
    return {
        TableName: tableName,
        Key: {
            pk,
            sk,
        },
        UpdateExpression: updateExpression,
        ExpressionAttributeValues: expressionAttrValues,
        ExpressionAttributeNames: expressionAttrNames,
    };
});
exports.GetUpdateParams = GetUpdateParams;
const getConditionCheck = (data) => {
    let ConditionExpression = '';
    const ExpressionAttributeNames = {};
    const ExpressionAttributeValues = {};
    const total = Object.keys(data);
    Object.keys(data).forEach((d, index) => {
        if (!['sk', 'pk'].includes(d)) {
            ConditionExpression += `#${d} = :${d} ${index === total.length - 1 ? '' : 'AND '}`;
            ExpressionAttributeNames[`#${d}`] = d;
            ExpressionAttributeValues[`:${d}`] = data[d];
        }
    });
    return {
        ConditionExpression,
        ExpressionAttributeNames,
        ExpressionAttributeValues,
    };
};
const GetSoftDeleteParams = (tableName, pkIn, skIn, data, authUser) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    setAuditData(data, 'delete', authUser);
    const putParams = yield GetPutParams(tableName, pkIn, skIn, data, authUser);
    putParams.Item.sk = `deleted::${putParams.Item.sk}`;
    const deleteParams = yield GetDeleteParams(tableName, pkIn, skIn, data, authUser);
    return {
        TransactItems: [{ Put: Object.assign({}, putParams) }, { Delete: Object.assign({}, deleteParams) }],
    };
});
exports.GetSoftDeleteParams = GetSoftDeleteParams;
const GetDeleteParams = (tableName, pkIn, skIn, data, authUser) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    const { pk, sk } = generateKey(pkIn, skIn);
    return {
        TableName: tableName,
        Key: {
            pk,
            sk,
        },
    };
});
exports.GetDeleteParams = GetDeleteParams;
const uniqueConcatStr = '::||::';
const keyValStr = '--||--';
const objectEvaluatedKeyAsString = (inJSON) => {
    return (Object.keys(inJSON).join(uniqueConcatStr) +
        keyValStr +
        Object.values(inJSON).join(uniqueConcatStr));
};
exports.objectEvaluatedKeyAsString = objectEvaluatedKeyAsString;
const stringEvaluatedKeyAsObject = (inSTR) => {
    const [keys, values] = inSTR.split(keyValStr);
    const ke = keys.split(uniqueConcatStr);
    const va = values.split(uniqueConcatStr);
    const ob = {};
    for (let i = 0; i < ke.length; i++) {
        ob[ke[i]] = va[i];
    }
    return ob;
};
exports.stringEvaluatedKeyAsObject = stringEvaluatedKeyAsObject;
const transactWriteAll = (TransactItems) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    const parts = Math.ceil(TransactItems.length / 25);
    try {
        for (let i = 0; i < parts; i++) {
            const start = 25 * i;
            const end = i === 0 ? 25 : 25 * (i + 1);
            yield client_1.dynamoDBClient.send(new client_dynamodb_1.TransactWriteItemsCommand({
                TransactItems: TransactItems.slice(start, end)
            }));
            console.log('transact-write-success: ', {
                start,
                end
            });
        }
    }
    catch (err) {
        console.log('transact-write-all-fail: ', err);
    }
});
exports.transactWriteAll = transactWriteAll;
const transactGetAll = (TransactItems) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    const parts = Math.ceil(TransactItems.length / 25);
    const data = [];
    try {
        for (let i = 0; i < parts; i++) {
            const start = 25 * i;
            const end = i === 0 ? 25 : 25 * (i + 1);
            const getResult = yield client_1.dynamoDBClient.send(new client_dynamodb_1.TransactGetItemsCommand({
                TransactItems: TransactItems.slice(start, end)
            }));
            getResult.Responses.forEach(el => {
                if (el.Item) {
                    data.push(util_dynamodb_1.unmarshall(Object.assign({}, el.Item)));
                }
            });
        }
    }
    catch (err) {
        console.log('transact-get-all-fail: ', err);
    }
    return data;
});
exports.transactGetAll = transactGetAll;
exports.DEFAULT_TABLE_LIMIT = 100;


/***/ }),

/***/ "./libs/service-sdk/db-provider/dynamodb/wrapper.ts":
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.transactMultipleItems = exports.replace = exports.remove = exports.getMultiple = exports.getSingle = exports.update = exports.create = void 0;
const tslib_1 = __webpack_require__("tslib");
/* eslint-disable @typescript-eslint/no-unused-expressions */
const lib_dynamodb_1 = __webpack_require__("@aws-sdk/lib-dynamodb");
const shared_1 = __webpack_require__("./libs/shared/index.ts");
const setAuditFields = __webpack_require__("./libs/service-sdk/db-provider/dynamodb/audit.ts");
const types_1 = __webpack_require__("./libs/service-sdk/db-provider/dynamodb/types.ts");
const util_1 = __webpack_require__("./libs/service-sdk/db-provider/dynamodb/util.ts");
const client_1 = __webpack_require__("./libs/service-sdk/db-provider/dynamodb/client.ts");
const filter_1 = __webpack_require__("./libs/service-sdk/db-provider/dynamodb/filter.ts");
const query_1 = __webpack_require__("./libs/service-sdk/db-provider/dynamodb/query.ts");
const service_sdk_1 = __webpack_require__("./libs/service-sdk/index.ts");
const canDelete = (context, pk, filters) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    const data = yield getMultiple(context, pk, Object.assign(Object.assign({}, filter_1.parseListFilters(pk, pk, filters)), filters));
    if (data.result && data.result.length < 1) {
        throw new service_sdk_1.HttpError("Relations", service_sdk_1.StatusCodes.BAD_REQUEST, `You can not delete this ${pk} because other entities are dependent on the resource`);
    }
});
const itemExists = (context, pk, filters) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const data = yield getMultiple(context, pk, Object.assign(Object.assign({}, filter_1.parseListFilters(pk, pk, filters)), filters));
    let errorMessage = "";
    const keys = Object.keys(filters).map(key => {
        key = key.replace(/\[[^]*\]/g, "");
        if (key.includes("id"))
            return key.replace(/\_.*/, "");
        return key.replace("_", " ");
    }).filter(key => key != "id");
    keys.length > 1 ? keys.forEach((key, idx) => idx == 0 ? errorMessage += `The combination of ${key}` : idx == keys.length - 1 ? errorMessage += ` and ${key} must be unique!` : errorMessage += `, ${key}`) : keys.length == 1 ? errorMessage += `${keys[0].charAt(0).toUpperCase() + keys[0].slice(1)} must be unique!` : null;
    // todo: fix by using totalItems attr
    if (((_a = data.result) === null || _a === void 0 ? void 0 : _a.length) || Object.keys(data.result).length)
        throw new service_sdk_1.HttpError("Constraint", service_sdk_1.StatusCodes.CONFLICT, errorMessage);
});
const create = (context, input, pk, sk, filters, indices) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    setAuditFields.create(context, input);
    const keys = util_1.generateKey(pk, sk);
    if (indices) {
        input = Object.assign(Object.assign({}, input), indices);
    }
    const Item = Object.assign(Object.assign({}, keys), input);
    filters && (yield itemExists(context, keys.pk, filters));
    const res = yield client_1.dynamoDBClient.send(new lib_dynamodb_1.TransactWriteCommand({
        TransactItems: [
            {
                Put: {
                    TableName: shared_1.getTableName(context.tenant.id),
                    Item: Object.assign(Object.assign({}, Item), { id: Item.sk }),
                    ConditionExpression: 'attribute_not_exists(pk)',
                },
            },
            {
                Update: buildSchemaMetaCommandInput(shared_1.getTableName(context.tenant.id), pk, 'inc'),
            },
        ],
    }));
    return getSingle(context, keys.sk, keys.pk);
});
exports.create = create;
const update = (context, input, sk, pk, filters) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    const keys = util_1.generateKey(pk, sk);
    filters ? yield itemExists(context, keys.pk, filters) : null;
    const { updateExpression, expressionAttrValues, expressionAttrNames, } = yield util_1.constructUpdateExpression(input, sk);
    yield client_1.dynamoDBClient.send(new lib_dynamodb_1.UpdateCommand({
        TableName: shared_1.getTableName(context.tenant.id),
        Key: {
            pk,
            sk,
        },
        UpdateExpression: updateExpression,
        ExpressionAttributeValues: expressionAttrValues,
        ExpressionAttributeNames: expressionAttrNames,
    }));
    const queryResponse = yield query_1.Query({
        tableName: shared_1.getTableName(context.tenant.id),
        action: types_1.ActionType.GET_SINGLE,
        keys: ['pk', 'sk'],
        filterInput: filter_1.getSingleFilters(pk, sk),
    });
    return {
        result: queryResponse.result,
    };
});
exports.update = update;
const replace = (context, input, pk, sk) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    setAuditFields.create(context, input);
    const keys = { pk, sk };
    const Item = Object.assign(Object.assign({}, keys), input);
    const res = yield client_1.dynamoDBClient.send(new lib_dynamodb_1.TransactWriteCommand({
        TransactItems: [
            {
                Put: {
                    TableName: shared_1.getTableName(context.tenant.id),
                    Item
                },
            },
            {
                Update: buildSchemaMetaCommandInput(shared_1.getTableName(context.tenant.id), pk, 'inc'),
            },
        ],
    }));
    console.log({ res });
    return {
        result: Item,
    };
});
exports.replace = replace;
const getSingle = (context, id, pk, outputKeys = false) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    const queryResponse = yield query_1.Query({
        tableName: shared_1.getTableName(context.tenant.id),
        action: types_1.ActionType.GET_SINGLE,
        keys: util_1.ALL_PARTITION_SORT_KEYS,
        filterInput: filter_1.getSingleFilters(pk, id),
        outputKeys
    });
    return {
        result: queryResponse.result,
    };
});
exports.getSingle = getSingle;
const getMultiple = (context, pk, filters, outputKeys = false) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    console.log({
        context,
        pk,
        filters,
    });
    const queryResponse = yield query_1.Query({
        tableName: shared_1.getTableName(context.tenant.id),
        action: types_1.ActionType.GET,
        keys: util_1.ALL_PARTITION_SORT_KEYS,
        filterInput: filters,
        outputKeys
    });
    const entityMeta = yield query_1.Query({
        tableName: shared_1.getTableName(context.tenant.id),
        action: types_1.ActionType.GET_SINGLE,
        keys: util_1.ALL_PARTITION_SORT_KEYS,
        filterInput: filter_1.getSingleFilters('meta', pk),
    });
    const totalItems = entityMeta && entityMeta.result && entityMeta.result.totalItemsCount;
    const limit = +filters['limit[eq]'] || +util_1.DEFAULT_TABLE_LIMIT;
    const totalPages = Math.ceil(totalItems / limit);
    return {
        totalItems,
        totalPages,
        limit,
        result: queryResponse.result,
        lastEvaluatedKey: queryResponse.lastEvaluatedKey,
    };
});
exports.getMultiple = getMultiple;
const remove = (context, id, pk, filters) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    const queryResponse = yield getSingle(context, id, pk);
    const entity = queryResponse.result;
    if (!entity) {
        throw new service_sdk_1.HttpError("Resource not found", service_sdk_1.StatusCodes.NOT_FOUND, `${pk.charAt(0).toUpperCase() + pk.slice(1)} not found`);
    }
    filters && (yield canDelete(context, pk, filters));
    entity.deleted_at = Date.now();
    entity.deleted_by = context.authorizedUser;
    entity.pk = pk;
    entity.sk = `deleted::${id}`;
    console.log('entity', entity);
    yield client_1.dynamoDBClient.send(new lib_dynamodb_1.TransactWriteCommand({
        TransactItems: [
            {
                Put: {
                    TableName: shared_1.getTableName(context.tenant.id),
                    Item: entity,
                    ConditionExpression: 'attribute_not_exists(pk)',
                },
            },
            {
                Delete: {
                    TableName: shared_1.getTableName(context.tenant.id),
                    Key: {
                        pk,
                        sk: id,
                    },
                },
            },
            {
                Update: buildSchemaMetaCommandInput(shared_1.getTableName(context.tenant.id), pk, 'dec'),
            },
        ],
    }));
    return {
        result: true,
    };
});
exports.remove = remove;
const transactMultipleItems = (items) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    const parts = Math.ceil(items.length / 25);
    for (let i = 0; i < parts; i++) {
        const start = 25 * i;
        const end = i === 0 ? 25 : 25 * (i + 1);
        yield runTransaction(items.slice(start, end));
    }
    return {
        result: true,
    };
});
exports.transactMultipleItems = transactMultipleItems;
const runTransaction = (items) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    yield client_1.dynamoDBClient.send(new lib_dynamodb_1.TransactWriteCommand({
        TransactItems: items,
    }));
});
function buildSchemaMetaCommandInput(tableName, pk, op) {
    return {
        TableName: tableName,
        Key: { pk: 'meta', sk: pk },
        UpdateExpression: 'set #countField = if_not_exists(totalItemsCount, :start) + :t1',
        ExpressionAttributeValues: {
            ':t1': op === 'inc' ? 1 : -1,
            ':start': 0,
        },
        ExpressionAttributeNames: { '#countField': 'totalItemsCount' },
    };
}


/***/ }),

/***/ "./libs/service-sdk/db-provider/postgres/audit-base-entity.ts":
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


var _a, _b, _c;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AuditBaseEntity = void 0;
const tslib_1 = __webpack_require__("tslib");
const core_1 = __webpack_require__("@mikro-orm/core");
class AuditBaseEntity {
}
tslib_1.__decorate([
    core_1.Property({ defaultRaw: `now()`, onCreate: () => new Date() }),
    tslib_1.__metadata("design:type", typeof (_a = typeof Date !== "undefined" && Date) === "function" ? _a : Object)
], AuditBaseEntity.prototype, "created_at", void 0);
tslib_1.__decorate([
    core_1.Property({ onUpdate: () => new Date(), nullable: true }),
    tslib_1.__metadata("design:type", typeof (_b = typeof Date !== "undefined" && Date) === "function" ? _b : Object)
], AuditBaseEntity.prototype, "updated_at", void 0);
tslib_1.__decorate([
    core_1.Property({ hidden: true, nullable: true }),
    tslib_1.__metadata("design:type", typeof (_c = typeof Date !== "undefined" && Date) === "function" ? _c : Object)
], AuditBaseEntity.prototype, "deleted_at", void 0);
exports.AuditBaseEntity = AuditBaseEntity;


/***/ }),

/***/ "./libs/service-sdk/db-provider/postgres/base-entity.ts":
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.BaseEntity = void 0;
const tslib_1 = __webpack_require__("tslib");
const core_1 = __webpack_require__("@mikro-orm/core");
const audit_base_entity_1 = __webpack_require__("./libs/service-sdk/db-provider/postgres/audit-base-entity.ts");
const exclude_deleted_1 = __webpack_require__("./libs/service-sdk/db-provider/postgres/decorators/exclude-deleted.ts");
let BaseEntity = class BaseEntity extends audit_base_entity_1.AuditBaseEntity {
};
tslib_1.__decorate([
    core_1.PrimaryKey(),
    tslib_1.__metadata("design:type", Number)
], BaseEntity.prototype, "id", void 0);
BaseEntity = tslib_1.__decorate([
    exclude_deleted_1.ExcludeDeleted()
], BaseEntity);
exports.BaseEntity = BaseEntity;


/***/ }),

/***/ "./libs/service-sdk/db-provider/postgres/connection.ts":
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.setConnection = exports.getConnection = void 0;
const tslib_1 = __webpack_require__("tslib");
const core_1 = __webpack_require__("@mikro-orm/core");
const AWS = __webpack_require__("aws-sdk");
const tenantMap = {};
const defaultDBType = 'postgresql';
const secretManager = new AWS.SecretsManager({ region: process.env.REGION });
const getConnection = (tenant, dbname, entities) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    var _a;
    return (_a = tenantMap[tenant]) !== null && _a !== void 0 ? _a : (yield exports.setConnection(tenant, dbname, entities));
});
exports.getConnection = getConnection;
const setConnection = (tenant, dbname, entities) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    tenantMap[tenant] = yield connect(tenant, dbname, entities);
    console.log('SET CONNECTION CALLED');
    return tenantMap[tenant];
});
exports.setConnection = setConnection;
const getTenantConfig = (tenant) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    if (process.env.STAGE === 'local') {
        const tenants = process.env.TENANTS;
        return JSON.parse(tenants);
    }
    const secretval = yield secretManager.getSecretValue({ SecretId: `${process.env.STAGE}/tenants/${tenant}` }).promise();
    const secret = JSON.parse(secretval.SecretString);
    return {
        [tenant]: {
            username: secret.aurora_master_user,
            host: secret.aurora_endpoint,
            password: secret.aurora_master_user_password,
        },
    };
});
const connect = (tenant, dbname, entities) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    const tenantConfig = yield getTenantConfig(tenant);
    console.log(tenantConfig);
    const conn = yield core_1.MikroORM.init({
        pool: { min: 0, max: 10 },
        entities: entities,
        discovery: {
            warnWhenNoEntities: false,
            requireEntitiesArray: true,
            alwaysAnalyseProperties: false, // do not analyse properties when not needed (with ts-morph)
        },
        user: tenantConfig[tenant].username,
        host: tenantConfig[tenant].host,
        password: tenantConfig[tenant].password,
        type: defaultDBType,
        dbName: dbname,
        debug: process.env.STAGE === 'local',
        migrations: {
            tableName: 'mikroorm_migrations',
            path: './src/migrations',
            pattern: /^[\w-]+\d+\.ts$/,
            emit: 'ts',
        },
    });
    return {
        conn,
        repositories: null,
    };
});


/***/ }),

/***/ "./libs/service-sdk/db-provider/postgres/decorators/exclude-deleted.ts":
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ExcludeDeleted = void 0;
const core_1 = __webpack_require__("@mikro-orm/core");
const defaultOptions = { enabled: true, defaultIsDeleted: false, field: 'deleted_at' };
const ExcludeDeleted = (options = {}) => {
    const { enabled, defaultIsDeleted, field } = Object.assign(Object.assign({}, defaultOptions), options);
    return core_1.Filter({
        name: 'excludeDeleted',
        cond: ({ isDeleted = defaultIsDeleted } = {}) => isDeleted ? { [field]: { $ne: null } } : isDeleted === false ? { [field]: null } : {},
        args: false,
        default: enabled,
    });
};
exports.ExcludeDeleted = ExcludeDeleted;


/***/ }),

/***/ "./libs/service-sdk/db-provider/postgres/decorators/index.ts":
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
const tslib_1 = __webpack_require__("tslib");
tslib_1.__exportStar(__webpack_require__("./libs/service-sdk/db-provider/postgres/decorators/exclude-deleted.ts"), exports);
tslib_1.__exportStar(__webpack_require__("./libs/service-sdk/db-provider/postgres/decorators/is-time.ts"), exports);
tslib_1.__exportStar(__webpack_require__("./libs/service-sdk/db-provider/postgres/decorators/is-before-date.ts"), exports);
tslib_1.__exportStar(__webpack_require__("./libs/service-sdk/db-provider/postgres/decorators/is-date-only.ts"), exports);


/***/ }),

/***/ "./libs/service-sdk/db-provider/postgres/decorators/is-before-date.ts":
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.IsBeforeDateConstraint = exports.IsBeforeDate = void 0;
const tslib_1 = __webpack_require__("tslib");
const class_validator_1 = __webpack_require__("class-validator");
function IsBeforeDate(property, validationOptions) {
    return (object, propertyName) => {
        class_validator_1.registerDecorator({
            target: object.constructor,
            propertyName,
            options: validationOptions,
            constraints: [property],
            validator: IsBeforeDateConstraint,
        });
    };
}
exports.IsBeforeDate = IsBeforeDate;
let IsBeforeDateConstraint = class IsBeforeDateConstraint {
    validate(value, args) {
        const [relatedPropertyName] = args.constraints;
        const relatedValue = args.object[relatedPropertyName];
        return value < relatedValue;
    }
    defaultMessage(args) {
        return `${args.property} must be before ${args.constraints[0]}`;
    }
};
IsBeforeDateConstraint = tslib_1.__decorate([
    class_validator_1.ValidatorConstraint({ name: "IsBeforeDateConstraint" })
], IsBeforeDateConstraint);
exports.IsBeforeDateConstraint = IsBeforeDateConstraint;


/***/ }),

/***/ "./libs/service-sdk/db-provider/postgres/decorators/is-date-only.ts":
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.IsDateOnly = void 0;
const tslib_1 = __webpack_require__("tslib");
const class_validator_1 = __webpack_require__("class-validator");
let IsDateOnly = class IsDateOnly {
    validate(value, args) {
        const isDateOnlyRegex = /^\d{4}\-(0[1-9]|1[012])\-(0[1-9]|[12][0-9]|3[01])$/;
        return isDateOnlyRegex.test(value);
    }
};
IsDateOnly = tslib_1.__decorate([
    class_validator_1.ValidatorConstraint({ name: "IsDateOnly", async: false })
], IsDateOnly);
exports.IsDateOnly = IsDateOnly;


/***/ }),

/***/ "./libs/service-sdk/db-provider/postgres/decorators/is-time.ts":
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.IsTime = void 0;
const tslib_1 = __webpack_require__("tslib");
const class_validator_1 = __webpack_require__("class-validator");
let IsTime = class IsTime {
    validate(text, args) {
        const isTimeRegex = /^([0-1]?[0-9]|2[0-4]):([0-5][0-9])(:[0-5][0-9])?$/;
        return isTimeRegex.test(text);
    }
};
IsTime = tslib_1.__decorate([
    class_validator_1.ValidatorConstraint({ name: 'IsTime', async: false })
], IsTime);
exports.IsTime = IsTime;


/***/ }),

/***/ "./libs/service-sdk/db-provider/postgres/entityrepository.ts":
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.CustomEntityRepository = void 0;
const tslib_1 = __webpack_require__("tslib");
const service_sdk_1 = __webpack_require__("./libs/service-sdk/index.ts");
const core_1 = __webpack_require__("@mikro-orm/core");
// TODO fix error messages
class CustomEntityRepository extends core_1.EntityRepository {
    getOneEntityOrFail(where, populate) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const entity = yield this.findOne(where, populate);
            if (!entity) {
                throw new service_sdk_1.NotFoundError(this.entityName.toString());
            }
            return entity;
        });
    }
    failIfEntityExists(where) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const entityExists = yield this.findOne(where);
            if (entityExists) {
                throw new service_sdk_1.ConflictError(`This ${this.entityName.toString().toLowerCase()} already exists`);
            }
        });
    }
    softDelete(id) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (Array.isArray(id)) {
                const entitiesToDelete = yield this.getEntitiesOrFailIfNotFound(id);
                entitiesToDelete.map((item) => (Object.assign(Object.assign({}, item), { deleted_at: new Date() })));
                yield this.flush();
            }
            else {
                const entityToDelete = yield this.getOneEntityOrFail({ id: id });
                entityToDelete.deleted_at = new Date();
                yield this.flush();
            }
            return true;
        });
    }
    getEntitiesOrFailIfNotFound(entityIDs, populate) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const uniqueIDs = [...new Set(entityIDs)];
            const foundEntities = yield this.find({ id: { $in: uniqueIDs } }, populate);
            if (foundEntities.length !== uniqueIDs.length) {
                throw new service_sdk_1.NotFoundError("Entity", `Some of the ${this.entityName.toString().toLowerCase()}s do not exist in the database`);
            }
            return foundEntities;
        });
    }
}
exports.CustomEntityRepository = CustomEntityRepository;


/***/ }),

/***/ "./libs/service-sdk/db-provider/postgres/filter.ts":
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));


/***/ }),

/***/ "./libs/service-sdk/db-provider/postgres/index.ts":
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
const tslib_1 = __webpack_require__("tslib");
tslib_1.__exportStar(__webpack_require__("./libs/service-sdk/db-provider/postgres/connection.ts"), exports);
tslib_1.__exportStar(__webpack_require__("./libs/service-sdk/db-provider/postgres/entityrepository.ts"), exports);
tslib_1.__exportStar(__webpack_require__("./libs/service-sdk/db-provider/postgres/types/index.ts"), exports);
tslib_1.__exportStar(__webpack_require__("./libs/service-sdk/db-provider/postgres/util.ts"), exports);
tslib_1.__exportStar(__webpack_require__("./libs/service-sdk/db-provider/postgres/filter.ts"), exports);
tslib_1.__exportStar(__webpack_require__("./libs/service-sdk/db-provider/postgres/audit-base-entity.ts"), exports);
tslib_1.__exportStar(__webpack_require__("./libs/service-sdk/db-provider/postgres/base-entity.ts"), exports);
tslib_1.__exportStar(__webpack_require__("./libs/service-sdk/db-provider/postgres/decorators/index.ts"), exports);


/***/ }),

/***/ "./libs/service-sdk/db-provider/postgres/types/index.ts":
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
const tslib_1 = __webpack_require__("tslib");
tslib_1.__exportStar(__webpack_require__("./libs/service-sdk/db-provider/postgres/types/numeric.ts"), exports);
tslib_1.__exportStar(__webpack_require__("./libs/service-sdk/db-provider/postgres/types/native-big-int.ts"), exports);
tslib_1.__exportStar(__webpack_require__("./libs/service-sdk/db-provider/postgres/types/integer-array.ts"), exports);


/***/ }),

/***/ "./libs/service-sdk/db-provider/postgres/types/integer-array.ts":
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.IntegerArray = void 0;
const core_1 = __webpack_require__("@mikro-orm/core");
class IntegerArray extends core_1.ArrayType {
    convertToDatabaseValue(value) {
        if (!value || value.length === 0) {
            return '{}';
        }
        else {
            return '{' + value.join(', ') + '}';
        }
    }
    convertToJSValue(value) {
        return value;
    }
    getColumnType() {
        return 'json[]';
    }
}
exports.IntegerArray = IntegerArray;


/***/ }),

/***/ "./libs/service-sdk/db-provider/postgres/types/native-big-int.ts":
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.NativeBigIntType = void 0;
const core_1 = __webpack_require__("@mikro-orm/core");
class NativeBigIntType extends core_1.BigIntType {
    convertToJSValue(value) {
        if (!value) {
            return value;
        }
        else {
            return +value;
        }
    }
}
exports.NativeBigIntType = NativeBigIntType;


/***/ }),

/***/ "./libs/service-sdk/db-provider/postgres/types/numeric.ts":
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.NumericType = void 0;
const _1 = __webpack_require__("./libs/service-sdk/db-provider/postgres/types/index.ts");
Object.defineProperty(exports, "NumericType", ({ enumerable: true, get: function () { return _1.NativeBigIntType; } }));


/***/ }),

/***/ "./libs/service-sdk/db-provider/postgres/util.ts":
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.PG = void 0;
const tslib_1 = __webpack_require__("tslib");
const errors_1 = __webpack_require__("./libs/service-sdk/errors/index.ts");
const pg_1 = __webpack_require__("pg");
var PG;
(function (PG) {
    PG.pool = new pg_1.Pool({
        user: 'admin',
        host: '0.0.0.0',
        database: 'mikroorm_menu',
        password: 'admin',
        port: 5432,
    });
    PG.queryexec = (input) => tslib_1.__awaiter(this, void 0, void 0, function* () {
        const start = Date.now();
        const res = yield PG.pool.query(input);
        const duration = Date.now() - start;
        console.log('executed query', { input, duration, rows: res.rowCount });
        return res;
    });
    PG.getMultiple = (input) => tslib_1.__awaiter(this, void 0, void 0, function* () {
        const res = yield PG.queryexec(input);
        return res.command == 'SELECT' && res.rows && res.rows.length ? res.rows : [];
    });
    PG.getSingle = (input) => tslib_1.__awaiter(this, void 0, void 0, function* () {
        const res = yield PG.queryexec(input);
        return res.command == 'SELECT' && res.rows && res.rows.length ? res.rows[0] : {};
    });
    PG.insertquery = (table, input, onConstraintQuery = '') => {
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
                paramvalues.push(`(${keys.concat('now()').toString()})`);
            });
        }
        else {
            Object.keys(input).forEach((key, idx) => {
                params.push(key);
                values.push(`$${idx + 1}`);
            });
            paramvalues.push(`(${values.concat('now()').toString()})`).toString();
        }
        let inputvals = [];
        if (bulk) {
            const collectedValues = input.map(ob => Object.values(ob).map((e) => (!e ? null : e)));
            inputvals = [].concat.apply([], collectedValues); //.toString().split(',')
            console.log('bulk-input: ', input);
            console.log('bulk-inputvals: ', inputvals);
        }
        else {
            inputvals = Object.values(input);
            console.log('input: ', input);
            console.log('inputvals: ', inputvals);
        }
        const txt = `insert into ${table} (${params.concat(['created_at']).toString()}) values ${paramvalues} ${onConstraintQuery} returning *`;
        return {
            text: txt,
            values: inputvals
        };
    };
    PG.insert = (table, input, onConstraintQuery = '') => tslib_1.__awaiter(this, void 0, void 0, function* () {
        const queryinput = PG.insertquery(table, input, onConstraintQuery);
        const output = yield PG.queryexec(queryinput);
        if (output && output.rows && output.rows.length) {
            return output.rows[0];
        }
        throw errors_1.generalError('0', 'INSERT failure');
    });
    PG.updatequery = (table, id, input) => {
        const params = ['updated_at = $1'];
        Object.keys(input).forEach((key, idx) => {
            params.push(`${key} = $${idx + 2}`);
        });
        return {
            text: `update ${table} set ${params.toString()} where id = $${Object.keys(input).length + 2} returning *`,
            values: ['now()'].concat(Object.values(input)).concat([id.toString()])
        };
    };
    PG.update = (table, id, input) => tslib_1.__awaiter(this, void 0, void 0, function* () {
        const queryinput = PG.updatequery(table, id, input);
        const output = yield PG.queryexec(queryinput);
        if (output && output.rows && output.rows.length) {
            return output.rows[0];
        }
        throw errors_1.generalError('0', 'UPDATE failure');
    });
    PG.softdeletequery = (table, id) => {
        const params = ['deleted_at = $1'];
        return {
            text: `update ${table} set ${params.toString()} where id in (${Array.isArray(id) ? id.toString() : id}) returning *`,
            values: ['now()']
        };
    };
    PG.deletequery = (table, id) => {
        return {
            text: `delete from ${table} where id in (${Array.isArray(id) ? id.toString() : id})`,
        };
    };
    PG.softdel = (table, id) => tslib_1.__awaiter(this, void 0, void 0, function* () {
        const queryinput = PG.softdeletequery(table, id);
        const output = yield PG.queryexec(queryinput);
        if (output && output.rows && output.rows.length) {
            return output.rows[0];
        }
        throw errors_1.generalError('0', 'DELETE failure');
    });
    PG.del = (table, id) => tslib_1.__awaiter(this, void 0, void 0, function* () {
        const queryinput = PG.deletequery(table, id);
        const output = yield PG.queryexec(queryinput);
        if (output && output.rowCount) {
            return id;
        }
        throw errors_1.generalError('0', 'DELETE failure');
    });
    PG.TABLE = {
        MODIFIER: process.env.MODIFIER_TABLE || 'modifier',
        MODIFIER_OPTION: process.env.MODIFIER_OPTION_TABLE || 'modifier_option',
        CATEGORY: process.env.CATEGORY_TABLE || 'category',
        PRODUCT: process.env.PRODUCT_TABLE || 'product',
        PRODUCT_CATEGORY: process.env.PRODUCT_CATEGORY_TABLE || 'product_category',
        PRODUCT_MODIFIER: process.env.PRODUCT_MODIFIER_TABLE || 'product_modifier',
        MENU: process.env.MENU_TABLE || 'menu',
        PRODUCT_MENU: process.env.PRODUCT_MENU_TABLE || 'product_menu',
        OUT_OF_STOCK: process.env.OUT_OF_STOCK_TABLE || 'out_of_stock',
        MENU_HOTEL: process.env.MENU_HOTEL_TABLE || 'menu_hotel',
    };
    PG.getPaginationString = (page, limit = 20) => {
        const offset = page > 0 ? (page - 1) * limit + 1 : 0;
        return `offset ${offset} limit ${limit}`;
    };
    PG.getOrderByClause = (attr, sort = 'asc') => {
        return `order by ${attr} ${sort}`;
    };
    PG.addTotalCountQueryString = () => {
        return `count(*) OVER() AS total_count`;
    };
    PG.getClient = () => tslib_1.__awaiter(this, void 0, void 0, function* () {
        const client = yield PG.pool.connect();
        const query = client.query;
        const release = client.release;
        // set a timeout of 5 seconds, after which we will log this client's last query
        const timeout = setTimeout(() => {
            console.error('A client has been checked out for more than 5 seconds!');
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


/***/ }),

/***/ "./libs/service-sdk/errors/error.ts":
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.generalError = void 0;
const generalError = (code, message) => {
    return {
        error: true,
        code,
        message,
    };
};
exports.generalError = generalError;


/***/ }),

/***/ "./libs/service-sdk/errors/index.ts":
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
const tslib_1 = __webpack_require__("tslib");
tslib_1.__exportStar(__webpack_require__("./libs/service-sdk/errors/error.ts"), exports);


/***/ }),

/***/ "./libs/service-sdk/event-provider/index.ts":
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.EvClient = exports.eventProvider = void 0;
const redis_1 = __webpack_require__("./libs/service-sdk/event-provider/redis.ts");
const sns_1 = __webpack_require__("./libs/service-sdk/event-provider/sns.ts");
const client_sns_1 = __webpack_require__("@aws-sdk/client-sns");
class EvClient {
    constructor() {
        this.stage = process.env.STAGE;
        if (this.stage === "local") {
            this.client = redis_1.RedisClient();
        }
        else {
            this.client = sns_1.SnsClient();
        }
    }
    publish(topicARN, eventName, context, data, meta) {
        const payload = { context, data, meta };
        if (this.stage === "local") {
            this.client.publish(topicARN, JSON.stringify({
                Records: [
                    {
                        body: JSON.stringify(payload),
                        MessageAttributes: {
                            eventName,
                        },
                    },
                ],
            }));
        }
        else {
            return this.client.send(new client_sns_1.PublishCommand({
                TopicArn: topicARN,
                MessageGroupId: eventName.split("_")[0],
                MessageDeduplicationId: Date.now().toString(),
                Message: JSON.stringify(payload),
                MessageAttributes: {
                    eventName: {
                        DataType: "String",
                        StringValue: eventName,
                    },
                },
            }));
        }
    }
    subscribe(eventName) {
        if (this.stage === "local") {
            return this.client.subscribe(eventName);
        }
    }
    on(event, cb) {
        if (this.stage === "local") {
            return this.client.on(event, cb);
        }
    }
}
exports.EvClient = EvClient;
const eventProvider = (function () {
    let eventClient;
    return {
        client() {
            if (!eventClient) {
                eventClient = new EvClient();
            }
            return eventClient;
        },
    };
})();
exports.eventProvider = eventProvider;


/***/ }),

/***/ "./libs/service-sdk/event-provider/redis.ts":
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.RedisClient = void 0;
const redis_1 = __webpack_require__("redis");
const RedisClient = () => {
    /**
     * todo: choose client based on env
     */
    return redis_1.createClient();
};
exports.RedisClient = RedisClient;


/***/ }),

/***/ "./libs/service-sdk/event-provider/sns.ts":
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.SnsClient = void 0;
const client_sns_1 = __webpack_require__("@aws-sdk/client-sns");
const SnsClient = () => {
    return new client_sns_1.SNSClient({ region: process.env.REGION });
};
exports.SnsClient = SnsClient;


/***/ }),

/***/ "./libs/service-sdk/express/index.ts":
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
const tslib_1 = __webpack_require__("tslib");
tslib_1.__exportStar(__webpack_require__("./libs/service-sdk/express/validator.ts"), exports);
tslib_1.__exportStar(__webpack_require__("./libs/service-sdk/express/response.ts"), exports);
tslib_1.__exportStar(__webpack_require__("./libs/service-sdk/express/parse.ts"), exports);


/***/ }),

/***/ "./libs/service-sdk/express/parse.ts":
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.parsePaginationParam = void 0;
const parsePaginationParam = (reqQuery) => {
    return {
        page: (reqQuery === null || reqQuery === void 0 ? void 0 : reqQuery.page) ? reqQuery.page : 1,
        limit: (reqQuery === null || reqQuery === void 0 ? void 0 : reqQuery.limit) ? reqQuery.limit : 10,
    };
};
exports.parsePaginationParam = parsePaginationParam;


/***/ }),

/***/ "./libs/service-sdk/express/response.ts":
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.httpResponse = void 0;
const httpResponse = (data) => {
    return data;
};
exports.httpResponse = httpResponse;


/***/ }),

/***/ "./libs/service-sdk/express/validator.ts":
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.validateRequest = void 0;
const service_sdk_1 = __webpack_require__("./libs/service-sdk/index.ts");
const class_transformer_1 = __webpack_require__("class-transformer");
const class_validator_1 = __webpack_require__("class-validator");
const validateRequest = (dtoClass) => {
    return function (req, res, next) {
        const output = class_transformer_1.plainToInstance(dtoClass, req.body);
        class_validator_1.validate(output).then((validationErrors) => {
            if (validationErrors.length > 0) {
                const errors = [];
                for (let errorItem of validationErrors) {
                    while (errorItem.children.length) {
                        errorItem = errorItem.children[0];
                    }
                    errors.push(Object.values(errorItem.constraints)[0]);
                }
                next(new service_sdk_1.ValidationError(errors));
            }
            else {
                next();
            }
        });
    };
};
exports.validateRequest = validateRequest;


/***/ }),

/***/ "./libs/service-sdk/identity-provider/cognito/cognito.ts":
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.getCognitoConfig = exports.createInstance = void 0;
/**
 * Cognito Implementation
 */
const AWS = __webpack_require__("aws-sdk");
const types_1 = __webpack_require__("./libs/service-sdk/identity-provider/cognito/types.ts");
function createInstance(poolId) {
    const config = getCognitoConfig();
    const awsClient = new AWS.CognitoIdentityServiceProvider(config);
    return new Cognito(awsClient, poolId);
}
exports.createInstance = createInstance;
function getCognitoConfig() {
    return {
        apiVersion: '2016-04-18',
        region: process.env.REGION,
        accessKeyId: process.env.ACCESS_KEY_ID,
        secretAccessKey: process.env.SECRET_ACCESS_KEY,
    };
}
exports.getCognitoConfig = getCognitoConfig;
/**
 * Cognito Integration
 */
class Cognito {
    /**
     * Creates new cognito instance
     * @param {any} awsClient
     * @param {String} userPoolID
     */
    constructor(awsClient, userPoolID) {
        this.getServiceName = () => {
            return 'cognito-identity-service-provider';
        };
        // #region Group
        /**
         * Create new group inside specified user pool
         * @param {CreateUpdateGroupQuery} group
         * @return {Promise}
         */
        this.createGroup = (group) => {
            const params = Object.assign(Object.assign({}, group), { UserPoolId: this.UserPoolID });
            return this.awsClient.createGroup(params).promise();
        };
        /**
         * Update group inside specified user pool
         * @param {CreateUpdateGroupQuery} userGroup
         * @return {Promise}
         */
        this.updateGroup = (userGroup) => {
            const params = Object.assign(Object.assign({}, userGroup), { UserPoolId: this.UserPoolID });
            return this.awsClient.updateGroup(params).promise();
        };
        /**
         * Delete group inside specified user pool
         * @param {DeleteGroupQuery} deleteUserGroup
         * @return {Promise}
         */
        this.deleteGroup = (deleteUserGroup) => {
            const params = Object.assign(Object.assign({}, deleteUserGroup), { UserPoolId: this.UserPoolID });
            return this.awsClient.deleteGroup(params).promise();
        };
        /**
         * Get group inside specified user pool
         * @param {GetGroupQuery} getGroupQuery
         * @return {Promise}
         */
        this.getGroup = (getGroupQuery) => {
            const params = Object.assign(Object.assign({}, getGroupQuery), { UserPoolId: this.UserPoolID });
            return this.awsClient.getGroup(params).promise();
        };
        /**
         * List groups inside specified user pool
         * @param {ListGroupsQuery} listGroups
         * @return {Promise}
         */
        this.listGroups = (listGroups) => {
            const params = Object.assign(Object.assign({}, listGroups), { UserPoolId: this.UserPoolID });
            return this.awsClient.listGroups(params).promise();
        };
        // #endregion
        // #region Users
        /**
         * Create user inside specified user pool
         * @param {CreateUserQuery} user
         * @return {Promise}
         */
        this.adminCreateUser = (user) => {
            const params = Object.assign(Object.assign({}, user), { UserPoolId: this.UserPoolID, DesiredDeliveryMediums: [types_1.ENUM_DELIVERY_MEDIUMS[0].toString()], ForceAliasCreation: false, MessageAction: 'SUPPRESS' });
            return this.awsClient.adminCreateUser(params).promise();
        };
        /**
         * Enable user inside specified user pool
         * @param {EnableDisableUser} user
         * @return {Promise}
         */
        this.adminEnableUser = (user) => {
            const params = Object.assign(Object.assign({}, user), { UserPoolId: this.UserPoolID });
            return this.awsClient.adminEnableUser(params).promise();
        };
        /**
         * Disable user inside specified user pool
         * @param {EnableDisableUser} user
         * @return {Promise}
         */
        this.adminDisableUser = (user) => {
            const params = Object.assign(Object.assign({}, user), { UserPoolId: this.UserPoolID });
            return this.awsClient.adminDisableUser(params).promise();
        };
        /**
         * Get user
         * @param {AdminGetUserQuery} user
         * @return {Promise}
         */
        this.adminGetUser = (user) => {
            const params = Object.assign(Object.assign({}, user), { UserPoolId: this.UserPoolID });
            return this.awsClient.adminGetUser(params).promise();
        };
        /**
         * Reset user password
         * @param {ResetUserPasswordQuery} resetUserPassword
         * @return {Promise}
         */
        this.adminResetUserPassword = (resetUserPassword) => {
            const params = Object.assign(Object.assign({}, resetUserPassword), { UserPoolId: this.UserPoolID });
            return this.awsClient.adminResetUserPassword(params).promise();
        };
        /**
         * Reset user password
         * @param {SetUserPasswordQuery} setSetUserPassword
         * @return {Promise}
         */
        this.adminSetUserPassword = (setSetUserPassword) => {
            const params = Object.assign(Object.assign({}, setSetUserPassword), { UserPoolId: this.UserPoolID });
            return this.awsClient.adminSetUserPassword(params).promise();
        };
        /**
         * Confirm user signUp
         * @param {ConfirmUserSignUp} confirmUserSignUp
         * @return {Promise}
         */
        this.adminConfirmUserSignUp = (confirmUserSignUp) => {
            const params = Object.assign(Object.assign({}, confirmUserSignUp), { UserPoolId: this.UserPoolID });
            return this.awsClient.adminConfirmSignUp(params).promise();
        };
        /**
         * User Global SignOut
         * @param {UserSignOutQuery} user
         * @return {Promise}
         */
        this.adminUserGlobalSignOut = (user) => {
            const params = Object.assign(Object.assign({}, user), { UserPoolId: this.UserPoolID });
            return this.awsClient.adminUserGlobalSignOut(params).promise();
        };
        /**
         * List users
         * @param {ListUsersQuery} listUsers
         * @return {Promise}
         */
        this.listUsers = (listUsers) => {
            const params = Object.assign(Object.assign({}, listUsers), { UserPoolId: this.UserPoolID });
            return this.awsClient.listUsers(params).promise();
        };
        /**
         * List users
         * @param {ListUsersInGroupQuery} listUserGroup
         * @return {Promise}
         */
        this.listUsersInGroup = (listUserGroup) => {
            const params = Object.assign(Object.assign({}, listUserGroup), { UserPoolId: this.UserPoolID });
            console.log('paramss:: ', params);
            return this.awsClient.listUsersInGroup(params).promise();
        };
        // #region User-Groups
        /**
         * Add user to group
         * @param {AddRemoveUserToGroupQuery} addUserToGroup
         * @return {Promise}
         */
        this.adminAddUserToGroup = (addUserToGroup) => {
            const params = Object.assign(Object.assign({}, addUserToGroup), { UserPoolId: this.UserPoolID });
            return this.awsClient.adminAddUserToGroup(params).promise();
        };
        /**
         * Admin delete-resource user from group
         * @param {AddRemoveUserToGroupQuery} removeUserFromGroup
         * @return {Promise}
         */
        this.adminRemoveUserFromGroup = (removeUserFromGroup) => {
            const params = Object.assign(Object.assign({}, removeUserFromGroup), { UserPoolId: this.UserPoolID });
            return this.awsClient.adminRemoveUserFromGroup(params).promise();
        };
        /**
         * List user groups
         * @param {ListGroupsForUserQuery} listGroupsForUser
         * @return {Promise}
         */
        this.adminListGroupsForUser = (listGroupsForUser) => {
            const params = Object.assign(Object.assign({}, listGroupsForUser), { UserPoolId: this.UserPoolID });
            return this.awsClient.adminListGroupsForUser(params).promise();
        };
        // #endregion
        /**
         * Update user attributes
         * @param {UpdateUserAttributesQuery} userAndAttributes
         * @return {Promise}
         */
        this.adminUpdateUserAttributes = (userAndAttributes) => {
            const params = Object.assign(Object.assign({}, userAndAttributes), { UserPoolId: this.UserPoolID });
            return this.awsClient.adminUpdateUserAttributes(params).promise();
        };
        this.adminConfirmForgotPassword = (params) => {
            return this.awsClient.confirmForgotPassword(params).promise();
        };
        this.forgotPassword = (params) => {
            return this.awsClient.forgotPassword(params).promise();
        };
        this.awsClient = awsClient;
        this.UserPoolID = userPoolID;
    }
}


/***/ }),

/***/ "./libs/service-sdk/identity-provider/cognito/index.ts":
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.CognitoManager = void 0;
const cognito_1 = __webpack_require__("./libs/service-sdk/identity-provider/cognito/cognito.ts");
const add_user_1 = __webpack_require__("./libs/service-sdk/identity-provider/cognito/use-case/group/add-user.ts");
const create_1 = __webpack_require__("./libs/service-sdk/identity-provider/cognito/use-case/group/create.ts");
const delete_1 = __webpack_require__("./libs/service-sdk/identity-provider/cognito/use-case/group/delete.ts");
const list_users_1 = __webpack_require__("./libs/service-sdk/identity-provider/cognito/use-case/group/list-users.ts");
const update_1 = __webpack_require__("./libs/service-sdk/identity-provider/cognito/use-case/group/update.ts");
const confirm_user_1 = __webpack_require__("./libs/service-sdk/identity-provider/cognito/use-case/user/confirm-user.ts");
const create_2 = __webpack_require__("./libs/service-sdk/identity-provider/cognito/use-case/user/create.ts");
const delete_2 = __webpack_require__("./libs/service-sdk/identity-provider/cognito/use-case/user/delete.ts");
const forgot_password_1 = __webpack_require__("./libs/service-sdk/identity-provider/cognito/use-case/user/forgot-password.ts");
const get_1 = __webpack_require__("./libs/service-sdk/identity-provider/cognito/use-case/user/get.ts");
const reset_password_1 = __webpack_require__("./libs/service-sdk/identity-provider/cognito/use-case/user/reset-password.ts");
const CognitoManager = (poolId, logger) => {
    const cognito = cognito_1.createInstance(poolId);
    const createRole = create_1.CreateGroup(cognito, logger).action;
    const updateRole = update_1.UpdateGroup(cognito, logger).action;
    const deleteRole = delete_1.DeleteGroup(cognito, logger).action;
    const listUsersInGroup = list_users_1.ListGroupUsers(cognito, logger).action;
    const addUserToRoles = add_user_1.AddUser(cognito, logger).action;
    const createUser = create_2.CreateUser(cognito, logger).action;
    const getUser = get_1.GetUser(cognito, logger).action;
    const deleteUser = delete_2.DeleteUser(cognito, logger).action;
    const confirmUser = confirm_user_1.ConfirmUser(cognito, logger).action;
    const resetUserPassword = reset_password_1.ResetUserPassword(cognito, logger).action;
    const forgotPassword = forgot_password_1.ForgotPassword(cognito, logger).action;
    return {
        createRole,
        updateRole,
        deleteRole,
        addUserToRoles,
        createUser,
        listUsersInGroup,
        getUser,
        deleteUser,
        confirmUser,
        resetUserPassword,
        forgotPassword
    };
};
exports.CognitoManager = CognitoManager;


/***/ }),

/***/ "./libs/service-sdk/identity-provider/cognito/types.ts":
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ENUM_MESSAGE_ACTIONS = exports.ENUM_DELIVERY_MEDIUMS = void 0;
var ENUM_DELIVERY_MEDIUMS;
(function (ENUM_DELIVERY_MEDIUMS) {
    ENUM_DELIVERY_MEDIUMS[ENUM_DELIVERY_MEDIUMS["SMS"] = 0] = "SMS";
    ENUM_DELIVERY_MEDIUMS[ENUM_DELIVERY_MEDIUMS["EMAIL"] = 1] = "EMAIL";
})(ENUM_DELIVERY_MEDIUMS = exports.ENUM_DELIVERY_MEDIUMS || (exports.ENUM_DELIVERY_MEDIUMS = {}));
var ENUM_MESSAGE_ACTIONS;
(function (ENUM_MESSAGE_ACTIONS) {
    ENUM_MESSAGE_ACTIONS[ENUM_MESSAGE_ACTIONS["RESEND"] = 0] = "RESEND";
    ENUM_MESSAGE_ACTIONS[ENUM_MESSAGE_ACTIONS["SUPPRESS"] = 1] = "SUPPRESS";
})(ENUM_MESSAGE_ACTIONS = exports.ENUM_MESSAGE_ACTIONS || (exports.ENUM_MESSAGE_ACTIONS = {}));


/***/ }),

/***/ "./libs/service-sdk/identity-provider/cognito/use-case/group/add-user.ts":
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AddUser = void 0;
const tslib_1 = __webpack_require__("tslib");
const shared_1 = __webpack_require__("./libs/shared/index.ts");
const AddUser = (cognito, logger) => {
    const action = (data) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
        const { currentRoles, user, newRoles } = data;
        try {
            for (let i = 0; i < currentRoles.length; i += 1) {
                const role = currentRoles[i];
                yield cognito.adminRemoveUserFromGroup({
                    Username: user.email,
                    GroupName: role.name.split('::')[1],
                });
            }
            for (let i = 0; i < newRoles.length; i += 1) {
                yield cognito.adminAddUserToGroup({
                    Username: user.email,
                    GroupName: newRoles[i].name.split('::')[1],
                });
            }
        }
        catch (err) {
            logger.error(JSON.stringify(err));
            throw shared_1.GENERAL_ACTION_ERROR('add-user', 'cognito-group');
        }
    });
    return {
        action,
    };
};
exports.AddUser = AddUser;


/***/ }),

/***/ "./libs/service-sdk/identity-provider/cognito/use-case/group/create.ts":
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.CreateGroup = void 0;
const tslib_1 = __webpack_require__("tslib");
const shared_1 = __webpack_require__("./libs/shared/index.ts");
const CreateGroup = (cognito, logger) => {
    const action = (data) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
        try {
            const cgRes = yield cognito.createGroup({
                GroupName: data.role.name,
                Description: data.role.description
            });
            logger.info(JSON.stringify(cgRes));
        }
        catch (err) {
            logger.error(err);
            throw shared_1.GENERAL_ACTION_ERROR('create', 'cognito-group');
        }
    });
    return {
        action,
    };
};
exports.CreateGroup = CreateGroup;


/***/ }),

/***/ "./libs/service-sdk/identity-provider/cognito/use-case/group/delete.ts":
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.DeleteGroup = void 0;
const tslib_1 = __webpack_require__("tslib");
const shared_1 = __webpack_require__("./libs/shared/index.ts");
const DeleteGroup = (cognito, logger) => {
    const action = (data) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
        try {
            return yield cognito.deleteGroup({
                GroupName: data.role.name,
            });
        }
        catch (err) {
            logger.error(JSON.stringify(err));
            throw shared_1.GENERAL_ACTION_ERROR('delete', 'cognito-group');
        }
    });
    return {
        action,
    };
};
exports.DeleteGroup = DeleteGroup;


/***/ }),

/***/ "./libs/service-sdk/identity-provider/cognito/use-case/group/list-users.ts":
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ListGroupUsers = void 0;
const tslib_1 = __webpack_require__("tslib");
const shared_1 = __webpack_require__("./libs/shared/index.ts");
const ListGroupUsers = (cognito, logger) => {
    const action = (data) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
        try {
            const cgRes = yield cognito.listUsersInGroup({
                GroupName: data.role.name,
            });
            logger.info(JSON.stringify(cgRes));
            return cgRes.Users || [];
        }
        catch (err) {
            logger.error(err);
            throw shared_1.GENERAL_ACTION_ERROR('list-users', 'cognito-group');
        }
    });
    return {
        action,
    };
};
exports.ListGroupUsers = ListGroupUsers;


/***/ }),

/***/ "./libs/service-sdk/identity-provider/cognito/use-case/group/update.ts":
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.UpdateGroup = void 0;
const tslib_1 = __webpack_require__("tslib");
const shared_1 = __webpack_require__("./libs/shared/index.ts");
const UpdateGroup = (cognito, logger) => {
    const action = (data) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
        try {
            const cgRes = yield cognito.updateGroup({
                GroupName: data.role.name,
                Description: data.role.description
            });
            logger.info(JSON.stringify(cgRes));
        }
        catch (err) {
            logger.error(err);
            throw shared_1.GENERAL_ACTION_ERROR('update', 'cognito-group');
        }
    });
    return {
        action,
    };
};
exports.UpdateGroup = UpdateGroup;


/***/ }),

/***/ "./libs/service-sdk/identity-provider/cognito/use-case/user/confirm-user.ts":
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ConfirmUser = void 0;
const tslib_1 = __webpack_require__("tslib");
const shared_1 = __webpack_require__("./libs/shared/index.ts");
const ConfirmUser = (cognito, logger) => {
    const action = (email) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
        try {
            yield cognito.adminSetUserPassword({
                Username: email,
                Password: 'Temporary1!',
                Permanent: true
            });
            return yield cognito.adminUpdateUserAttributes({
                Username: email,
                UserAttributes: [
                    {
                        Name: 'email_verified',
                        Value: 'true'
                    }
                ]
            });
        }
        catch (err) {
            logger.error(JSON.stringify(err));
            throw shared_1.GENERAL_ACTION_ERROR('confirm-user', 'cognito-user');
        }
    });
    return {
        action,
    };
};
exports.ConfirmUser = ConfirmUser;


/***/ }),

/***/ "./libs/service-sdk/identity-provider/cognito/use-case/user/create.ts":
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.CreateUser = void 0;
const tslib_1 = __webpack_require__("tslib");
const shared_1 = __webpack_require__("./libs/shared/index.ts");
const CreateUser = (cognito, logger) => {
    const action = (data) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
        var _a;
        try {
            //todo: this has to be transactional with saga since it can fail adding a user to a group
            return yield cognito.adminCreateUser({
                Username: data.user.email,
                ClientMetadata: {
                    displayName: (_a = data.metadata) === null || _a === void 0 ? void 0 : _a.display_name,
                },
                UserAttributes: [
                    { Name: 'email', Value: data.user.email },
                    { Name: 'email_verified', Value: 'true' },
                ],
            });
        }
        catch (err) {
            logger.error(JSON.stringify(err));
            throw shared_1.GENERAL_ACTION_ERROR('create', 'cognito-user');
        }
    });
    return {
        action,
    };
};
exports.CreateUser = CreateUser;


/***/ }),

/***/ "./libs/service-sdk/identity-provider/cognito/use-case/user/delete.ts":
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.DeleteUser = void 0;
const tslib_1 = __webpack_require__("tslib");
const shared_1 = __webpack_require__("./libs/shared/index.ts");
const DeleteUser = (cognito, logger) => {
    const action = (username) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
        try {
            //todo: this has to be transactional with saga since it can fail adding a user to a group
            return yield cognito.adminDisableUser({
                Username: username,
            });
        }
        catch (err) {
            logger.error(JSON.stringify(err));
            throw shared_1.GENERAL_ACTION_ERROR('delete', 'cognito-user');
        }
    });
    return {
        action,
    };
};
exports.DeleteUser = DeleteUser;


/***/ }),

/***/ "./libs/service-sdk/identity-provider/cognito/use-case/user/forgot-password.ts":
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ForgotPassword = void 0;
const tslib_1 = __webpack_require__("tslib");
const shared_1 = __webpack_require__("./libs/shared/index.ts");
const ForgotPassword = (cognito, logger) => {
    const action = (data) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
        try {
            console.log('forgort-pwd-data: ', data);
            return yield cognito.forgotPassword({
                ClientId: data.clientID,
                Username: data.username
            });
        }
        catch (err) {
            logger.error(JSON.stringify(err));
            throw shared_1.GENERAL_ACTION_ERROR('ResetUserPassword', 'cognito-user');
        }
    });
    return {
        action,
    };
};
exports.ForgotPassword = ForgotPassword;


/***/ }),

/***/ "./libs/service-sdk/identity-provider/cognito/use-case/user/get.ts":
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.GetUser = void 0;
const tslib_1 = __webpack_require__("tslib");
const shared_1 = __webpack_require__("./libs/shared/index.ts");
const GetUser = (cognito, logger) => {
    const action = (username) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
        try {
            //todo: this has to be transactional with saga since it can fail adding a user to a group
            const adminUser = yield cognito.adminGetUser({
                Username: username,
            });
            return adminUser.Username || null;
        }
        catch (err) {
            logger.error(JSON.stringify(err));
            throw shared_1.GENERAL_ACTION_ERROR('create', 'cognito-user');
        }
    });
    return {
        action,
    };
};
exports.GetUser = GetUser;


/***/ }),

/***/ "./libs/service-sdk/identity-provider/cognito/use-case/user/reset-password.ts":
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ResetUserPassword = void 0;
const tslib_1 = __webpack_require__("tslib");
const shared_1 = __webpack_require__("./libs/shared/index.ts");
const ResetUserPassword = (cognito, logger) => {
    const action = (data) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
        try {
            console.log('data-reset-user-psdwd: ', data);
            return yield cognito.adminConfirmForgotPassword({
                ClientId: data.clientID,
                ConfirmationCode: data.confirmationCode,
                Password: data.password,
                Username: data.username
            });
        }
        catch (err) {
            logger.error(JSON.stringify(err));
            throw shared_1.GENERAL_ACTION_ERROR('ResetUserPassword', 'cognito-user');
        }
    });
    return {
        action,
    };
};
exports.ResetUserPassword = ResetUserPassword;


/***/ }),

/***/ "./libs/service-sdk/identity-provider/index.ts":
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.IdentityProvider = exports.IdentityProviderType = exports.IdentityProviderFactory = void 0;
const shared_1 = __webpack_require__("./libs/shared/index.ts");
const types_1 = __webpack_require__("./libs/service-sdk/identity-provider/types.ts");
Object.defineProperty(exports, "IdentityProvider", ({ enumerable: true, get: function () { return types_1.IdentityProvider; } }));
Object.defineProperty(exports, "IdentityProviderType", ({ enumerable: true, get: function () { return types_1.IdentityProviderType; } }));
const cognito_1 = __webpack_require__("./libs/service-sdk/identity-provider/cognito/index.ts");
const IdentityProviderFactory = (factory) => {
    switch (factory.type) {
        case types_1.IdentityProviderType.Cognito:
            if (!factory.poolId) {
                factory.logger.error('poolId required');
                throw shared_1.GENERAL_ACTION_ERROR('initialize', 'cognito manager');
            }
            return cognito_1.CognitoManager(factory.poolId, factory.logger);
    }
};
exports.IdentityProviderFactory = IdentityProviderFactory;


/***/ }),

/***/ "./libs/service-sdk/identity-provider/types.ts":
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.IdentityProviderType = void 0;
var IdentityProviderType;
(function (IdentityProviderType) {
    IdentityProviderType[IdentityProviderType["Cognito"] = 0] = "Cognito";
})(IdentityProviderType || (IdentityProviderType = {}));
exports.IdentityProviderType = IdentityProviderType;


/***/ }),

/***/ "./libs/service-sdk/index.ts":
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
const tslib_1 = __webpack_require__("tslib");
tslib_1.__exportStar(__webpack_require__("./libs/service-sdk/authorizer/index.ts"), exports);
tslib_1.__exportStar(__webpack_require__("./libs/service-sdk/db-provider/dynamodb/index.ts"), exports);
tslib_1.__exportStar(__webpack_require__("./libs/service-sdk/event-provider/index.ts"), exports);
tslib_1.__exportStar(__webpack_require__("./libs/service-sdk/identity-provider/index.ts"), exports);
tslib_1.__exportStar(__webpack_require__("./libs/service-sdk/utils/index.ts"), exports);
tslib_1.__exportStar(__webpack_require__("./libs/service-sdk/uploader/index.ts"), exports);
tslib_1.__exportStar(__webpack_require__("./libs/service-sdk/migrations/index.ts"), exports);
tslib_1.__exportStar(__webpack_require__("./libs/service-sdk/db-provider/postgres/index.ts"), exports);
tslib_1.__exportStar(__webpack_require__("./libs/service-sdk/express/index.ts"), exports);


/***/ }),

/***/ "./libs/service-sdk/migrations/config.ts":
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports["default"] = void 0;
const config = {
    entities: [],
    discovery: {
        warnWhenNoEntities: false
    },
    dbName: process.env.DB,
    type: 'postgresql',
    port: 5432,
    user: process.env.POSTGRES_USER || 'platform',
    password: process.env.POSTGRES_PASSWORD || 'platform',
    migrations: {
        tableName: 'mikroorm_migrations',
        path: './db/migrations',
        pattern: /^[\w-]+\d+\.js$/,
        emit: 'js',
    },
};
exports["default"] = config;


/***/ }),

/***/ "./libs/service-sdk/migrations/handlers.ts":
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.down = exports.up = void 0;
const tslib_1 = __webpack_require__("tslib");
const migration_1 = __webpack_require__("./libs/service-sdk/migrations/migration.ts");
const utils_1 = __webpack_require__("./libs/service-sdk/migrations/utils.ts");
const success = (response) => ({
    statusCode: 200,
    body: JSON.stringify(response),
});
const stage = process.env.STAGE || 'local';
const handler = (handlerName) => (event, context, callback, customConfig) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    const migration = new migration_1.default(yield utils_1.getConnectionOptions(customConfig));
    try {
        const response = yield migration[handlerName]();
        if (stage !== 'local') {
            callback(null, success(response));
        }
    }
    catch (error) {
        console.error(error);
        if (stage !== 'local') {
            callback(error);
        }
        else {
            throw error;
        }
    }
});
const up = handler('runMigrations');
exports.up = up;
const down = handler('undoLastMigrations');
exports.down = down;


/***/ }),

/***/ "./libs/service-sdk/migrations/index.ts":
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
const tslib_1 = __webpack_require__("tslib");
tslib_1.__exportStar(__webpack_require__("./libs/service-sdk/migrations/handlers.ts"), exports);
tslib_1.__exportStar(__webpack_require__("./libs/service-sdk/migrations/config.ts"), exports);


/***/ }),

/***/ "./libs/service-sdk/migrations/migration.ts":
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
const tslib_1 = __webpack_require__("tslib");
const core_1 = __webpack_require__("@mikro-orm/core");
const path = __webpack_require__("path");
const utils_1 = __webpack_require__("./libs/service-sdk/migrations/utils.ts");
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
                if (process.env.STAGE !== 'local') {
                    yield utils_1.createDatabase(this.config);
                }
                this.orm = yield core_1.MikroORM.init(Object.assign(Object.assign({}, this.config), { migrations: Object.assign(Object.assign({}, this.config.migrations), { path: path.join(__dirname, './migrations') }) }));
                this.connection = this.orm.em.getConnection();
                this.migrator = this.orm.getMigrator();
            }
            catch (error) {
                console.log('Could not initialize DB connection during migration.');
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
                console.log('Executing the latest batch of migrations...');
                try {
                    const migrations = yield this.migrator.up();
                    if (migrations.length > 0) {
                        const migrationsArray = '{' +
                            migrations
                                .reverse()
                                .map((a) => a.file)
                                .join(', ') +
                            '}';
                        yield this.connection.execute(`insert into batch_migrations("migrations") values (?);`, [migrationsArray]);
                    }
                    console.log('All the pending migrations were executed successfully.');
                }
                catch (error) {
                    console.error('Something went wrong while executing the pending migrations' + error);
                    throw error;
                }
                finally {
                    console.log('Migrations run', pending.map((a) => a.file).join(', '));
                    yield ((_b = this.connection) === null || _b === void 0 ? void 0 : _b.close(true));
                }
            }
            else {
                console.log('No new migrations were found.');
            }
            yield ((_c = this.connection) === null || _c === void 0 ? void 0 : _c.close(true));
            return {
                migrations_up: pending.map(a => a.file)
            };
        });
    }
    undoLastMigrations() {
        var _a, _b;
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            console.log('Rolling back the latest batch of migrations...');
            yield this.init();
            const migrations = yield this.connection.execute('select "id", "migrations", "deleted_at" from batch_migrations order by id desc limit 1');
            let migrationsArray = [];
            if (migrations && migrations.length > 0 && !migrations[0].deleted_at) {
                const migration = migrations[0];
                migrationsArray = migration.migrations;
                try {
                    yield this.migrator.down({
                        migrations: migrationsArray,
                    });
                    yield this.connection.execute(`update "batch_migrations" set deleted_at = now() where id = ?;`, [migration.id]);
                    console.log('Latest batch of migrations was rolled back successfully.');
                }
                catch (error) {
                    console.error('Something went wrong while reverting the latest batch of migrations' + error);
                    throw error;
                }
                finally {
                    console.log('Latest batch of migrations: ', migrationsArray);
                    yield ((_a = this.connection) === null || _a === void 0 ? void 0 : _a.close(true));
                }
            }
            else {
                console.log('No batch of latest migrations was found or the last migration sequence has already been rolled back.');
            }
            yield ((_b = this.connection) === null || _b === void 0 ? void 0 : _b.close(true));
            return {
                migrations_down: migrationsArray,
            };
        });
    }
}
exports["default"] = Migration;


/***/ }),

/***/ "./libs/service-sdk/migrations/utils.ts":
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.createDatabase = exports.createMigrationsTable = exports.getConnectionOptions = void 0;
const tslib_1 = __webpack_require__("tslib");
const AWS = __webpack_require__("aws-sdk");
const core_1 = __webpack_require__("@mikro-orm/core");
const path = __webpack_require__("path");
function getConnectionOptions(customConfig) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        if (customConfig) {
            return customConfig;
        }
        else {
            const SecretId = process.env.STAGE + '/infra';
            const smClient = new AWS.SecretsManager({ region: process.env.REGION });
            const secretValues = yield smClient.getSecretValue({ SecretId }).promise();
            const { aurora_master_user: auroraUsername, aurora_master_user_password: auroraPassword } = JSON.parse(secretValues.SecretString);
            return {
                type: 'postgresql',
                dbName: process.env.DB,
                host: process.env.AURORA_ENDPOINT,
                port: 5432,
                discovery: {
                    warnWhenNoEntities: false,
                    requireEntitiesArray: false,
                },
                user: auroraUsername,
                password: auroraPassword,
                migrations: {
                    tableName: 'mikroorm_migrations',
                    path: path.join(__dirname, './migrations'),
                    dropTables: true,
                    allOrNothing: true,
                    pattern: /^[\w-]+\d+\.js$/,
                    emit: 'js',
                },
            };
        }
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
        const connection = yield core_1.MikroORM.init(Object.assign(Object.assign({}, config), { dbName: 'postgres' }));
        if (!config.dbName) {
            console.error('DB environment variable missing');
            throw new Error('DB not defined');
        }
        try {
            yield connection.em.getConnection().execute(`CREATE DATABASE "${config.dbName}"`);
        }
        catch (error) {
            console.error('Error happened while creating database', error);
            if (error.code !== '42P04') {
                throw error;
            }
        }
        finally {
            console.log(`DB ${config.dbName} was created or already exists.`);
        }
        yield (connection === null || connection === void 0 ? void 0 : connection.close(true));
    });
}
exports.createDatabase = createDatabase;


/***/ }),

/***/ "./libs/service-sdk/uploader/image.ts":
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.NewUploadService = void 0;
const tslib_1 = __webpack_require__("tslib");
const aws_sdk_1 = __webpack_require__("aws-sdk");
const __1 = __webpack_require__("./libs/service-sdk/index.ts");
const shared_1 = __webpack_require__("./libs/shared/index.ts");
const client_s3_1 = __webpack_require__("@aws-sdk/client-s3");
const s3_request_presigner_1 = __webpack_require__("@aws-sdk/s3-request-presigner");
const s3Client = new client_s3_1.S3Client({ apiVersion: '2006-03-01', region: process.env.REGION });
const s3 = new aws_sdk_1.S3({ apiVersion: '2006-03-01' });
const stepFunctions = new aws_sdk_1.StepFunctions({ region: 'us-east-1' });
const IMAGE_ORIGIN_BASEPATH = 'image/original';
const NewUploadService = () => {
    const uploadimage = (bucket, key) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
        const imagekey = key ? key : __1.uuidv4();
        const originalkey = `${IMAGE_ORIGIN_BASEPATH}/${imagekey}`;
        // await s3.putObject({
        //   Body: imgbuffer,
        //   Bucket: bucket,
        //   Key: originalkey
        // }).promise()
        const imageUploadResponse = yield stepFunctions.startSyncExecution({
            stateMachineArn: process.env.SAVE_IMAGE_SF,
            input: JSON.stringify({
                key: imagekey,
                bucket: bucket,
                originalkey
            }),
        }).promise();
        return (imageUploadResponse.status === shared_1.StepFunctionStatus.SUCCESS &&
            JSON.parse(imageUploadResponse.output).isValid) ? imagekey : null;
    });
    const getPresignedURL = (bucket, existingKey) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
        const imagekey = existingKey || __1.uuidv4();
        const key = `${IMAGE_ORIGIN_BASEPATH}/${imagekey}`;
        const command = new client_s3_1.PutObjectCommand({
            Bucket: bucket,
            Key: key,
        });
        // Create the presigned URL.
        try {
            const signedUrl = yield s3_request_presigner_1.getSignedUrl(s3Client, command, {
                expiresIn: 3600,
            });
            return [signedUrl, imagekey];
        }
        catch (err) {
            console.log('error-presign-url-util: ', err);
        }
        return [null, null];
    });
    return {
        uploadimage,
        getPresignedURL
    };
};
exports.NewUploadService = NewUploadService;


/***/ }),

/***/ "./libs/service-sdk/uploader/index.ts":
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
const tslib_1 = __webpack_require__("tslib");
tslib_1.__exportStar(__webpack_require__("./libs/service-sdk/uploader/image.ts"), exports);


/***/ }),

/***/ "./libs/service-sdk/utils/error-handler.ts":
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.errorHandler = void 0;
const service_sdk_1 = __webpack_require__("./libs/service-sdk/index.ts");
const errorHandler = (err, req, res, next) => {
    if (res.headersSent) {
        return next(err);
    }
    console.error(err);
    if (err instanceof service_sdk_1.ValidationError) {
        const errors = [];
        let error;
        if (err.errors) {
            err.errors.forEach((element) => errors.push(element));
            const validationError = new service_sdk_1.ValidationError(errors);
            error = new service_sdk_1.HttpError(validationError.name, validationError.status, validationError.message, errors);
        }
        return res.status(error.status).json(error).end();
    }
    let error;
    if (err instanceof service_sdk_1.BaseError) {
        error = new service_sdk_1.HttpError(err.name, err.status, err.message);
    }
    else {
        error = new service_sdk_1.HttpError();
    }
    return res.status(error.status).json(error).end();
};
exports.errorHandler = errorHandler;


/***/ }),

/***/ "./libs/service-sdk/utils/error-types/base-error.ts":
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.BaseError = exports.StatusCodes = void 0;
var StatusCodes;
(function (StatusCodes) {
    StatusCodes[StatusCodes["OK"] = 200] = "OK";
    StatusCodes[StatusCodes["CREATED"] = 201] = "CREATED";
    StatusCodes[StatusCodes["BAD_REQUEST"] = 400] = "BAD_REQUEST";
    StatusCodes[StatusCodes["UNAUTHORIZED"] = 403] = "UNAUTHORIZED";
    StatusCodes[StatusCodes["NOT_FOUND"] = 404] = "NOT_FOUND";
    StatusCodes[StatusCodes["CONFLICT"] = 409] = "CONFLICT";
    StatusCodes[StatusCodes["GONE"] = 410] = "GONE";
    StatusCodes[StatusCodes["UNPROCESSABLE_ENTITY"] = 422] = "UNPROCESSABLE_ENTITY";
    StatusCodes[StatusCodes["INTERNAL_SERVER"] = 500] = "INTERNAL_SERVER";
    StatusCodes[StatusCodes["NOT_IMPLEMENTED"] = 501] = "NOT_IMPLEMENTED";
})(StatusCodes || (StatusCodes = {}));
exports.StatusCodes = StatusCodes;
class BaseError extends Error {
    constructor(name, status, message, errors = []) {
        super(message);
        Object.setPrototypeOf(this, new.target.prototype);
        this.name = name;
        this.message = message;
        this.status = status;
        this.errors = errors;
        if (typeof Error.captureStackTrace === 'function') {
            Error.captureStackTrace(this, this.constructor);
        }
        else {
            this.stack = new Error(message).stack;
        }
    }
    toJSON() {
        return Object.assign(Object.assign(Object.assign({ name: this.name, status: this.status }, (this.errors.length === 0 && { message: this.message })), (this.errors.length > 0 && { errors: this.errors })), (process.env.STAGE === 'development' && { stack: this.stack }));
    }
}
exports.BaseError = BaseError;


/***/ }),

/***/ "./libs/service-sdk/utils/error-types/errors.ts":
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.InternalServerError = exports.CustomError = exports.ValidationError = exports.NotFoundError = exports.AuthorizationError = exports.BadRequestError = exports.ConflictError = void 0;
const _1 = __webpack_require__("./libs/service-sdk/utils/error-types/index.ts");
class ConflictError extends _1.BaseError {
    constructor(message) {
        super("Conflict Error", _1.StatusCodes.CONFLICT, message);
        this.message = message;
    }
}
exports.ConflictError = ConflictError;
class BadRequestError extends _1.BaseError {
    constructor(message) {
        super("Bad Request", _1.StatusCodes.BAD_REQUEST, message);
        this.message = message;
    }
}
exports.BadRequestError = BadRequestError;
class AuthorizationError extends _1.BaseError {
    constructor(message = "Permission denied") {
        super("Authorization Error", _1.StatusCodes.UNAUTHORIZED, message);
        this.message = message;
    }
}
exports.AuthorizationError = AuthorizationError;
class NotFoundError extends _1.BaseError {
    constructor(entityName, customMessage) {
        super("Not Found", _1.StatusCodes.NOT_FOUND, customMessage || entityName + " not found.");
        this.entityName = entityName;
    }
}
exports.NotFoundError = NotFoundError;
class InternalServerError extends _1.BaseError {
    constructor() {
        super("Internal Error", _1.StatusCodes.INTERNAL_SERVER, "Internal server error.");
    }
}
exports.InternalServerError = InternalServerError;
class ValidationError extends _1.BaseError {
    constructor(errors) {
        super("Validation Error", _1.StatusCodes.UNPROCESSABLE_ENTITY, "Validation error.", errors);
    }
}
exports.ValidationError = ValidationError;
class CustomError extends _1.BaseError {
    constructor(name, status, message) {
        super(name, status, message);
    }
}
exports.CustomError = CustomError;


/***/ }),

/***/ "./libs/service-sdk/utils/error-types/http-error.ts":
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.HttpError = void 0;
const base_error_1 = __webpack_require__("./libs/service-sdk/utils/error-types/base-error.ts");
class HttpError extends base_error_1.BaseError {
    constructor(name = "Internal Error", status = base_error_1.StatusCodes.INTERNAL_SERVER, message = 'Internal server error.', errors) {
        super(name, status, message, errors);
    }
}
exports.HttpError = HttpError;


/***/ }),

/***/ "./libs/service-sdk/utils/error-types/index.ts":
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
const tslib_1 = __webpack_require__("tslib");
tslib_1.__exportStar(__webpack_require__("./libs/service-sdk/utils/error-types/base-error.ts"), exports);
tslib_1.__exportStar(__webpack_require__("./libs/service-sdk/utils/error-types/http-error.ts"), exports);
tslib_1.__exportStar(__webpack_require__("./libs/service-sdk/utils/error-types/errors.ts"), exports);


/***/ }),

/***/ "./libs/service-sdk/utils/events-local.ts":
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.asyncEventsLocal = exports.eventsLocal = void 0;
const tslib_1 = __webpack_require__("tslib");
const __1 = __webpack_require__("./libs/service-sdk/index.ts");
const event_provider_1 = __webpack_require__("./libs/service-sdk/event-provider/index.ts");
const localSubscriber = new event_provider_1.EvClient();
function eventsLocal(eventHandlers) {
    Object.keys(eventHandlers).forEach((channel) => {
        localSubscriber.subscribe(channel);
    });
    localSubscriber.on("message", (channel, message) => tslib_1.__awaiter(this, void 0, void 0, function* () {
        const messageParsed = JSON.parse(message);
        const functionsToExecute = eventHandlers[channel];
        functionsToExecute.forEach((functionToExecute) => tslib_1.__awaiter(this, void 0, void 0, function* () {
            yield functionToExecute(messageParsed);
        }));
    }));
}
exports.eventsLocal = eventsLocal;
function asyncEventsLocal(eventHandlers, db, entities) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        Object.keys(eventHandlers).forEach((channel) => {
            localSubscriber.subscribe(channel);
        });
        const connection = yield __1.getConnection("butler", db, entities);
        localSubscriber.on("message", (channel, message) => tslib_1.__awaiter(this, void 0, void 0, function* () {
            const messageParsed = JSON.parse(message);
            const functionsToExecute = eventHandlers[channel];
            functionsToExecute.forEach((functionToExecute) => tslib_1.__awaiter(this, void 0, void 0, function* () {
                yield functionToExecute(messageParsed, connection);
            }));
        }));
    });
}
exports.asyncEventsLocal = asyncEventsLocal;


/***/ }),

/***/ "./libs/service-sdk/utils/express-local.ts":
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.expressLocal = void 0;
const shared_1 = __webpack_require__("./libs/shared/index.ts");
function expressLocal(app, name) {
    const { port } = shared_1.appsDefinitionLocal[name];
    const server = app.listen(port, () => {
        console.log(`Listening at http://localhost:${port}/api`);
        console.log(`Documentation at http://butler.localhost:${port}/api/${name}/docs`);
    });
    server.on("error", console.error);
}
exports.expressLocal = expressLocal;


/***/ }),

/***/ "./libs/service-sdk/utils/index.ts":
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
const tslib_1 = __webpack_require__("tslib");
tslib_1.__exportStar(__webpack_require__("./libs/service-sdk/utils/error-handler.ts"), exports);
tslib_1.__exportStar(__webpack_require__("./libs/service-sdk/utils/statusCodes.ts"), exports);
tslib_1.__exportStar(__webpack_require__("./libs/service-sdk/utils/events-local.ts"), exports);
tslib_1.__exportStar(__webpack_require__("./libs/service-sdk/utils/express-local.ts"), exports);
tslib_1.__exportStar(__webpack_require__("./libs/service-sdk/utils/error-types/index.ts"), exports);


/***/ }),

/***/ "./libs/service-sdk/utils/statusCodes.ts":
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.HttpStatusCode = void 0;
exports.HttpStatusCode = {
    OK: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    GONE: 410,
    INTERNAL_SERVER: 500,
};


/***/ }),

/***/ "./libs/shared/base.ts":
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.deleteEntityValidator = exports.coordinatesValidator = exports.addressValidator = exports.primaryContactValidator = void 0;
const yup = __webpack_require__("yup");
const libphonenumber_js_1 = __webpack_require__("libphonenumber-js");
const isEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
function isValidPhoneNumberCheck() {
    return this.test(`test-phonenumber-input`, (value) => {
        if (value && !libphonenumber_js_1.isValidPhoneNumber(value))
            return false;
        return true;
    });
}
yup.addMethod(yup.MixedSchema, 'isValidPhoneNumberCheck', isValidPhoneNumberCheck);
const primaryContactValidator = yup.object().shape({
    email: yup
        .string()
        .transform((value) => Array.from(new Set(value.split(','))).join(','))
        .required()
        .test('emails', 'Invalid email address', (value) => value && value.split(',').every(isEmail)),
    phone: yup.string().isValidPhoneNumberCheck().required().label('Hotel Contact Number'),
});
exports.primaryContactValidator = primaryContactValidator;
const addressValidator = yup.object().shape({
    city: yup.string().optional().label('City'),
    country: yup.string().required().label('Country'),
    line1: yup.string().required().label('Address 1'),
    line2: yup.string(),
    zip_code: yup.string().required().label('Zip code'),
    state: yup.string().required().label('State'),
});
exports.addressValidator = addressValidator;
const coordinatesValidator = yup.object().shape({
    latitude: yup.string(),
    longitude: yup.string(),
});
exports.coordinatesValidator = coordinatesValidator;
const deleteEntityValidator = yup.object().shape({
    id: yup.string(),
});
exports.deleteEntityValidator = deleteEntityValidator;


/***/ }),

/***/ "./libs/shared/iam/index.ts":
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.warmupkey = void 0;
const tslib_1 = __webpack_require__("tslib");
tslib_1.__exportStar(__webpack_require__("./libs/shared/iam/role.ts"), exports);
tslib_1.__exportStar(__webpack_require__("./libs/shared/iam/user.ts"), exports);
tslib_1.__exportStar(__webpack_require__("./libs/shared/iam/permissions.ts"), exports);
exports.warmupkey = 'serverless-plugin-warmup';


/***/ }),

/***/ "./libs/shared/iam/permissions.ts":
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.PERMISSION = void 0;
exports.PERMISSION = {
    IAM: {
        CAN_GET_SINGLE_ROLE: "CAN_GET_SINGLE_ROLE",
        CAN_LIST_ROLES: "CAN_LIST_ROLES",
        CAN_CREATE_ROLE: "CAN_CREATE_ROLE",
        CAN_UPDATE_ROLE: "CAN_UPDATE_ROLE",
        CAN_DELETE_ROLE: "CAN_DELETE_ROLE",
        CAN_GET_AUTHENTICATED_USER: "CAN_GET_AUTHENTICATED_USER",
        CAN_GET_SINGLE_USER: "CAN_GET_SINGLE_USER",
        CAN_LIST_USERS: "CAN_LIST_USERS",
        CAN_CREATE_USER: "CAN_CREATE_USER",
        CAN_CREATE_HOTEL_PARTNER: "CAN_CREATE_HOTEL_PARTNER",
        CAN_UPDATE_USER: "CAN_UPDATE_USER",
        CAN_DELETE_USER: "CAN_DELETE_USER",
        CAN_GET_APPS: "CAN_GET_APPS",
        CAN_GET_PERMISSIONS: "CAN_GET_PERMISSIONS",
        CAN_GET_SINGLE_PERMISSION_GROUP: "CAN_GET_SINGLE_PERMISSION_GROUP",
        CAN_LIST_PERMISSION_GROUPS: "CAN_LIST_PERMISSION_GROUPS",
        CAN_CREATE_PERMISSION_GROUP: "CAN_CREATE_PERMISSION_GROUP",
        CAN_UPDATE_PERMISSION_GROUP: "CAN_UPDATE_PERMISSION_GROUP",
        CAN_DELETE_PERMISSION_GROUP: "CAN_DELETE_PERMISSION_GROUP",
        CAN_LIST_APPS: "CAN_LIST_APPS",
    },
    MENU: {
        CAN_GET_CATEGORIES: "CAN_GET_CATEGORIES",
        CAN_GET_CATEGORY_RELATIONS: "CAN_GET_CATEGORY_RELATIONS",
        CAN_GET_CATEGORY: "CAN_GET_CATEGORY",
        CAN_CREATE_CATEGORY: "CAN_CREATE_CATEGORY",
        CAN_UPDATE_CATEGORY: "CAN_UPDATE_CATEGORY",
        CAN_DELETE_CATEGORY: "CAN_DELETE_CATEGORY",
        CAN_GET_SUBCATEGORIES: "CAN_GET_SUBCATEGORIES",
        CAN_GET_SUBCATEGORY: "CAN_GET_SUBCATEGORY",
        CAN_GET_SUBCATEGORY_RELATIONS: "CAN_GET_SUBCATEGORY_RELATIONS",
        CAN_CREATE_SUBCCATEGORY: "CAN_CREATE_SUBCCATEGORY",
        CAN_UPDATE_SUBCATEGORY: "CAN_UPDATE_SUBCATEGORY",
        CAN_DELETE_SUBCATEGORY: "CAN_DELETE_SUBCATEGORY",
        CAN_BATCH_GET_SUBCATEGORIES: "CAN_BATCH_GET_SUBCATEGORIES",
        CAN_GET_MODIFIERS: "CAN_GET_MODIFIERS",
        CAN_GET_MODIFIER: "CAN_GET_MODIFIER",
        CAN_CREATE_MODIFIER: "CAN_CREATE_MODIFIER",
        CAN_UPDATE_MODIFIER: "CAN_UPDATE_MODIFIER",
        CAN_DELETE_MODIFIER: "CAN_DELETE_MODIFIER",
        CAN_GET_ITEMS_BY_MODIFIER: "CAN_GET_ITEMS_BY_MODIFIER",
        CAN_GET_PRESIGNED_URL: "CAN_GET_PRESIGNED_URL",
        CAN_GET_ITEM: "CAN_GET_ITEM",
        CAN_GET_ITEM_RELATIONS: "CAN_GET_ITEM_RELATIONS",
        CAN_GET_ITEMS_BY_SUBCATEGORY: "CAN_GET_ITEMS_BY_SUBCATEGORY",
        CAN_GET_ITEMS_BY_CATEGORY: "CAN_GET_ITEMS_BY_CATEGORY",
        CAN_CREATE_ITEM: "CAN_CREATE_ITEM",
        CAN_UPDATE_ITEM: "CAN_UPDATE_ITEM",
        CAN_GET_CATEGORIZED_ITEMS: "CAN_GET_CATEGORIZED_ITEMS",
        CAN_DELETE_ITEM: "CAN_DELETE_ITEM",
        CAN_GET_ITEMS: "CAN_GET_ITEMS",
        CAN_GET_MENUS: "CAN_GET_MENUS",
        CAN_GET_SINGLE_MENU: "CAN_GET_SINGLE_MENU",
        CAN_CREATE_MENU: "CAN_CREATE_MENU",
        CAN_UPDATE_MENU: "CAN_UPDATE_MENU",
        CAN_DUPLICATE_MENU: "CAN_DUPLICATE_MENU",
        CAN_DELETE_MENU: "CAN_DELETE_MENU",
        CAN_BATCH_EDIT_MENU: "CAN_BATCH_EDIT_MENU",
        CAN_GET_MENU_HOTELS: "CAN_GET_MENU_HOTELS",
        CAN_GET_ALL_HOTELS: "CAN_GET_ALL_HOTELS",
        CAN_ASSIGN_MENU: "CAN_ASSIGN_MENU",
        CAN_PUSH_MENU_TO_PRODUCTION: "CAN_PUSH_MENU_TO_PRODUCTION",
    },
    NETWORK: {
        CAN_GET_CITIES: "CAN_GET_CITIES",
        CAN_GET_CITY: "CAN_GET_CITY",
        CAN_CREATE_CITY: "CAN_CREATE_CITY",
        CAN_UPDATE_CITY: "CAN_UPDATE_CITY",
        CAN_DELETE_CITY: "CAN_DELETE_CITY",
        CAN_GET_HOTELS: "CAN_GET_HOTELS",
        CAN_GET_HOTEL: "CAN_GET_HOTEL",
        CAN_CREATE_HOTEL: "CAN_CREATE_HOTEL",
        CAN_CREATE_HOTEL_SF: "CAN_CREATE_HOTEL_SF",
        CAN_UPDATE_HOTEL: "CAN_UPDATE_HOTEL",
        CAN_UPDATE_HOTEL_INTEGRATION_CONFIGS_SHUTTLE_APP: "CAN_UPDATE_HOTEL_INTEGRATION_CONFIGS_SHUTTLE_APP",
        CAN_UPDATE_HOTEL_PAYMENTS: "CAN_UPDATE_HOTEL_PAYMENTS",
        CAN_UPDATE_HOTEL_INTEGRATION_CONFIGS_PMS: "CAN_UPDATE_HOTEL_INTEGRATION_CONFIGS_PMS",
        CAN_UPDATE_HOTEL_INTEGRATION_CONFIGS_ACTIVITIES_APP: "CAN_UPDATE_HOTEL_INTEGRATION_CONFIGS_ACTIVITIES_APP",
        CAN_UPDATE_HOTEL_INTEGRATION_CONFIGS_MENU_APP: "CAN_UPDATE_HOTEL_INTEGRATION_CONFIGS_MENU_APP",
        CAN_UPDATE_HOTEL_INTEGRATION_CONFIGS_VOUCHERS_APP: "CAN_UPDATE_HOTEL_INTEGRATION_CONFIGS_VOUCHERS_APP",
        CAN_CHANGE_HOTEL_STATUS: "CAN_CHANGE_HOTEL_STATUS",
        CAN_DELETE_HOTEL: "CAN_DELETE_HOTEL",
        CAN_GET_HUBS: "CAN_GET_HUBS",
        CAN_GET_HUB: "CAN_GET_HUB",
        CAN_CREATE_HUB: "CAN_CREATE_HUB",
        CAN_UPDATE_HUB: "CAN_UPDATE_HUB",
        CAN_DEACTIVATE_HUB: "CAN_DEACTIVATE_HUB",
        CAN_DELETE_HUB: "CAN_DELETE_HUB",
    },
    VOUCHER: {
        CAN_GET_HOTELS_WITH_VOUCHERS: "CAN_GET_HOTELS_WITH_VOUCHERS",
        CAN_GET_HOTEL_VOUCHER_CODES: "CAN_GET_HOTEL_VOUCHER_CODES",
        CAN_GENERATE_VOUCHER_CODES: "CAN_GENERATE_VOUCHER_CODES",
        CAN_GET_SINGLE_VOUCHER_PROGRAM: "CAN_GET_SINGLE_VOUCHER_PROGRAM",
        CAN_LIST_VOUCHER_PROGRAMS: "CAN_LIST_VOUCHER_PROGRAMS",
        CAN_CREATE_VOUCHER_PROGRAM: "CAN_CREATE_VOUCHER_PROGRAM",
        CAN_UPDATE_VOUCHER_PROGRAMS: "CAN_UPDATE_VOUCHER_PROGRAMS",
        CAN_DELETE_VOUCHER_PROGRAMS: "CAN_DELETE_VOUCHER_PROGRAMS",
    },
};


/***/ }),

/***/ "./libs/shared/iam/role.ts":
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.deleteRoleValidator = exports.updateRoleValidator = exports.createRoleValidator = void 0;
const yup = __webpack_require__("yup");
const createRoleValidator = yup.object().shape({
    name: yup.string().required(),
    description: yup.string().required(),
    permissiongroups: yup.array().of(yup.string()).required(),
});
exports.createRoleValidator = createRoleValidator;
const updateRoleValidator = yup.object().shape({
    name: yup.string().required(),
    description: yup.string().required(),
    permissiongroups: yup.array().of(yup.string()).required(),
});
exports.updateRoleValidator = updateRoleValidator;
const deleteRoleValidator = yup.object().shape({
    name: yup.string().required(),
});
exports.deleteRoleValidator = deleteRoleValidator;


/***/ }),

/***/ "./libs/shared/iam/user.ts":
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.createHotelPartnersValidator = exports.deleteUserValidator = exports.updateUserValidator = exports.createUserValidator = void 0;
const yup = __webpack_require__("yup");
const hotel_1 = __webpack_require__("./libs/shared/network/hotel.ts");
const createHotelPartnersValidator = yup.object().shape({
    authorized_users: yup.array().of(hotel_1.authorizedUserValidator).optional().label('Authorized users'),
    hotel_id: yup.string().required(),
});
exports.createHotelPartnersValidator = createHotelPartnersValidator;
const createUserValidator = yup.object().shape({
    email: yup.string().required(),
    name: yup.string().required(),
    phone_number: yup.string().optional(),
    roles: yup.array().of(yup.string()).required(),
});
exports.createUserValidator = createUserValidator;
const updateUserValidator = yup.object().shape({
    email: yup.string().required(),
    name: yup.string().required(),
    phone_number: yup.string().optional(),
    roles: yup.array().of(yup.string()).optional(),
});
exports.updateUserValidator = updateUserValidator;
const deleteUserValidator = yup.object().shape({
    pk: yup.string().required(),
    sk: yup.string().required(),
});
exports.deleteUserValidator = deleteUserValidator;


/***/ }),

/***/ "./libs/shared/index.ts":
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
const tslib_1 = __webpack_require__("tslib");
tslib_1.__exportStar(__webpack_require__("./libs/shared/base.ts"), exports);
tslib_1.__exportStar(__webpack_require__("./libs/shared/iam/index.ts"), exports);
tslib_1.__exportStar(__webpack_require__("./libs/shared/network/index.ts"), exports);
tslib_1.__exportStar(__webpack_require__("./libs/shared/tenant/index.ts"), exports);
tslib_1.__exportStar(__webpack_require__("./libs/shared/menu/index.ts"), exports);
tslib_1.__exportStar(__webpack_require__("./libs/shared/voucher/index.ts"), exports);
tslib_1.__exportStar(__webpack_require__("./libs/shared/utils/index.ts"), exports);


/***/ }),

/***/ "./libs/shared/menu/category.ts":
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.CATEGORY_EVENT = exports.deleteCategoryValidator = exports.updateCategoryValidator = exports.createCategoryValidator = void 0;
const yup = __webpack_require__("yup");
const createCategoryValidator = yup.object().noUnknown(true).required().shape({
    name: yup.string().trim().required('Name is a required field!'),
    isSubCategory: yup.boolean(),
    start_time: yup.string().when("isSubCategory", {
        is: true,
        then: (schema) => schema.trim().required('Start date is a required field!'),
        otherwise: (schema) => schema.trim().notRequired()
    }),
    end_time: yup.string().when("isSubCategory", {
        is: true,
        then: (schema) => schema.trim().required('End date is a required field!'),
        otherwise: (schema) => schema.trim().notRequired()
    }),
    categoryId: yup.string(), // TODO: required('Category is a required field!')
});
exports.createCategoryValidator = createCategoryValidator;
const updateCategoryValidator = yup.object().noUnknown(true).required().shape({
    name: yup.string().trim().required('Name is a required field!'),
    isSubCategory: yup.boolean(),
    start_time: yup.string().when("isSubCategory", {
        is: (value) => value,
        then: yup.string().trim().required('Start date is a required field!')
    }),
    end_time: yup.string().when("isSubCategory", {
        is: (value) => value,
        then: yup.string().trim().required('End date is a required field!')
    }),
    categoryId: yup.string(), // TODO: required('Category is a required field!')
});
exports.updateCategoryValidator = updateCategoryValidator;
const deleteCategoryValidator = yup.object().shape({
    id: yup.string().required(),
});
exports.deleteCategoryValidator = deleteCategoryValidator;
var CATEGORY_EVENT;
(function (CATEGORY_EVENT) {
    CATEGORY_EVENT["UPDATED"] = "CATEGORY_UPDATED";
    CATEGORY_EVENT["DELETED"] = "CATEGORY_DELETED";
})(CATEGORY_EVENT || (CATEGORY_EVENT = {}));
exports.CATEGORY_EVENT = CATEGORY_EVENT;


/***/ }),

/***/ "./libs/shared/menu/index.ts":
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
const tslib_1 = __webpack_require__("tslib");
tslib_1.__exportStar(__webpack_require__("./libs/shared/menu/item.ts"), exports);
tslib_1.__exportStar(__webpack_require__("./libs/shared/menu/item-list.ts"), exports);
tslib_1.__exportStar(__webpack_require__("./libs/shared/menu/category.ts"), exports);
tslib_1.__exportStar(__webpack_require__("./libs/shared/menu/subcategory.ts"), exports);
tslib_1.__exportStar(__webpack_require__("./libs/shared/menu/modifier.ts"), exports);
tslib_1.__exportStar(__webpack_require__("./libs/shared/menu/shared-items.ts"), exports);
tslib_1.__exportStar(__webpack_require__("./libs/shared/menu/menu.ts"), exports);


/***/ }),

/***/ "./libs/shared/menu/item-list.ts":
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));


/***/ }),

/***/ "./libs/shared/menu/item.ts":
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.updateItemModifiersValidator = exports.generalInformationValidator = exports.updateItemSubcategoriesValidator = exports.ITEM_EVENT = exports.ItemPatchType = exports.DOUBLE_DIGIT_NUMBER_FORMAT_REGEX = void 0;
const yup = __webpack_require__("yup");
var ItemPatchType;
(function (ItemPatchType) {
    ItemPatchType["GENERAL_INFORMATION"] = "general-information";
    ItemPatchType["MODIFIERS"] = "modifiers";
    ItemPatchType["CATEGORIES"] = "categories";
})(ItemPatchType || (ItemPatchType = {}));
exports.ItemPatchType = ItemPatchType;
/**
 * validators
*/
exports.DOUBLE_DIGIT_NUMBER_FORMAT_REGEX = /^\s*(?=.*[1-9])\d*(?:\.\d{1,2})?\s*$/;
const generalInformationValidator = yup.object().shape({
    needs_cutlery: yup.boolean().required(),
    guest_view: yup.boolean().required(),
    raw_food: yup.boolean().required(),
    price: yup.number()
        .typeError('Price is a required field!')
        .required('Price is a required field!')
        .test("maxDigitsAfterDecimal", `Number field must have 2 digits after decimal or less`, (value) => (exports.DOUBLE_DIGIT_NUMBER_FORMAT_REGEX.test(value.toString()))),
    image: yup.mixed().required('Image file is a required field!'),
    name: yup.string().required('Name is a required field!'),
    description: yup.string().required('Description is a required field!'),
    labels: yup.array().of(yup.string()).optional()
}).required();
exports.generalInformationValidator = generalInformationValidator;
const updateItemModifiersValidator = yup.object().shape({
    modifiers: yup.array().of(yup.object().shape({
        id: yup.string().required(),
        name: yup.string().required(),
    })).required()
}).required();
exports.updateItemModifiersValidator = updateItemModifiersValidator;
// TODO switch categories
const updateItemSubcategoriesValidator = yup.object().shape({
    subcategories: yup.array().of(yup.string()).required()
}).required();
exports.updateItemSubcategoriesValidator = updateItemSubcategoriesValidator;
var ITEM_EVENT;
(function (ITEM_EVENT) {
    ITEM_EVENT["DELETED"] = "ITEM_DELETED";
    ITEM_EVENT["UPDATED"] = "ITEM_UPDATED";
    ITEM_EVENT["MODIFIER_UPDATED"] = "ITEM_MODIFIER_UPDATED";
})(ITEM_EVENT || (ITEM_EVENT = {}));
exports.ITEM_EVENT = ITEM_EVENT;
;


/***/ }),

/***/ "./libs/shared/menu/menu.ts":
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.MENU_EVENT = exports.menuValidation = exports.MENU_STATUS = void 0;
const yup = __webpack_require__("yup");
var MENU_STATUS;
(function (MENU_STATUS) {
    MENU_STATUS["ACTIVE"] = "ACTIVE";
    MENU_STATUS["INACTIVE"] = "INACTIVE";
})(MENU_STATUS || (MENU_STATUS = {}));
exports.MENU_STATUS = MENU_STATUS;
const menuValidation = yup.object().shape({
    name: yup.string().required(),
    subcategories: yup.object().required("Items are required for menu")
});
exports.menuValidation = menuValidation;
var MENU_EVENT;
(function (MENU_EVENT) {
    MENU_EVENT["UPDATED"] = "MENU_UPDATED";
    MENU_EVENT["DELETED"] = "MENU_DELETED";
})(MENU_EVENT || (MENU_EVENT = {}));
exports.MENU_EVENT = MENU_EVENT;


/***/ }),

/***/ "./libs/shared/menu/modifier.ts":
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.MODIFIER_EVENT = exports.deleteModifierValidator = exports.updateModifierValidator = exports.createModifierValidator = void 0;
// interfaces
const base_1 = __webpack_require__("./libs/shared/base.ts");
const yup = __webpack_require__("yup");
/**
 *  Validation Schemas
 */
const modifierOptionValidator = yup.object().noUnknown(true).required().shape({
    name: yup.string().required('Name of option is a required field!'),
    price: yup.number().test("maxDigitsAfterDecimal", `Number field must have 2 digits after decimal or less`, (value) => (/^\d+(\.\d{1,2})?$/.test(value.toString()))).required('Price is a required field!'),
});
const createModifierValidator = yup.object().noUnknown(true).required().shape({
    name: yup.string().required('Name is a required field!'),
    multiselect: yup.boolean().required(),
    options: yup.array().required().of(modifierOptionValidator).min(1, 'At least one option is required!')
});
exports.createModifierValidator = createModifierValidator;
const updateModifierValidator = yup.object().noUnknown(true).required().shape({
    id: yup.string().required(),
    name: yup.string().required('Name is a required field!'),
    multiselect: yup.boolean().required(),
    options: yup.array().required().of(modifierOptionValidator).min(1, 'At least one option is required!')
});
exports.updateModifierValidator = updateModifierValidator;
const deleteModifierValidator = base_1.deleteEntityValidator;
exports.deleteModifierValidator = deleteModifierValidator;
/**
 * Event Names
 */
var MODIFIER_EVENT;
(function (MODIFIER_EVENT) {
    MODIFIER_EVENT["CREATED"] = "MODIFIER_CREATED";
    MODIFIER_EVENT["UPDATED"] = "MODIFIER_UPDATED";
    MODIFIER_EVENT["DELETED"] = "MODIFIER_DELETED";
})(MODIFIER_EVENT || (MODIFIER_EVENT = {}));
exports.MODIFIER_EVENT = MODIFIER_EVENT;
;


/***/ }),

/***/ "./libs/shared/menu/shared-items.ts":
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));


/***/ }),

/***/ "./libs/shared/menu/subcategory.ts":
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.updateSubCategoryValidator = exports.createSubCategoryValidator = exports.SUBCATEGORY_EVENT = void 0;
const yup = __webpack_require__("yup");
/**
 *  Validation Schemas
 */
const createSubCategoryValidator = yup.object().noUnknown(true).required().shape({
    categoryId: yup.string().trim().required('Category is a required field!'),
    name: yup.string().trim().required('Name is a required field!'),
});
exports.createSubCategoryValidator = createSubCategoryValidator;
const updateSubCategoryValidator = yup.object().required().shape({
    // categoryId: yup.string().trim().required('Category is a required field!'),
    name: yup.string().trim().required('Name is a required field!'),
    category: yup.object({
        id: yup.string().trim(),
        name: yup.string().trim()
    })
});
exports.updateSubCategoryValidator = updateSubCategoryValidator;
/**
 * Event Names
 */
var SUBCATEGORY_EVENT;
(function (SUBCATEGORY_EVENT) {
    SUBCATEGORY_EVENT["UPDATED"] = "SUBCATEGORY_UPDATED";
    SUBCATEGORY_EVENT["DELETED"] = "SUBCATEGORY_DELETED";
})(SUBCATEGORY_EVENT || (SUBCATEGORY_EVENT = {}));
exports.SUBCATEGORY_EVENT = SUBCATEGORY_EVENT;
;


/***/ }),

/***/ "./libs/shared/network/base.ts":
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));


/***/ }),

/***/ "./libs/shared/network/city-v2.ts":
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.createCityValidatorV2 = void 0;
const yup = __webpack_require__("yup");
/**
 *  Validation Schemas
 */
const createCityValidator = yup
    .object()
    .noUnknown(true)
    .required()
    .shape({
    name: yup.string().required("Name is a required field!"),
    time_zone: yup.string().required("Time zone is a required field!"),
    state: yup.string().optional(),
});
exports.createCityValidatorV2 = createCityValidator;


/***/ }),

/***/ "./libs/shared/network/city.ts":
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.CITY_EVENT = exports.deleteCityValidator = exports.updateCityValidator = exports.createCityValidator = exports.patchCityValidator = void 0;
const yup = __webpack_require__("yup");
const base_1 = __webpack_require__("./libs/shared/base.ts");
/**
 *  Validation Schemas
 */
const createCityValidator = yup.object().shape({
    name: yup.string().required(),
    time_zone: yup.string().required(),
    state: yup.string().required(),
    country: yup.string().required(),
});
exports.createCityValidator = createCityValidator;
const updateCityValidator = yup.object().shape({
    name: yup.string().optional(),
    time_zone: yup.string().optional(),
    state: yup.string().optional(),
    country: yup.string().optional(),
});
exports.updateCityValidator = updateCityValidator;
const patchCityValidator = yup.object().shape({
    name: yup.string().optional(),
    time_zone: yup.string().optional(),
    state: yup.string().optional(),
    country: yup.string().optional(),
});
exports.patchCityValidator = patchCityValidator;
const deleteCityValidator = base_1.deleteEntityValidator;
exports.deleteCityValidator = deleteCityValidator;
/**
 * Event Names
 */
var CITY_EVENT;
(function (CITY_EVENT) {
    CITY_EVENT["CREATED"] = "CITY_CREATED";
    CITY_EVENT["UPDATED"] = "CITY_UPDATED";
    CITY_EVENT["DELETED"] = "CITY_DELETED";
})(CITY_EVENT || (CITY_EVENT = {}));
exports.CITY_EVENT = CITY_EVENT;


/***/ }),

/***/ "./libs/shared/network/hotel-v2.ts":
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));


/***/ }),

/***/ "./libs/shared/network/hotel.ts":
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.WEEK_DAYS = exports.HOTEL_EVENT = exports.patchPaymentSettingsValidator = exports.authorizedUserValidator = exports.deactivateHubInputValidator = exports.changeHotelStatusInputValidator = exports.patchIntegrationConfigsVouchersAppValidator = exports.patchIntegrationConfigsMenuAppValidator = exports.patchIntegrationConfigsPmsValidator = exports.patchIntegrationConfigsActivitiesValidator = exports.patchIntegrationConfigsShuttleAppValidator = exports.patchHotelValidator = exports.deleteHotelValidator = exports.updateHotelValidator = exports.createHotelValidator = void 0;
const yup = __webpack_require__("yup");
const base_1 = __webpack_require__("./libs/shared/base.ts");
const authorizedUserValidator = yup.object().shape({
    first_name: yup.string().required().label("First Name"),
    last_name: yup.string().required().label("Last Name"),
    email: yup.string().email().required().label("Email"),
});
exports.authorizedUserValidator = authorizedUserValidator;
const createHotelValidator = yup.object().shape({
    name: yup.string().required().label("Hotel Name"),
    formal_name: yup.string(),
    city_id: yup.string().required().label("City"),
    code: yup.string().max(6, "Hotel code should contain a maximum of 6 characters").required().label("Hotel code"),
    active: yup.boolean().optional().default(true),
    is_tax_exempt: yup.boolean().optional().default(false),
    primary_contact: base_1.primaryContactValidator,
    address: base_1.addressValidator,
    hub_id: yup.string().required().label("Hub"),
    account_manager_id: yup.string().required().label("Customer Success Manager"),
    room_numbers: yup.array().of(yup.number()).label("Room Number Count"),
    authorized_users: yup.array().of(authorizedUserValidator).optional().label("Authorized users"),
    room_count: yup.string().required().label("Room count"),
});
exports.createHotelValidator = createHotelValidator;
const updateHotelValidator = yup.object({
    id: yup.string(),
    name: yup.string(),
    formal_name: yup.string(),
    code: yup.string().min(3).max(6),
    active: yup.boolean().default(false),
    payment_settings: yup.object({
        allow_credit_card: yup.boolean().default(false),
        allow_room_charge: yup.boolean().default(false),
    }),
    menu_id: yup.string().label("Menu"),
    is_tax_exempt: yup.boolean().default(false),
    primary_contact: base_1.primaryContactValidator,
    address: base_1.addressValidator,
    hub_id: yup.string(),
    allow_scheduled_orders: yup.boolean().default(false),
    account_manager_id: yup.string(),
    account_manager: yup.object({ id: yup.string(), name: yup.string() }).optional(),
    integration_configs: yup.object({
        pms: yup.object({
            enabled: yup.boolean(),
        }),
        activities_app: yup.object({
            enabled: yup.boolean(),
        }),
        shuttle_app: yup.object({
            enabled: yup.boolean(),
        }),
    }),
    delivery_instructions: yup.string(),
    room_numbers: yup.array().of(yup.number()).label("Room number"),
    authorized_users: yup.array().of(authorizedUserValidator).optional().label("Authorized users"),
    created_at: yup.number().optional(),
    updated_at: yup.number().optional(),
});
exports.updateHotelValidator = updateHotelValidator;
const patchIntegrationConfigsShuttleAppValidator = yup.object({
    enabled: yup.boolean(),
});
exports.patchIntegrationConfigsShuttleAppValidator = patchIntegrationConfigsShuttleAppValidator;
const patchIntegrationConfigsVouchersAppValidator = yup.object({
    enabled: yup.boolean(),
    authorized_users: yup.array().of(authorizedUserValidator).optional().label("Authorized users"),
});
exports.patchIntegrationConfigsVouchersAppValidator = patchIntegrationConfigsVouchersAppValidator;
const patchIntegrationConfigsPmsValidator = yup.object({
    enabled: yup.boolean(),
});
exports.patchIntegrationConfigsPmsValidator = patchIntegrationConfigsPmsValidator;
const patchIntegrationConfigsActivitiesValidator = yup.object({
    enabled: yup.boolean(),
});
exports.patchIntegrationConfigsActivitiesValidator = patchIntegrationConfigsActivitiesValidator;
const patchPaymentSettingsValidator = yup.object({
    allow_credit_card: yup.boolean().default(false),
    allow_room_charge: yup.boolean().default(false),
});
exports.patchPaymentSettingsValidator = patchPaymentSettingsValidator;
const changeHotelStatusInputValidator = yup.object({
    active: yup.boolean().required(),
});
exports.changeHotelStatusInputValidator = changeHotelStatusInputValidator;
const patchIntegrationConfigsMenuAppValidator = yup.object({
    enabled: yup.boolean(),
    web_id: yup.string().required().label("Web Id"),
    web_code: yup.string().required().label("Web Code"),
    web_phone: yup.string().required().label("Web Phone"),
    allow_scheduled_orders: yup.boolean().required().label("Allow Scheduled Orders"),
    delivery_instructions: yup.string().label("Delivery Instructions"),
});
exports.patchIntegrationConfigsMenuAppValidator = patchIntegrationConfigsMenuAppValidator;
const patchHotelValidator = yup.object({
    name: yup.string().optional(),
    formal_name: yup.string().optional(),
    code: yup.string().optional(),
    active: yup.boolean().default(false).optional(),
    payment_settings: yup
        .object({
        allow_credit_card: yup.boolean().default(false),
        allow_room_charge: yup.boolean().default(false),
    })
        .optional(),
    is_tax_exempt: yup.boolean().default(false).optional(),
    primary_contact: base_1.primaryContactValidator.optional().default(undefined),
    address: base_1.addressValidator.optional().default(undefined),
    hub_id: yup.string().optional(),
    city_id: yup.string().optional(),
    allow_scheduled_orders: yup.boolean().default(false).optional(),
    account_manager_id: yup.string().optional(),
    account_manager: yup.object({ id: yup.string(), name: yup.string() }).optional(),
    integration_configs: yup
        .object({
        pms: yup.object({
            enabled: yup.boolean(),
        }),
        activities_app: yup.object({
            enabled: yup.boolean(),
        }),
        shuttle_app: yup.object({
            enabled: yup.boolean(),
        }),
    })
        .optional()
        .default(undefined),
    delivery_instructions: yup.string().optional(),
    room_numbers: yup.array().of(yup.number()).optional(),
    authorized_users: yup.array().of(authorizedUserValidator).optional().label("Authorized users"),
    created_at: yup.number().optional(),
    updated_at: yup.number().optional(),
});
exports.patchHotelValidator = patchHotelValidator;
const reassignHubs = yup.object().shape({
    hotel_id: yup.string().required(),
    hub_id: yup.string().required(),
    hub_name: yup.string().required(),
});
const deactivateHubInputValidator = yup.object().shape({
    hub_id: yup.string().required(),
    data: yup.array().of(reassignHubs).required(),
});
exports.deactivateHubInputValidator = deactivateHubInputValidator;
const deleteHotelValidator = base_1.deleteEntityValidator;
exports.deleteHotelValidator = deleteHotelValidator;
var WEEK_DAYS;
(function (WEEK_DAYS) {
    WEEK_DAYS["MONDAY"] = "Monday";
    WEEK_DAYS["TUESDAY"] = "Tuesday";
    WEEK_DAYS["WEDNESDAY"] = "Wednesday";
    WEEK_DAYS["THURSDAY"] = "Thursday";
    WEEK_DAYS["FRIDAY"] = "Friday";
    WEEK_DAYS["SATURDAY"] = "Saturday";
    WEEK_DAYS["SUNDAY"] = "Sunday";
})(WEEK_DAYS || (WEEK_DAYS = {}));
exports.WEEK_DAYS = WEEK_DAYS;
/**
 * Event Names
 */
var HOTEL_EVENT;
(function (HOTEL_EVENT) {
    HOTEL_EVENT["CREATED"] = "HOTEL_CREATED";
    HOTEL_EVENT["UPDATED"] = "HOTEL_UPDATED";
    HOTEL_EVENT["OMS_CREATED"] = "OMS_HOTEL_CREATED";
    HOTEL_EVENT["OMS_UPDATED"] = "OMS_HOTEL_UPDATED";
    HOTEL_EVENT["DELETED"] = "HOTEL_DELETED";
    HOTEL_EVENT["UPDATED_INTEGRATION_CONFIGS_SHUTTLE_APP"] = "UPDATED_INTEGRATION_CONFIGS_SHUTTLE_APP";
    HOTEL_EVENT["UPDATED_INTEGRATION_CONFIGS_PMS"] = "UPDATED_INTEGRATION_CONFIGS_PMS";
    HOTEL_EVENT["UPDATED_INTEGRATION_CONFIGS_ACTIVITIES_APP"] = "UPDATED_INTEGRATION_CONFIGS_ACTIVITIES_APP";
    HOTEL_EVENT["UPDATED_INTEGRATION_CONFIGS_MENU_APP"] = "UPDATED_INTEGRATION_CONFIGS_MENU_APP";
    HOTEL_EVENT["UPDATED_INTEGRATION_CONFIGS_VOUCHERS_APP"] = "UPDATED_INTEGRATION_CONFIGS_VOUCHERS_APP";
    HOTEL_EVENT["UPDATED_PAYMENT_SETTINGS"] = "UPDATED_PAYMENT_SETTINGS";
    HOTEL_EVENT["STATUS_CHANGED"] = "HOTEL_STATUS_CHANGED";
    HOTEL_EVENT["MENU_ASSIGNED"] = "HOTEL_MENU_ASSIGNED";
})(HOTEL_EVENT || (HOTEL_EVENT = {}));
exports.HOTEL_EVENT = HOTEL_EVENT;


/***/ }),

/***/ "./libs/shared/network/hub-v2.ts":
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.createHubValidatorV2 = void 0;
const yup = __webpack_require__("yup");
/*
  Validations schemas
 */
const createHubValidator = yup
    .object()
    .shape({
    city_id: yup.string().required("City is a required field!"),
    name: yup.string().required("Name is a required field!"),
    // city
    active: yup.boolean().optional(),
    tax_rate: yup.number().required("Tax is a required field!"),
    // hotel
    contact_phone: yup.string().required("Contact number is a required field!"),
    contact_email: yup.string().required("CSM email is a required field!"),
    address_street: yup.string().required("Address is a required field!"),
    address_number: yup.string().required("Address number is a required field!"),
    address_town: yup.string().required("Country is a required field!"),
    address_zip_code: yup.string().required("Zip code is a required field!"),
    address_coordinates: yup.object().optional().shape({}),
    has_nextmv_enabled: yup.boolean().optional(),
    has_expeditor_app_enabled: yup.boolean().optional(),
})
    .required();
exports.createHubValidatorV2 = createHubValidator;


/***/ }),

/***/ "./libs/shared/network/hub.ts":
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.HUB_EVENT = exports.patchHubValidator = exports.deleteHubValidator = exports.updateHubValidator = exports.createHubValidator = void 0;
const yup = __webpack_require__("yup");
const base_1 = __webpack_require__("./libs/shared/base.ts");
const city_1 = __webpack_require__("./libs/shared/network/city.ts");
const createHubValidator = yup
    .object()
    .shape({
    name: yup.string().required().label("Hub name"),
    primary_contact: base_1.primaryContactValidator.required(),
    address: base_1.addressValidator.required(),
    city_id: yup.string().required(),
    active: yup.boolean().required(),
    tax: yup.object().shape({ percentage: yup.number().required() }).required(),
    coordinates: base_1.coordinatesValidator.optional(),
    integration_configs: yup.object().shape({
        quick_books: yup
            .object({
            class: yup.string(),
        })
            .optional(),
        expeditor_app: yup.object().shape({
            enabled: yup.boolean(),
        }),
        next_move_app: yup.object().shape({
            enabled: yup.boolean(),
        }),
    }),
})
    .required();
exports.createHubValidator = createHubValidator;
const patchHubValidator = yup.object().shape({
    name: yup.string().optional(),
    city_id: yup.string().optional(),
    city: city_1.updateCityValidator.optional().default(undefined),
    address: base_1.addressValidator.optional().default(undefined),
    primary_contact: base_1.primaryContactValidator.optional().default(undefined),
    active: yup.boolean().optional(),
    tax: yup
        .object()
        .shape({
        percentage: yup.number(),
    })
        .optional()
        .default(undefined),
    coordinates: base_1.coordinatesValidator.optional().default(undefined),
    integration_configs: yup
        .object()
        .shape({
        quick_books: yup
            .object()
            .shape({
            class: yup.string(),
        })
            .optional(),
        expeditor_app: yup.object().shape({
            enabled: yup.boolean(),
        }),
        next_move_app: yup.object().shape({
            enabled: yup.boolean(),
        }),
    })
        .optional()
        .default(undefined),
});
exports.patchHubValidator = patchHubValidator;
const updateHubValidator = yup.object().shape({
    name: yup.string().required().label("Hub Name"),
    city_id: yup.string(),
    address: base_1.addressValidator,
    primary_contact: base_1.primaryContactValidator,
    active: yup.boolean(),
    tax: yup.object().shape({ percentage: yup.number() }),
    coordinates: base_1.coordinatesValidator,
    integration_configs: yup.object().shape({
        quick_books: yup
            .object()
            .shape({
            class: yup.string(),
        })
            .optional(),
        expeditor_app: yup.object().shape({
            enabled: yup.boolean(),
        }),
        next_move_app: yup.object().shape({
            enabled: yup.boolean(),
        }),
    }),
});
exports.updateHubValidator = updateHubValidator;
const deleteHubValidator = base_1.deleteEntityValidator;
exports.deleteHubValidator = deleteHubValidator;
var HUB_EVENT;
(function (HUB_EVENT) {
    HUB_EVENT["CREATED"] = "HUB_CREATED";
    HUB_EVENT["UPDATED"] = "HUB_UPDATED";
    HUB_EVENT["OMS_CREATED"] = "OMS_CREATED";
    HUB_EVENT["OMS_UPDATED"] = "OMS_UPDATED";
    HUB_EVENT["DELETED"] = "HUB_DELETED";
    HUB_EVENT["DEACTIVATED"] = "HUB_DEACTIVATED";
})(HUB_EVENT || (HUB_EVENT = {}));
exports.HUB_EVENT = HUB_EVENT;


/***/ }),

/***/ "./libs/shared/network/index.ts":
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
const tslib_1 = __webpack_require__("tslib");
tslib_1.__exportStar(__webpack_require__("./libs/shared/network/city.ts"), exports);
tslib_1.__exportStar(__webpack_require__("./libs/shared/network/hotel.ts"), exports);
tslib_1.__exportStar(__webpack_require__("./libs/shared/network/hub.ts"), exports);
tslib_1.__exportStar(__webpack_require__("./libs/shared/network/hub-v2.ts"), exports);
tslib_1.__exportStar(__webpack_require__("./libs/shared/network/city-v2.ts"), exports);
tslib_1.__exportStar(__webpack_require__("./libs/shared/network/hotel-v2.ts"), exports);
tslib_1.__exportStar(__webpack_require__("./libs/shared/network/base.ts"), exports);


/***/ }),

/***/ "./libs/shared/tenant/app.ts":
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));


/***/ }),

/***/ "./libs/shared/tenant/index.ts":
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
const tslib_1 = __webpack_require__("tslib");
tslib_1.__exportStar(__webpack_require__("./libs/shared/tenant/tenant.ts"), exports);
tslib_1.__exportStar(__webpack_require__("./libs/shared/tenant/app.ts"), exports);


/***/ }),

/***/ "./libs/shared/tenant/tenant.ts":
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));


/***/ }),

/***/ "./libs/shared/utils/apps-definition-local.ts":
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.appsDefinitionLocal = exports.AppEnum = void 0;
var AppEnum;
(function (AppEnum) {
    AppEnum["DASHBOARD"] = "dashboard";
    AppEnum["TENANT"] = "tenant";
    AppEnum["NETWORK"] = "network";
    AppEnum["network"] = "network";
    AppEnum["MENU"] = "menu";
    AppEnum["VOUCHER"] = "voucher";
    AppEnum["IAM"] = "iam";
})(AppEnum || (AppEnum = {}));
exports.AppEnum = AppEnum;
const appsDefinitionLocal = {
    [AppEnum.DASHBOARD]: {
        port: 3331,
        title: "DashboardService",
        description: "Dashboard Service",
    },
    [AppEnum.TENANT]: {
        port: 3332,
        title: "TenantService",
        description: "Tenant Service",
    },
    [AppEnum.NETWORK]: {
        port: 3323,
        title: "Network Service",
        description: "Network Service",
    },
    [AppEnum.NETWORK]: {
        port: 3333,
        title: "Network Service",
        description: "Network Service",
    },
    [AppEnum.MENU]: {
        port: 3222,
        title: "Menu Service",
        description: "Menu Service",
    },
    [AppEnum.VOUCHER]: {
        port: 3335,
        title: "Voucher Service",
        description: "Voucher Service",
    },
    [AppEnum.IAM]: {
        port: 3336,
        title: "IAM Service",
        description: "Identity Access Management Service",
    },
};
exports.appsDefinitionLocal = appsDefinitionLocal;


/***/ }),

/***/ "./libs/shared/utils/error-object-type.ts":
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
;


/***/ }),

/***/ "./libs/shared/utils/general-action-error.ts":
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ENTITY_NOT_FOUND_ERROR = exports.GENERAL_ACTION_ERROR = void 0;
const GENERAL_ACTION_ERROR = (action, entity) => {
    return {
        status: 400,
        message: `Cant ${action.toLowerCase()} ${entity}`,
    };
};
exports.GENERAL_ACTION_ERROR = GENERAL_ACTION_ERROR;
const ENTITY_NOT_FOUND_ERROR = (entity, id) => {
    return {
        status: 404,
        message: `${entity} with ${id} not found`,
    };
};
exports.ENTITY_NOT_FOUND_ERROR = ENTITY_NOT_FOUND_ERROR;


/***/ }),

/***/ "./libs/shared/utils/get-table-name.ts":
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.getTableName = void 0;
const getTableName = (tenantId, tableName = null) => {
    return tableName || `${process.env.TABLE}-${process.env.STAGE}-${tenantId}`;
};
exports.getTableName = getTableName;


/***/ }),

/***/ "./libs/shared/utils/helper.ts":
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.onlyUnique = void 0;
function onlyUnique(value, index, self) {
    return self.indexOf(value) === index;
}
exports.onlyUnique = onlyUnique;


/***/ }),

/***/ "./libs/shared/utils/index.ts":
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
const tslib_1 = __webpack_require__("tslib");
tslib_1.__exportStar(__webpack_require__("./libs/shared/utils/validate.ts"), exports);
tslib_1.__exportStar(__webpack_require__("./libs/shared/utils/general-action-error.ts"), exports);
tslib_1.__exportStar(__webpack_require__("./libs/shared/utils/get-table-name.ts"), exports);
tslib_1.__exportStar(__webpack_require__("./libs/shared/utils/logger.ts"), exports);
tslib_1.__exportStar(__webpack_require__("./libs/shared/utils/apps-definition-local.ts"), exports);
tslib_1.__exportStar(__webpack_require__("./libs/shared/utils/step-function.ts"), exports);
tslib_1.__exportStar(__webpack_require__("./libs/shared/utils/error-object-type.ts"), exports);
tslib_1.__exportStar(__webpack_require__("./libs/shared/utils/sleep.ts"), exports);
tslib_1.__exportStar(__webpack_require__("./libs/shared/utils/helper.ts"), exports);


/***/ }),

/***/ "./libs/shared/utils/logger.ts":
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.logger = void 0;
const logger = (service) => {
    function log(...args) {
        console.log(service);
        console.info(...args);
    }
    return {
        log,
    };
};
exports.logger = logger;


/***/ }),

/***/ "./libs/shared/utils/sleep.ts":
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.sleep = void 0;
function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
exports.sleep = sleep;
;


/***/ }),

/***/ "./libs/shared/utils/step-function.ts":
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.StepFunctionStatus = void 0;
var StepFunctionStatus;
(function (StepFunctionStatus) {
    StepFunctionStatus["SUCCESS"] = "SUCCEEDED";
    StepFunctionStatus["FAILURE"] = "FAILED";
})(StepFunctionStatus = exports.StepFunctionStatus || (exports.StepFunctionStatus = {}));


/***/ }),

/***/ "./libs/shared/utils/validate.ts":
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.validate = void 0;
const validate = (validationOb, input) => {
    try {
        validationOb.validateSync(input, { abortEarly: true, strict: true });
    }
    catch (err) {
        const { name, type, errors } = err;
        console.log('validation-error: ', err);
        throw { errors, type, name, httpCode: 422 };
    }
};
exports.validate = validate;


/***/ }),

/***/ "./libs/shared/voucher/code.ts":
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.CodeStatus = void 0;
var CodeStatus;
(function (CodeStatus) {
    CodeStatus["PENDING"] = "PENDING";
    CodeStatus["REDEEMED"] = "REDEEMED";
})(CodeStatus = exports.CodeStatus || (exports.CodeStatus = {}));


/***/ }),

/***/ "./libs/shared/voucher/constants.ts":
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.HOTEL_PORTAL_URL = exports.ROLE = void 0;
const ROLE = {
    HOTEL_PARTNER: process.env.HOTEL_PARTNER_ROLE || process.env.NX_HOTEL_PARTNER_ROLE,
    SUPER_ADMIN: process.env.SUPER_ADMIN_ROLE || process.env.NX_SUPER_ADMIN_ROLE,
};
exports.ROLE = ROLE;
const HOTEL_PORTAL_URL = "https://dev.partners.butlerhospitality.com/?token=lhi6bZXSzNsx0vIXPy4rhb-_IWJRzurG9AWqYiqnPwceNAC0Aws9Bfz8d5sk1RgJI4d4NpfPLWXmV8kixVDKhjJBGXa9oOaH2ia9LVd3vE_nVb9JntQrOLt2RQ7hOQ7oVLogBQ&email=admin@butlerhospitality.com&isAdmin=true&hotel_id=";
exports.HOTEL_PORTAL_URL = HOTEL_PORTAL_URL;


/***/ }),

/***/ "./libs/shared/voucher/hotel-program-v2.ts":
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));


/***/ }),

/***/ "./libs/shared/voucher/hotel-program.ts":
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));


/***/ }),

/***/ "./libs/shared/voucher/index.ts":
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
const tslib_1 = __webpack_require__("tslib");
tslib_1.__exportStar(__webpack_require__("./libs/shared/voucher/constants.ts"), exports);
tslib_1.__exportStar(__webpack_require__("./libs/shared/voucher/program.ts"), exports);
tslib_1.__exportStar(__webpack_require__("./libs/shared/voucher/code.ts"), exports);
tslib_1.__exportStar(__webpack_require__("./libs/shared/voucher/hotel-program.ts"), exports);
tslib_1.__exportStar(__webpack_require__("./libs/shared/voucher/hotel-program-v2.ts"), exports);


/***/ }),

/***/ "./libs/shared/voucher/program.ts":
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.CODE_EVENT = exports.PROGRAM_EVENT = exports.updateProgramDetailsValidatorUI = exports.createVoucherValidator = exports.resendCodesValidator = exports.generateVoucherValidator = exports.baseGenerateVoucherValidator = exports.updateVoucherProgramValidator = exports.createVoucherProgramValidator = exports.updatePerdiemRuleValidator = exports.perdiemRuleValidator = exports.updatePrefixeRuleValidator = exports.prefixeRuleValidator = exports.updateDiscountRuleValidator = exports.discountRuleValidator = exports.updateBaseVoucherValidator = exports.createBaseVoucherValidator = exports.VoucherProgramStatus = exports.VoucherTypeLower = exports.VoucherType = exports.PaymentType = exports.VoucherPayer = void 0;
const yup = __webpack_require__("yup");
var VoucherPayer;
(function (VoucherPayer) {
    VoucherPayer["BUTLER"] = "BUTLER";
    VoucherPayer["HOTEL"] = "HOTEL";
})(VoucherPayer = exports.VoucherPayer || (exports.VoucherPayer = {}));
var PaymentType;
(function (PaymentType) {
    PaymentType["PERCENTAGE"] = "PERCENTAGE";
    PaymentType["AMOUNT"] = "AMOUNT";
})(PaymentType = exports.PaymentType || (exports.PaymentType = {}));
var VoucherType;
(function (VoucherType) {
    VoucherType["DISCOUNT"] = "DISCOUNT";
    VoucherType["PER_DIEM"] = "PER_DIEM";
    VoucherType["PRE_FIXE"] = "PRE_FIXE";
})(VoucherType = exports.VoucherType || (exports.VoucherType = {}));
var VoucherTypeLower;
(function (VoucherTypeLower) {
    VoucherTypeLower["DISCOUNT"] = "Discount";
    VoucherTypeLower["PER_DIEM"] = "Per Diem";
    VoucherTypeLower["PRE_FIXE"] = "Pre Fixe";
})(VoucherTypeLower = exports.VoucherTypeLower || (exports.VoucherTypeLower = {}));
var VoucherProgramStatus;
(function (VoucherProgramStatus) {
    VoucherProgramStatus["ACTIVE"] = "Active";
    VoucherProgramStatus["INACTIVE"] = "Inactive";
})(VoucherProgramStatus = exports.VoucherProgramStatus || (exports.VoucherProgramStatus = {}));
// type DeleteVoucherProgramInput = DeleteEntityInput
exports.createBaseVoucherValidator = yup
    .object()
    .shape({
    amount: yup
        .number()
        .when("payment_type", {
        is: PaymentType.PERCENTAGE,
        then: yup
            .number()
            .transform((value) => (isNaN(value) ? undefined : value))
            .min(0)
            .max(100),
        otherwise: yup
            .number()
            .transform((value) => (isNaN(value) ? undefined : value))
            .positive(),
    })
        .required()
        .label("Amount"),
})
    .unknown(false);
exports.updateBaseVoucherValidator = yup
    .object()
    .shape({
    amount: yup
        .number()
        .when("payment_type", {
        is: PaymentType.PERCENTAGE,
        then: yup
            .number()
            .transform((value) => (isNaN(value) ? undefined : value))
            .min(0)
            .max(100),
        otherwise: yup
            .number()
            .transform((value) => (isNaN(value) ? undefined : value))
            .positive(),
    })
        .optional()
        .label("Amount"),
})
    .unknown(false);
exports.discountRuleValidator = exports.createBaseVoucherValidator.concat(yup.object().shape({
    payment_type: yup.string().oneOf(Object.values(PaymentType)).required().label("Payment type"),
}));
exports.updateDiscountRuleValidator = exports.updateBaseVoucherValidator.concat(yup.object().shape({
    payment_type: yup.string().oneOf(Object.values(PaymentType)).optional().label("Payment type"),
}));
exports.prefixeRuleValidator = exports.createBaseVoucherValidator.concat(yup.object().shape({
    configs: yup
        .array()
        .of(yup.object().shape({
        subcategories: yup.mixed().optional(),
        quantity: yup
            .number()
            .transform((value) => (isNaN(value) ? undefined : value))
            .positive()
            .integer()
            .required()
            .label("Quantity"),
        price_limit: yup
            .number()
            .transform((value) => (isNaN(value) ? undefined : value))
            .positive()
            .required()
            .label("Price limit"),
    }))
        .required(),
}));
exports.updatePrefixeRuleValidator = exports.updateBaseVoucherValidator.concat(yup.object().shape({
    configs: yup
        .array()
        .of(yup.object().shape({
        subcategories: yup.mixed().optional(),
        quantity: yup
            .number()
            .transform((value) => (isNaN(value) ? undefined : value))
            .positive()
            .integer()
            .optional()
            .label("Quantity"),
        price_limit: yup
            .number()
            .transform((value) => (isNaN(value) ? undefined : value))
            .positive()
            .optional()
            .label("Price limit"),
    }))
        .optional(),
}));
exports.perdiemRuleValidator = exports.createBaseVoucherValidator;
exports.updatePerdiemRuleValidator = exports.updateBaseVoucherValidator;
exports.createVoucherProgramValidator = exports.createBaseVoucherValidator.concat(yup.object().shape({
    type: yup.mixed().oneOf(Object.values(VoucherType)).required().label("Voucher type"),
    name: yup.string().trim().required().label("Voucher name"),
    code_limit: yup
        .number()
        .transform((value) => (isNaN(value) ? undefined : value))
        .positive()
        .integer()
        .required()
        .label("Code limit"),
    notes: yup.string().trim().optional().label("Notes"),
    payer: yup.mixed().oneOf(Object.values(VoucherPayer)).required().label("Payer"),
    payer_percentage: yup
        .number()
        .transform((value) => (isNaN(value) ? undefined : value))
        .positive()
        .min(0)
        .max(100)
        .required()
        .label("Payer percentage"),
    hotel_id: yup.string().required().label("Hotel"),
}));
exports.updateVoucherProgramValidator = exports.updateBaseVoucherValidator.concat(yup.object().shape({
    type: yup.mixed().oneOf(Object.values(VoucherType)).optional().label("Voucher type"),
    name: yup.string().trim().optional().label("Voucher name"),
    code_limit: yup
        .number()
        .transform((value) => (isNaN(value) ? undefined : value))
        .positive()
        .integer()
        .optional()
        .label("Code limit"),
    notes: yup.string().trim().optional().label("Notes"),
    payer: yup.mixed().oneOf(Object.values(VoucherPayer)).optional().label("Payer"),
    payer_percentage: yup
        .number()
        .transform((value) => (isNaN(value) ? undefined : value))
        .positive()
        .min(0)
        .max(100)
        .optional()
        .label("Payer percentage"),
}));
exports.baseGenerateVoucherValidator = yup.object().shape({
    numberOfCodes: yup
        .number()
        .transform((value) => (isNaN(value) ? undefined : value))
        .positive()
        .required()
        .label("Number of codes"),
});
exports.generateVoucherValidator = exports.baseGenerateVoucherValidator.concat(yup.object().shape({
    email: yup.string().email().trim().required().label("Email"),
}));
exports.resendCodesValidator = yup.object().shape({
    userEmail: yup.string().email().trim().required().label("Email"),
});
exports.createVoucherValidator = yup.lazy(({ type }) => {
    switch (type) {
        case VoucherType.DISCOUNT:
            return exports.createVoucherProgramValidator.concat(exports.discountRuleValidator);
        case VoucherType.PER_DIEM:
            return exports.createVoucherProgramValidator.concat(exports.perdiemRuleValidator);
        case VoucherType.PRE_FIXE:
            return exports.createVoucherProgramValidator.concat(exports.prefixeRuleValidator);
        default:
            return exports.createVoucherProgramValidator;
    }
});
exports.updateProgramDetailsValidatorUI = yup.object().shape({
    name: yup.string().trim().required().label("Voucher name"),
    code_limit: yup
        .number()
        .transform((value) => (isNaN(value) ? undefined : value))
        .positive()
        .integer()
        .required()
        .label("Code limit"),
    notes: yup.string().trim().optional().label("Notes"),
    payer: yup.mixed().oneOf(Object.values(VoucherPayer)).required().label("Payer"),
    payer_percentage: yup
        .number()
        .transform((value) => (isNaN(value) ? undefined : value))
        .positive()
        .min(0)
        .max(100)
        .required()
        .label("Payer percentage"),
});
var PROGRAM_EVENT;
(function (PROGRAM_EVENT) {
    PROGRAM_EVENT["CREATED"] = "PROGRAM_CREATED";
    PROGRAM_EVENT["UPDATED"] = "PROGRAM_UPDATED";
    PROGRAM_EVENT["DELETED"] = "PROGRAM_DELETED";
    PROGRAM_EVENT["STATUS_CHANGED"] = "HOTEL_STATUS_CHANGED";
})(PROGRAM_EVENT = exports.PROGRAM_EVENT || (exports.PROGRAM_EVENT = {}));
var CODE_EVENT;
(function (CODE_EVENT) {
    CODE_EVENT["CREATED"] = "CODE_CREATED";
    CODE_EVENT["DELETED"] = "CODE_DELETED";
    CODE_EVENT["BULK_CREATED"] = "CODE_BULK_CREATED";
    CODE_EVENT["BULK_DELETED"] = "CODE_BULK_DELETED";
})(CODE_EVENT = exports.CODE_EVENT || (exports.CODE_EVENT = {}));


/***/ }),

/***/ "@aws-sdk/client-dynamodb":
/***/ ((module) => {

module.exports = require("@aws-sdk/client-dynamodb");

/***/ }),

/***/ "@aws-sdk/client-s3":
/***/ ((module) => {

module.exports = require("@aws-sdk/client-s3");

/***/ }),

/***/ "@aws-sdk/client-sns":
/***/ ((module) => {

module.exports = require("@aws-sdk/client-sns");

/***/ }),

/***/ "@aws-sdk/lib-dynamodb":
/***/ ((module) => {

module.exports = require("@aws-sdk/lib-dynamodb");

/***/ }),

/***/ "@aws-sdk/s3-request-presigner":
/***/ ((module) => {

module.exports = require("@aws-sdk/s3-request-presigner");

/***/ }),

/***/ "@aws-sdk/util-dynamodb":
/***/ ((module) => {

module.exports = require("@aws-sdk/util-dynamodb");

/***/ }),

/***/ "@mikro-orm/core":
/***/ ((module) => {

module.exports = require("@mikro-orm/core");

/***/ }),

/***/ "aws-sdk":
/***/ ((module) => {

module.exports = require("aws-sdk");

/***/ }),

/***/ "body-parser":
/***/ ((module) => {

module.exports = require("body-parser");

/***/ }),

/***/ "class-transformer":
/***/ ((module) => {

module.exports = require("class-transformer");

/***/ }),

/***/ "class-validator":
/***/ ((module) => {

module.exports = require("class-validator");

/***/ }),

/***/ "cors":
/***/ ((module) => {

module.exports = require("cors");

/***/ }),

/***/ "express":
/***/ ((module) => {

module.exports = require("express");

/***/ }),

/***/ "jsonwebtoken":
/***/ ((module) => {

module.exports = require("jsonwebtoken");

/***/ }),

/***/ "jwk-to-pem":
/***/ ((module) => {

module.exports = require("jwk-to-pem");

/***/ }),

/***/ "libphonenumber-js":
/***/ ((module) => {

module.exports = require("libphonenumber-js");

/***/ }),

/***/ "lodash":
/***/ ((module) => {

module.exports = require("lodash");

/***/ }),

/***/ "pg":
/***/ ((module) => {

module.exports = require("pg");

/***/ }),

/***/ "redis":
/***/ ((module) => {

module.exports = require("redis");

/***/ }),

/***/ "serverless-http":
/***/ ((module) => {

module.exports = require("serverless-http");

/***/ }),

/***/ "tslib":
/***/ ((module) => {

module.exports = require("tslib");

/***/ }),

/***/ "uuid":
/***/ ((module) => {

module.exports = require("uuid");

/***/ }),

/***/ "yup":
/***/ ((module) => {

module.exports = require("yup");

/***/ }),

/***/ "https":
/***/ ((module) => {

module.exports = require("https");

/***/ }),

/***/ "path":
/***/ ((module) => {

module.exports = require("path");

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
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module used 'module' so it can't be inlined
/******/ 	var __webpack_exports__ = __webpack_require__("./apps/service-dashboard/main.ts");
/******/ 	var __webpack_export_target__ = exports;
/******/ 	for(var i in __webpack_exports__) __webpack_export_target__[i] = __webpack_exports__[i];
/******/ 	if(__webpack_exports__.__esModule) Object.defineProperty(__webpack_export_target__, "__esModule", { value: true });
/******/ 	
/******/ })()
;
//# sourceMappingURL=main.js.map