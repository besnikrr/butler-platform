import ICognito from "../../interface";
import { ResetUserPasswordInput } from "../../types";
declare const ResetUserPassword: (cognito: ICognito, logger: any) => {
    action: (data: ResetUserPasswordInput) => Promise<void>;
};
export { ResetUserPassword };
