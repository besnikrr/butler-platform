"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.lambdaWarmupWrapper = exports.warmupkey = void 0;
const tslib_1 = require("tslib");
exports.warmupkey = "serverless-plugin-warmup";
const lambdaWarmupWrapper = (handler) => (event) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    if (event.source === exports.warmupkey) {
        return;
    }
    return handler(event);
});
exports.lambdaWarmupWrapper = lambdaWarmupWrapper;
//# sourceMappingURL=lambda-warmup-wrapper.js.map