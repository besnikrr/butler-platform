import * as express from "express";
import * as cors from "cors";
import * as bodyParser from "body-parser";
import * as serverless from "serverless-http";
import {
  dbctxInjector,
  down,
  errorHandler,
  eventsLocal,
  expressLocal,
  up
} from "@butlerhospitality/service-sdk";
import { AppEnum, lambdaWarmupWrapper } from "@butlerhospitality/shared";

import networkUserOnIamUserAction from "./listeners/network-on-iam-user-action";
import networkMenuOnMenuMenuAction from "./listeners/network-on-menu-action";
import hubRouter from "./hub/route";
import hotelRouter from "./hotel/route";
import cityRouter from "./city/route";
import userRouter from "./user/route";
import { NetworkEntities } from "./entities";

const app = express();
const jsonParser = bodyParser.json();

app.use(
  dbctxInjector({
    servicedb: process.env.DB,
    entities: NetworkEntities.asArray(),
    service: AppEnum.NETWORK,
    subscribers: []
  })
);
app.use(cors());
app.use(jsonParser);

app.use("/api/network/hubs", hubRouter);
app.use("/api/network/hotels", hotelRouter);
app.use("/api/network/cities", cityRouter);
app.use("/api/network/users", userRouter);

app.use(errorHandler);

if (process.env.STAGE === "local") {
  expressLocal(app, AppEnum.NETWORK);
  eventsLocal({
    ServiceIamUserTopic: [networkUserOnIamUserAction],
    ServiceMenuMenuTopic: [networkMenuOnMenuMenuAction]
  });
}

module.exports.handler = serverless(app);

module.exports.up = up;
module.exports.down = down;
module.exports.networkUserOnIamUserAction = lambdaWarmupWrapper(networkUserOnIamUserAction);
module.exports.networkMenuOnMenuMenuAction = lambdaWarmupWrapper(networkMenuOnMenuMenuAction);

