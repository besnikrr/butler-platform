
import * as express from "express";
import {
  expressLocal, errorHandler, dbctxInjector, eventsLocal, up, down
} from "@butlerhospitality/service-sdk";
import * as cors from "cors";
import * as bodyParser from "body-parser";
import * as serverless from "serverless-http";

// Routes
import { AppEnum, lambdaWarmupWrapper } from "@butlerhospitality/shared";
import programrouter from "./program/route";
import hotelrouter from "./hotel/route";
import categoryrouter from "./category/route";
import coderouter from "./code/route";

// Listeners
import voucherOnHubAction from "./listeners/voucher-on-hub-action";
import voucherOnHotelAction from "./listeners/voucher-on-hotel-action";
import voucherOnCategoryAction from "./listeners/voucher-on-category-action";
import voucherOnMenuAssignAction from "./listeners/voucher-on-menu-assign-action";
import { VoucherEntities } from "./entities";

const app = express();
const jsonParser = bodyParser.json();

app.use(dbctxInjector({
  servicedb: process.env.DB,
  entities: VoucherEntities.asArray(),
  service: AppEnum.VOUCHER,
  subscribers: []
}));
app.use(cors());
app.use(jsonParser);
app.use(programrouter);
app.use(hotelrouter);
app.use(categoryrouter);
app.use("/api/voucher", coderouter);
app.use(errorHandler);

if (process.env.STAGE === "local") {
  expressLocal(app, AppEnum.VOUCHER);
  eventsLocal({
    ServiceNetworkHubTopic: [voucherOnHubAction],
    ServiceNetworkHotelTopic: [voucherOnHotelAction],
    ServiceMenuCategoryTopic: [voucherOnCategoryAction],
    ServiceMenuMenuTopic: [voucherOnMenuAssignAction]
  });
}

module.exports.handler = serverless(app);

module.exports.up = up;
module.exports.down = down;
module.exports.voucherHubOnNetworkHubAction = lambdaWarmupWrapper(voucherOnHubAction);
module.exports.voucherHotelOnNetworkHotelAction = lambdaWarmupWrapper(voucherOnHotelAction);
module.exports.voucherCategoryOnMenuCategoryAction = lambdaWarmupWrapper(voucherOnCategoryAction);
module.exports.voucherHotelOnMenuAssignAction = lambdaWarmupWrapper(voucherOnMenuAssignAction);

