import Analytics = require("analytics-node");
import { logger } from "../logger";

interface IAnalyticsBase {
  userId: string;
}

interface IIdentify extends IAnalyticsBase {
  traits: object;
}

interface ITrack extends IAnalyticsBase {
  event: string;
  properties: object;
}

interface IPage extends IAnalyticsBase {
  name: string;
  properties: object;
}

const createAnalyticsClient = (key: string) => {
  const stage = process.env.STAGE;

  switch (stage) {
  case "dev":
  case "development":
  case "staging":
  case "prod":
  case "production":
    return new Analytics(key);
  default:
    return {
      identify: (data: IIdentify) => {
        logger.log("Segment identify local: ", data);
        return data;
      },
      track: (data: ITrack) => {
        logger.log("Segment track local: ", data);
        return data;
      },
      page: (data: IPage) => {
        logger.log("Segment page local: ", data);
        return data;
      }
    };
  }
};

export const SegmentProvider = () => {
  const client = createAnalyticsClient("homOA2Mvwh1tYM3ZGAyLQ28OB4DIe0Y0");

  const identify = async (userId: string, traits: object): Promise<void> => {
    return new Promise<void>((resolve, reject) => {
      client.identify({
        userId,
        traits
      }, (err: Error) => {
        if (err) {
          logger.error("An error happened while using segment identify: ", err);
          return reject(err);
        }
      });

      resolve();
    });
  };

  const track = async (event: string, userId: string, properties: object) => {
    return new Promise<void>((resolve, reject) => {
      client.track({
        userId,
        event,
        properties
      }, (err: Error) => {
        if (err) {
          logger.error("An error happened while using segment track: ", err);
          return reject(err);
        }
      });

      resolve();
    });
  };

  const page = async (name: string, userId: string, properties: object) => {
    return new Promise<void>((resolve, reject) => {
      client.page({
        userId,
        name,
        properties
      }, (err: Error) => {
        if (err) {
          logger.error("An error happened while using segment page: ", err);
          return reject(err);
        }
      });

      resolve();
    });
  };

  return {
    page,
    track,
    identify
  };
};
