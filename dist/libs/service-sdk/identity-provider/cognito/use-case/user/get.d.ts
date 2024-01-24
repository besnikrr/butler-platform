import ICognito from "../../interface";
declare const GetUser: (cognito: ICognito, logger: any) => {
    action: (username: string) => Promise<string>;
};
export { GetUser };
