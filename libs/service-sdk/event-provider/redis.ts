/* eslint-disable @typescript-eslint/no-explicit-any */
import { createClient } from "redis";

export const RedisClientFactory = () => {
  const client = createClient();

  const publish = <T> (topicName: string, payload: T | T[], eventName: string) => {
    return client.publish(
      topicName,
      constructMessage(payload, eventName, topicName)
    );
  };

  return {
    client,
    publish
  };
};

const constructMessage = <T> (payload: any, eventName: string, topicName: string) => {
  return JSON.stringify({
    Records: Array.isArray(payload.data) ? payload.data.map((el) => {
      return bodyMessage({
        context: payload.context,
        data: el,
        topicName: topicName
      }, eventName);
    }) : [
      bodyMessage({
        ...payload,
        topicName: topicName
      }, eventName)
    ]
  });
};

const formatEventName = (eventName: string) :string => {
  if (eventName.includes("_ADAPTER")) {
    eventName = eventName.replace("_ADAPTER", "");
  }
  return eventName;
};

const bodyMessage = <T> (payload: T, eventName: string) => {
  const formattedEventName = formatEventName(eventName);
  return {
    body: JSON.stringify(payload),
    MessageAttributes: {
      eventName: {
        DataType: "String",
        StringValue: formattedEventName
      }
    }
  };
};

