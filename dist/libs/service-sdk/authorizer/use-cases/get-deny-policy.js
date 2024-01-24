"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDenyPolicy = void 0;
const generate_policy_document_1 = require("./generate-policy-document");
const getDenyPolicy = () => {
    generate_policy_document_1.policyObject.policyDocument.Statement = [
        {
            Action: "execute-api:Invoke",
            Effect: "Deny",
            Resource: "*"
        }
    ];
    generate_policy_document_1.policyObject.context = {
        deny: true
    };
    return generate_policy_document_1.policyObject;
};
exports.getDenyPolicy = getDenyPolicy;
//# sourceMappingURL=get-deny-policy.js.map