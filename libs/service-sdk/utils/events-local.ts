import { EvClient } from "../event-provider";

export function eventsLocal(eventHandlers): void {
  const localSubscriber = new EvClient();
  Object.keys(eventHandlers).forEach((channel) => {
    localSubscriber.subscribe(channel);
  });
  localSubscriber.on("message", async (channel, message) => {
    const messageParsed = JSON.parse(message);
    const functionsToExecute = eventHandlers[channel];
    functionsToExecute.forEach(async (functionToExecute) => {
      await functionToExecute(messageParsed);
    });
  });
}
