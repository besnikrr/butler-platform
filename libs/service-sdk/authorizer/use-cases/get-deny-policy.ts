import { policyObject } from "./generate-policy-document";

const getDenyPolicy = (): any => {
  policyObject.policyDocument.Statement = [
    {
      Action: "execute-api:Invoke",
      Effect: "Deny",
      Resource: "*"
    }
  ];
  policyObject.context = {
    deny: true
  };
  return policyObject;
};

export {
  getDenyPolicy
};
