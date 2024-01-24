"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_EVENT_ERROR_MESSAGE = exports.onlyUnique = void 0;
function onlyUnique(value, index, self) {
    return self.indexOf(value) === index;
}
exports.onlyUnique = onlyUnique;
exports.DEFAULT_EVENT_ERROR_MESSAGE = "Bad event name provided";
//# sourceMappingURL=helper.js.map