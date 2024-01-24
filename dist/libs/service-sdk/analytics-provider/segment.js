"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SegmentProvider = void 0;
const tslib_1 = require("tslib");
const Analytics = require("analytics-node");
const logger_1 = require("../logger");
const createAnalyticsClient = (key) => {
    if (process.env.NODE_ENV === "test") {
        return {
            track: (data) => {
                return data.event;
            }
        };
    }
    if (process.env.STAGE === "local") {
        return {
            track: (data) => {
                logger_1.logger.log(`[analytics-track]: ${data.event}, ${data.userId}`);
            }
        };
    }
    return new Analytics(key);
};
const SegmentProvider = () => {
    const client = createAnalyticsClient("key");
    const track = (event, userId, properties) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
        try {
            logger_1.logger.log(`Sending segment event on ${event}`);
            client.track({
                userId: userId,
                event: event,
                properties: properties
            });
            logger_1.logger.log("Segment event sent successfully", event);
        }
        catch (e) {
            logger_1.logger.log("[Segment-event-error]: ", e);
        }
    });
    return {
        track
    };
};
exports.SegmentProvider = SegmentProvider;
//# sourceMappingURL=segment.js.map