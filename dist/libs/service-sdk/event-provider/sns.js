"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SNSClientFactory = void 0;
const tslib_1 = require("tslib");
/* eslint-disable @typescript-eslint/no-explicit-any */
const client_sns_1 = require("@aws-sdk/client-sns");
const logger_1 = require("../logger");
const SNSClientFactory = () => {
    const client = new client_sns_1.SNSClient({ region: "us-east-1" });
    const publish = (topicARN, payload, eventName) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
        try {
            logger_1.logger.log(`publishing on ${topicARN}`);
            const published = Array.isArray(payload.data) ?
                yield publishBatch(topicARN, payload, eventName) :
                yield simplePublish(topicARN, payload, eventName);
            logger_1.logger.log("published successfully", published);
        }
        catch (e) {
            logger_1.logger.log("[sns-publish-error]: ", e);
        }
    });
    const simplePublish = (topicARN, payload, eventName) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
        return client.send(new client_sns_1.PublishCommand({
            TopicArn: topicARN,
            MessageGroupId: eventName.split("_")[0],
            MessageDeduplicationId: Date.now().toString(),
            Message: JSON.stringify(payload),
            MessageAttributes: {
                eventName: {
                    DataType: "String",
                    StringValue: eventName
                }
            }
        }));
    });
    const publishBatch = (topicARN, payload, eventName) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
        return client.send(new client_sns_1.PublishBatchCommand({
            TopicArn: topicARN,
            PublishBatchRequestEntries: payload.data.map((el, idx) => {
                return {
                    Id: `${idx}`,
                    MessageGroupId: eventName.split("_")[0],
                    MessageDeduplicationId: `${Date.now().toString()}${idx}`,
                    Message: JSON.stringify({ context: payload.context, data: el }),
                    MessageAttributes: {
                        eventName: {
                            DataType: "String",
                            StringValue: eventName
                        }
                    }
                };
            })
        }));
    });
    return {
        client,
        publish,
        publishBatch
    };
};
exports.SNSClientFactory = SNSClientFactory;
//# sourceMappingURL=sns.js.map