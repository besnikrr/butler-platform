/* eslint-disable @typescript-eslint/no-explicit-any */
import { PublishBatchCommand, PublishCommand, SNSClient } from "@aws-sdk/client-sns";
import { logger } from "../logger";

export const SNSClientFactory = () => {
  const client = new SNSClient({ region: "us-east-1" });

  const publish = async <T>(topicARN: string, payload: any, eventName: string) => {
    try {
      logger.log(`publishing on ${topicARN}`);
      const published = Array.isArray(payload.data) ?
        await publishBatch(topicARN, payload, eventName) :
        await simplePublish(topicARN, payload, eventName);
      logger.log("published successfully", published);
    } catch (e) {
      logger.log("[sns-publish-error]: ", e);
    }
  };

  const simplePublish = async <T>(topicARN: string, payload: T, eventName: string) => {
    return client.send(
      new PublishCommand({
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
      })
    );
  };

  const publishBatch = async <T>(topicARN: string, payload: any, eventName: string) => {
    return client.send(
      new PublishBatchCommand({
        TopicArn: topicARN,
        PublishBatchRequestEntries: payload.data.map((el: T, idx: number) => {
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
      })
    );
  };

  return {
    client,
    publish,
    publishBatch
  };
};
