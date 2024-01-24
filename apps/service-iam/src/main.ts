import * as express from "express";
import * as serverless from "serverless-http";
import {
  expressLocal, errorHandler, dbctxInjector, up, down, contextInjector
} from "@butlerhospitality/service-sdk";
import * as cors from "cors";
import * as bodyParser from "body-parser";

import { AppEnum } from "@butlerhospitality/shared";
import userRouter from "./user/route";
import roleRouter from "./role/route";
import permissionGroupRouter from "./permission-group/route";
import appRouter from "./app/route";

import { IAMEntities } from "./entities";

const jsonParser = bodyParser.json();
const app = express();
app.use(jsonParser);
app.use(cors());
app.use(contextInjector);
app.use(dbctxInjector({
  servicedb: process.env.DB,
  entities: IAMEntities.asArray(),
  service: AppEnum.IAM,
  subscribers: []
}));

app.use("/api/iam/users", userRouter);
app.use("/api/iam/apps", appRouter);
app.use("/api/iam/roles", roleRouter);
app.use("/api/iam/permissiongroups", permissionGroupRouter);

app.use(errorHandler);

if (process.env.STAGE === "local") {
  expressLocal(app, AppEnum.IAM);
}

module.exports = {
  up,
  down,
  handler: serverless(app)
};
