import ICognito from "../../interface";
declare const DeleteUser: (cognito: ICognito, logger: any) => {
    action: (username: string) => Promise<void>;
};
export { DeleteUser };
