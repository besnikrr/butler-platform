import * as express from "express";
import * as cors from "cors";
import * as bodyParser from "body-parser";
import * as serverless from "serverless-http";
import {
  errorHandler,
  eventsLocal,
  expressLocal
} from "@butlerhospitality/service-sdk";
import { AppEnum } from "@butlerhospitality/shared";
import tenantRouter from "./tenant/route";

const app = express();
const jsonParser = bodyParser.json();

app.use(cors());
app.use(jsonParser);

app.use(tenantRouter);
app.use(errorHandler);

if (process.env.STAGE === "local") {
  expressLocal(app, AppEnum.TENANT);
  eventsLocal({});
}

module.exports.handler = serverless(app);
