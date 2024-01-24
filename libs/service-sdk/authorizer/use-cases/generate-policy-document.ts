import { IPolicyObject } from "../types";

const policyObject: IPolicyObject = {
  "principalId": "1234",
  "policyDocument": {
    "Version": "2012-10-17"
  }
};

const generatePolicyDocument = async (permissions: Array<string>) => {
  const statements: Array<any> = [];
  permissions.forEach((permission: any) => {
    statements.push({
      Action: "execute-api:Invoke",
      Effect: "Allow",
      Resource: permission.arn
    });
  });
  policyObject.policyDocument.Statement = statements;
  return policyObject;
};

export {
  generatePolicyDocument,
  policyObject
};
