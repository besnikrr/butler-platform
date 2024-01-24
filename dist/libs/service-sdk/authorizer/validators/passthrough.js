"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isExempt = void 0;
const exemptURIs = {
    "/api/iam/users/reset/password": true,
    "/api/iam/users/init/reset/password": true
};
const isExempt = (uri) => {
    return exemptURIs[uri];
};
exports.isExempt = isExempt;
//# sourceMappingURL=passthrough.js.map