import * as express from "express";
import * as bodyParser from "body-parser";
import * as cors from "cors";
import * as serverless from "serverless-http";
import {
  up,
  down,
  expressLocal,
  eventsLocal,
  errorHandler,
  dbctxInjector,
  SoftDeleteSubscriber
} from "@butlerhospitality/service-sdk";
import { AppEnum, lambdaWarmupWrapper } from "@butlerhospitality/shared";
import discountRouter from "./discount/route";
import hubRouter from "./hub/route";
import entities from "./utils/entities";
import { discountHubOnNetworkHubAction } from "./listeners";

export const app = express();
const jsonParser = bodyParser.json();

app.use(dbctxInjector({
  servicedb: process.env.DB,
  entities: entities,
  service: AppEnum.DISCOUNT,
  subscribers: [new SoftDeleteSubscriber()]
}));

app.use(cors());
app.use(jsonParser);

app.use(discountRouter);
app.use(hubRouter);
app.use(errorHandler);

if (process.env.STAGE === "local") {
  expressLocal(app, AppEnum.DISCOUNT);
  eventsLocal({
    ServiceNetworkHubTopic: [discountHubOnNetworkHubAction]
  });
}

module.exports.handler = serverless(app);
module.exports.up = up;
module.exports.down = down;
module.exports.discountHubOnNetworkHubAction = lambdaWarmupWrapper(discountHubOnNetworkHubAction);
