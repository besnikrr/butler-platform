import { CreateIdentityRoleInput } from "../../../types";
import ICognito from "../../interface";
declare const CreateGroup: (cognito: ICognito, logger: any) => {
    action: (data: CreateIdentityRoleInput) => Promise<void>;
};
export { CreateGroup };
