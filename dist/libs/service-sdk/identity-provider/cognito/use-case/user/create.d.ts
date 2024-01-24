import { CreateIdentityUserInput } from "../../../types";
import ICognito from "../../interface";
declare const CreateUser: (cognito: ICognito, logger: any) => {
    action: (data: CreateIdentityUserInput) => Promise<void>;
};
export { CreateUser };
