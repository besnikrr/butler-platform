import { AddUserToRolesInput } from "../../../types";
import ICognito from "../../interface";
declare const AddUser: (cognito: ICognito, logger: any) => {
    action: (data: AddUserToRolesInput) => Promise<void>;
};
export { AddUser };
