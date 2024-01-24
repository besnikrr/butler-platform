export interface ErrorObject {
    error: boolean;
    code: string;
    message: string;
}
export declare const generalError: (code: string, message: string) => ErrorObject;
