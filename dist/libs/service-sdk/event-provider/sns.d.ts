import { SNSClient } from "@aws-sdk/client-sns";
export declare const SNSClientFactory: () => {
    client: SNSClient;
    publish: <T>(topicARN: string, payload: any, eventName: string) => Promise<void>;
    publishBatch: <T_1>(topicARN: string, payload: any, eventName: string) => Promise<import("@aws-sdk/client-sns").PublishBatchCommandOutput>;
};
