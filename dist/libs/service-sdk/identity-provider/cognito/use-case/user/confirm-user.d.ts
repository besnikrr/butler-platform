import ICognito from "../../interface";
declare const ConfirmUser: (cognito: ICognito, logger: any) => {
    action: (email: string) => Promise<void>;
};
export { ConfirmUser };
