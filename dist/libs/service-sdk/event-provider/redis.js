"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RedisClientFactory = void 0;
/* eslint-disable @typescript-eslint/no-explicit-any */
const redis_1 = require("redis");
const RedisClientFactory = () => {
    const client = redis_1.createClient();
    const publish = (topicName, payload, eventName) => {
        return client.publish(topicName, constructMessage(payload, eventName, topicName));
    };
    return {
        client,
        publish
    };
};
exports.RedisClientFactory = RedisClientFactory;
const constructMessage = (payload, eventName, topicName) => {
    return JSON.stringify({
        Records: Array.isArray(payload.data) ? payload.data.map((el) => {
            return bodyMessage({
                context: payload.context,
                data: el,
                topicName: topicName
            }, eventName);
        }) : [
            bodyMessage(Object.assign(Object.assign({}, payload), { topicName: topicName }), eventName)
        ]
    });
};
const formatEventName = (eventName) => {
    if (eventName.includes("_ADAPTER")) {
        eventName = eventName.replace("_ADAPTER", "");
    }
    return eventName;
};
const bodyMessage = (payload, eventName) => {
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
//# sourceMappingURL=redis.js.map