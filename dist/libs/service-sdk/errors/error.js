"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generalError = void 0;
const generalError = (code, message) => {
    return {
        error: true,
        code,
        message
    };
};
exports.generalError = generalError;
//# sourceMappingURL=error.js.map