import { CreateIdentityRoleInput } from "../../../types";
import ICognito from "../../interface";
declare const ListGroupUsers: (cognito: ICognito, logger: any) => {
    action: (data: CreateIdentityRoleInput) => Promise<import("../../types").User[]>;
};
export { ListGroupUsers };
