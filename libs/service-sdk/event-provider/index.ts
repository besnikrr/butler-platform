/* eslint-disable space-before-function-paren */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/return-await */
import { RedisClientFactory } from "./redis";
import { SNSClientFactory } from "./sns";
import { ActionContext } from "@butlerhospitality/shared";

interface EventPayloadStruct<T> {
  data: T;
  tenantId: string;
  eventName: string;
  authUser: any;
}

class EvClient {
  stage: string;

  eventProvider: any;

  constructor() {
    this.stage = process.env.STAGE;

    switch (this.stage) {
    case "local":
      this.eventProvider = RedisClientFactory();
      break;
    case "dev":
    case "development":
    case "staging":
    case "prod":
    case "production":
      this.eventProvider = SNSClientFactory();
      break;
    default:
      this.eventProvider = null;
    }
  }

  async publish<T>(topicARN: string, eventName: string, context: ActionContext, data: T | T[]): Promise<any> {
    const payload = { context, data };
    if (!this.eventProvider) {
      return;
    }
    return await this.eventProvider.publish(topicARN, payload, eventName);
  }

  subscribe(eventName: string) {
    if (this.stage === "local") {
      return this.eventProvider.client.subscribe(eventName);
    }
  }

  on(event: string, cb: (channel: string, message: string) => void) {
    if (this.stage === "local") {
      return this.eventProvider.client.on(event, cb);
    }
  }
}

const eventProvider = (function (): { client(): EvClient; } {
  let eventClient: EvClient;
  return {
    client(): EvClient {
      if (!eventClient) {
        eventClient = new EvClient();
      }
      return eventClient;
    }
  };
})();

export { eventProvider, EvClient, EventPayloadStruct };

