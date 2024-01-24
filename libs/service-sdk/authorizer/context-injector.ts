import { ActionContext, AppEnum, warmupkey } from "@butlerhospitality/shared";
import { EventSubscriber, MikroORM } from "@mikro-orm/core";
import * as express from "express";
import { AnyEntity, EntityClass } from "@mikro-orm/core/typings";
import { getConnection } from "../db-provider/postgres/connection";
import { isExempt } from "./validators/passthrough";
import { getOrigin, handler } from "./authorizer";
import { logger } from "../logger";

export interface ActionRequest extends express.Request {
  conn: MikroORM;
  repositories: { [key: string]: any };
  actionContext?: any;
  apiGateway?: any;
  isValid: boolean;
  tenant: string;
}

export interface IDbctxInjectorInput {
  servicedb: string;
  entities: EntityClass<AnyEntity>[];
  service: AppEnum;
  subscribers: EventSubscriber<AnyEntity>[];
}

export const dbctxInjector = (dep: IDbctxInjectorInput) => {
  const {
    servicedb, entities, service, subscribers
  } = dep;

  return async (req: ActionRequest, res: any, next: any) => {
    if (req?.apiGateway?.event?.source === warmupkey) {
      logger.log("WarmUP - Lambda is warm!");
      return;
    }
    try {
      const origin = getOrigin(req);
      const { conn, repositories } = await getConnection({
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
    } catch (err) {
      logger.log("dbctx-injector-error: ", err);
      res.status(500).json({
        status: 500,
        message: "Connection could not be established"
      });
    }
  };
};

const contextInjector = async (req: any, res: any, next: any) => {
  logger.log("context-injector-warmup-event: ", req?.apiGateway?.event?.source);
  if (req?.apiGateway?.event?.source === warmupkey) {
    logger.log("WarmUP - Lambda is warm!");
    return;
  }
  try {
    if (isExempt(req.path)) {
      return next();
    }

    const requestContext = req.requestContext || createRequestContext(req);
    requestContext.authorizer = requestContext.authorizer || (await authorize(createEvent(req, requestContext)));
    req.actionContext = createActionContext(requestContext);
    logger.log("LOGGER HERE");
    return next();
  } catch (err) {
    logger.log({ err });
    res.status(403).json({
      status: 403,
      message: err.message
    });
  }
};

const createActionContext = (requestContext): ActionContext => {
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

const authorize = async (event: any) => {
  if (process.env.STAGE === "local") {
    try {
      const data = await handler(event);
      if (data.context && data.context.deny) {
        throw new Error("Permission denied");
      }
      return data;
    } catch (e) {
      logger.log("[local-authorizer-error]: ", e);
      throw new Error("Permission denied");
    }
  }
};

export { contextInjector };
