export interface ActionURI {
    uri: string;
    action: string;
}
export interface IPolicyDocument {
    Version: string;
    Statement?: Array<{}>;
}
export interface IPolicyObject {
    principalId: string;
    policyDocument: IPolicyDocument;
    context?: any;
}
export interface IAuthorizedUser {
    id: number;
    name: string;
    email: string;
}
