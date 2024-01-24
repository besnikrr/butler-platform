import { IPolicyObject } from "../types";
declare const policyObject: IPolicyObject;
declare const generatePolicyDocument: (permissions: Array<string>) => Promise<IPolicyObject>;
export { generatePolicyDocument, policyObject };
