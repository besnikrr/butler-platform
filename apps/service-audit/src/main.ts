import { up, down, eventsLocal } from "@butlerhospitality/service-sdk";
import Logger from "./logger";
import { getPostgresConnection, parseRedisRequest, parseSQSRequest } from "./util";

const log = async (event: any) => {
  if (process.env.STAGE !== "local") {
    console.log("event", event);
  }

  let logger: Logger;

  try {
    const connection = await getPostgresConnection();
    logger = new Logger(connection);
  } catch (error) {
    console.error("Could not connect to audit database.", error);
    throw error;
  }

  const messages = process.env.STAGE === "local" ? parseRedisRequest(event) : parseSQSRequest(event);

  for (const message of messages) {
    const topic = message.topic;
    const service = message.service;
    const entityID = message.data.id;
    const entityTable = message.data.entity;

    try {
      await logger.logRecord(entityID, entityTable, service, topic, message.data, message.context);
    } catch (error) {
      console.error("Could not log platform record. ", error);
    }
  }
};

(async () => {
  if (process.env.STAGE === "local") {
    eventsLocal({
      ServiceNetworkCityTopic: [log],
      ServiceNetworkHubTopic: [log],
      ServiceNetworkHotelTopic: [log],
      ServiceMenuCategoryTopic: [log],
      ServiceMenuModifierTopic: [log],
      ServiceMenuProductTopic: [log],
      ServiceMenuMenuTopic: [log],
      ServiceVoucherProgramTopic: [log]
    });
  }
})();

module.exports.log = log;
module.exports.up = up;
module.exports.down = down;
