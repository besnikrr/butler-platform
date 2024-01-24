"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.policyObject = exports.generatePolicyDocument = void 0;
const tslib_1 = require("tslib");
const policyObject = {
    "principalId": "1234",
    "policyDocument": {
        "Version": "2012-10-17"
    }
};
exports.policyObject = policyObject;
const generatePolicyDocument = (permissions) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    const statements = [];
    permissions.forEach((permission) => {
        statements.push({
            Action: "execute-api:Invoke",
            Effect: "Allow",
            Resource: permission.arn
        });
    });
    policyObject.policyDocument.Statement = statements;
    return policyObject;
});
exports.generatePolicyDocument = generatePolicyDocument;
//# sourceMappingURL=generate-policy-document.js.map