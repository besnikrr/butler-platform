import * as express from "express";
import {
  up,
  down,
  expressLocal,
  eventsLocal,
  errorHandler,
  dbctxInjector,
  SoftDeleteSubscriber,
  getWebSocketService,
  contextInjector
} from "@butlerhospitality/service-sdk";
import { AppEnum } from "@butlerhospitality/shared";
import * as bodyParser from "body-parser";
import * as cors from "cors";
import * as serverless from "serverless-http";
import orderRouter from "./order/route";
import paymentRouter from "./payment/route";
import entitiesArray from "./utils/entities";
import { OrderSubscriber } from "./order/entity";
import { PaymentSubscriber } from "./payment/entity";
import { WebSocketProvider } from "libs/service-sdk/sockets/interfaces";

export const app = express();
const jsonParser = bodyParser.json();

app.use(cors());
app.use(jsonParser);

app.use(dbctxInjector({
  servicedb: process.env.DB,
  entities: entitiesArray,
  service: AppEnum.ORDER,
  subscribers: [new OrderSubscriber(), new PaymentSubscriber(), new SoftDeleteSubscriber()]
}));

app.use(contextInjector);

app.use(orderRouter);
app.use(paymentRouter);
app.use(errorHandler);

if (process.env.STAGE === "local") {
  expressLocal(app, AppEnum.ORDER);
  eventsLocal({
    ServiceOrderTopic: []
  });
}
const socketService = getWebSocketService(WebSocketProvider.APIGATEWAY);

module.exports.handler = serverless(app);

module.exports.connect = async (event) => {
  return socketService.connect(event);
};

module.exports.disconnect = async (event) => {
  return socketService.disconnect(event);
};

module.exports.up = up;
module.exports.down = down;
