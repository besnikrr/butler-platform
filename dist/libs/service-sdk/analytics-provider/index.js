"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalyticsProviderType = exports.analytics = void 0;
const tslib_1 = require("tslib");
const utils_1 = require("../utils");
const segment_1 = require("./segment");
var AnalyticsProviderType;
(function (AnalyticsProviderType) {
    AnalyticsProviderType["SEGMENT"] = "SEGMENT";
})(AnalyticsProviderType || (AnalyticsProviderType = {}));
exports.AnalyticsProviderType = AnalyticsProviderType;
class AnalyticsError extends utils_1.BaseError {
    constructor(message, code = utils_1.StatusCodes.INTERNAL_SERVER) {
        super("Analytics Error", code, message);
    }
}
class AnalyticsProvider {
    constructor(providerType) {
        this.providerType = AnalyticsProviderType[providerType];
        if (this.providerType === AnalyticsProviderType.SEGMENT) {
            this.provider = segment_1.SegmentProvider;
        }
        else {
            throw new AnalyticsError(`Analytics provider ${this.providerType} is not supported`, utils_1.StatusCodes.NOT_IMPLEMENTED);
        }
    }
    track(event, userId, properties) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return this.provider().track(event, userId, properties);
        });
    }
}
const analytics = (providerType) => {
    return new AnalyticsProvider(providerType);
};
exports.analytics = analytics;
//# sourceMappingURL=index.js.map