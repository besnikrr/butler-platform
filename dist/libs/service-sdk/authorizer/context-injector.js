"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.contextInjector = exports.dbctxInjector = void 0;
const tslib_1 = require("tslib");
const shared_1 = require("@butlerhospitality/shared");
const connection_1 = require("../db-provider/postgres/connection");
const passthrough_1 = require("./validators/passthrough");
const authorizer_1 = require("./authorizer");
const logger_1 = require("../logger");
const dbctxInjector = (dep) => {
    const { servicedb, entities, service, subscribers } = dep;
    return (req, res, next) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
        var _a, _b;
        if (((_b = (_a = req === null || req === void 0 ? void 0 : req.apiGateway) === null || _a === void 0 ? void 0 : _a.event) === null || _b === void 0 ? void 0 : _b.source) === shared_1.warmupkey) {
            logger_1.logger.log("WarmUP - Lambda is warm!");
            return;
        }
        try {
            const origin = authorizer_1.getOrigin(req);
            const { conn, repositories } = yield connection_1.getConnection({
                tenant: origin,
                dbname: servicedb,
                entities,
                pooling: true,
                service,
                subscribers
            });
            req.conn = conn;
            req.repositories = repositories;
            req.tenant = origin;
            return next();
        }
        catch (err) {
            logger_1.logger.log("dbctx-injector-error: ", err);
            res.status(500).json({
                status: 500,
                message: "Connection could not be established"
            });
        }
    });
};
exports.dbctxInjector = dbctxInjector;
const contextInjector = (req, res, next) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d;
    logger_1.logger.log("context-injector-warmup-event: ", (_b = (_a = req === null || req === void 0 ? void 0 : req.apiGateway) === null || _a === void 0 ? void 0 : _a.event) === null || _b === void 0 ? void 0 : _b.source);
    if (((_d = (_c = req === null || req === void 0 ? void 0 : req.apiGateway) === null || _c === void 0 ? void 0 : _c.event) === null || _d === void 0 ? void 0 : _d.source) === shared_1.warmupkey) {
        logger_1.logger.log("WarmUP - Lambda is warm!");
        return;
    }
    try {
        if (passthrough_1.isExempt(req.path)) {
            return next();
        }
        const requestContext = req.requestContext || createRequestContext(req);
        requestContext.authorizer = requestContext.authorizer || (yield authorize(createEvent(req, requestContext)));
        req.actionContext = createActionContext(requestContext);
        logger_1.logger.log("LOGGER HERE");
        return next();
    }
    catch (err) {
        logger_1.logger.log({ err });
        res.status(403).json({
            status: 403,
            message: err.message
        });
    }
});
exports.contextInjector = contextInjector;
const createActionContext = (requestContext) => {
    const tenant = JSON.parse(requestContext.authorizer.tenant || requestContext.authorizer.context.tenant);
    const userDetails = requestContext.authorizer.user || requestContext.authorizer.context.user;
    return {
        tenant,
        authorizedUser: typeof userDetails === "string" ? JSON.parse(userDetails) : userDetails
    };
};
const createRequestContext = (req) => {
    return {
        accountId: "",
        apiId: "",
        httpMethod: req.method.toUpperCase(),
        identity: undefined,
        path: req.path,
        protocol: "",
        requestId: "",
        requestTimeEpoch: 0,
        resourceId: "",
        resourcePath: "",
        stage: "",
        authorizer: undefined
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
        resource: "",
        stageVariables: undefined,
        body: req.body
    };
};
const authorize = (event) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    if (process.env.STAGE === "local") {
        try {
            const data = yield authorizer_1.handler(event);
            if (data.context && data.context.deny) {
                throw new Error("Permission denied");
            }
            return data;
        }
        catch (e) {
            logger_1.logger.log("[local-authorizer-error]: ", e);
            throw new Error("Permission denied");
        }
    }
});
//# sourceMappingURL=context-injector.js.map