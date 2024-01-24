export declare const RedisClientFactory: () => {
    client: any;
    publish: <T>(topicName: string, payload: T | T[], eventName: string) => any;
};
