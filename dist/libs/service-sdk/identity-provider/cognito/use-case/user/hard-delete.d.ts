import ICognito from "../../interface";
declare const HardDeleteUser: (cognito: ICognito, logger: any) => {
    action: (username: string) => Promise<void>;
};
export { HardDeleteUser };
