import { DeleteIdentityRoleInput } from "../../../types";
import ICognito from "../../interface";
declare const DeleteGroup: (cognito: ICognito, logger: any) => {
    action: (data: DeleteIdentityRoleInput) => Promise<void>;
};
export { DeleteGroup };
