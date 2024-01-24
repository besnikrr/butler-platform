import ICognito from "../../interface";
export interface ICognitoChangePasswordInput {
    AccessToken: string;
    PreviousPassword: string;
    ProposedPassword: string;
}
declare const ChangePassword: (cognito: ICognito, logger: any) => {
    action: (params: ICognitoChangePasswordInput) => Promise<void>;
};
export { ChangePassword };
