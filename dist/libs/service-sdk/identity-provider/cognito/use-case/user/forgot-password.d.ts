import ICognito from "../../interface";
declare const ForgotPassword: (cognito: ICognito, logger: any) => {
    action: (data: {
        clientID: string;
        username: string;
    }) => Promise<void>;
};
export { ForgotPassword };
