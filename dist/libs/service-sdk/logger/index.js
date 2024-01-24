"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = void 0;
exports.logger = {
    log: (msg, ...args) => {
        console.log(msg, ...args);
    },
    warn: (msg, ...args) => {
        console.warn(msg, ...args);
    },
    debug: (msg, ...args) => {
        console.debug(msg, ...args);
    },
    error: (msg, ...args) => {
        console.error(msg, ...args);
    }
};
//# sourceMappingURL=index.js.map