"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EvClient = exports.eventProvider = void 0;
const tslib_1 = require("tslib");
/* eslint-disable space-before-function-paren */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/return-await */
const redis_1 = require("./redis");
const sns_1 = require("./sns");
class EvClient {
    constructor() {
        this.stage = process.env.STAGE;
        switch (this.stage) {
            case "local":
                this.eventProvider = redis_1.RedisClientFactory();
                break;
            case "dev":
            case "development":
            case "staging":
            case "prod":
            case "production":
                this.eventProvider = sns_1.SNSClientFactory();
                break;
            default:
                this.eventProvider = null;
        }
    }
    publish(topicARN, eventName, context, data) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const payload = { context, data };
            if (!this.eventProvider) {
                return;
            }
            return yield this.eventProvider.publish(topicARN, payload, eventName);
        });
    }
    subscribe(eventName) {
        if (this.stage === "local") {
            return this.eventProvider.client.subscribe(eventName);
        }
    }
    on(event, cb) {
        if (this.stage === "local") {
            return this.eventProvider.client.on(event, cb);
        }
    }
}
exports.EvClient = EvClient;
const eventProvider = (function () {
    let eventClient;
    return {
        client() {
            if (!eventClient) {
                eventClient = new EvClient();
            }
            return eventClient;
        }
    };
})();
exports.eventProvider = eventProvider;
//# sourceMappingURL=index.js.map