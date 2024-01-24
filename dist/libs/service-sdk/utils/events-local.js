"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.eventsLocal = void 0;
const tslib_1 = require("tslib");
const event_provider_1 = require("../event-provider");
function eventsLocal(eventHandlers) {
    const localSubscriber = new event_provider_1.EvClient();
    Object.keys(eventHandlers).forEach((channel) => {
        localSubscriber.subscribe(channel);
    });
    localSubscriber.on("message", (channel, message) => tslib_1.__awaiter(this, void 0, void 0, function* () {
        const messageParsed = JSON.parse(message);
        const functionsToExecute = eventHandlers[channel];
        functionsToExecute.forEach((functionToExecute) => tslib_1.__awaiter(this, void 0, void 0, function* () {
            yield functionToExecute(messageParsed);
        }));
    }));
}
exports.eventsLocal = eventsLocal;
//# sourceMappingURL=events-local.js.map