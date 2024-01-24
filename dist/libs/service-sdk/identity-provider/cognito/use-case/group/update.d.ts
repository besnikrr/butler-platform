import { CreateIdentityRoleInput } from "../../../types";
import ICognito from "../../interface";
declare const UpdateGroup: (cognito: ICognito, logger: any) => {
    action: (data: CreateIdentityRoleInput) => Promise<void>;
};
export { UpdateGroup };
