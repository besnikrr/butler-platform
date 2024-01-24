import * as express from "express";
import {
  up, down, expressLocal, eventsLocal,
  errorHandler, dbctxInjector
} from "@butlerhospitality/service-sdk";
import * as bodyParser from "body-parser";
import * as cors from "cors";
import * as serverless from "serverless-http";
import { AppEnum, lambdaWarmupWrapper } from "@butlerhospitality/shared";
import categoryRouter from "./category/route";
import productRouter from "./product/route";
import menuRouter from "./menu/route";
import modifierRouter from "./modifier/route";
import hotelRouter from "./hotel/route";
import hubRouter from "./hub/route";
import labelRouter from "./label/route";

import {
  returnProductsBackInStock
} from "./product/usecases/return-product-back-in-stock";
import {
  menuHotelOnNetworkHotelAction, menuHubOnNetworkHubAction
} from "./listeners";
import { MenuEntities } from "./entities";

const app = express();
const jsonParser = bodyParser.json();

app.use(dbctxInjector({
  servicedb: process.env.DB,
  entities: MenuEntities.asArray(),
  service: AppEnum.MENU,
  subscribers: []
}));
app.use(cors());
app.use(jsonParser);
app.use(hotelRouter);
app.use(categoryRouter);
app.use(productRouter);
app.use(modifierRouter); // issue if set below menurouter idk why
app.use(labelRouter); // list labels gets mixed with get menu by id when set below menu router
app.use(menuRouter);
app.use(hubRouter);
app.use(categoryRouter);

app.use(errorHandler);

if (process.env.STAGE === "local") {
  expressLocal(app, AppEnum.MENU);
  eventsLocal({
    ServiceNetworkHotelTopic: [menuHotelOnNetworkHotelAction],
    ServiceNetworkHubTopic: [menuHubOnNetworkHubAction]
  });
}

module.exports.handler = serverless(app);

module.exports.up = up;
module.exports.down = down;
module.exports.menuHubOnNetworkHubAction = lambdaWarmupWrapper(menuHubOnNetworkHubAction);
module.exports.menuHotelOnNetworkHotelAction = lambdaWarmupWrapper(menuHotelOnNetworkHotelAction);
module.exports.returnProductsBackInStock = returnProductsBackInStock;

