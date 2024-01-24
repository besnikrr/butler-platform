import { GENERAL_ACTION_ERROR } from "@butlerhospitality/shared";
import { AddUserToRolesInput } from "../../../types";
import ICognito from "../../interface";

const AddUser = (cognito: ICognito, logger: any) => {
  const action = async (data: AddUserToRolesInput) => {
    const { currentRoles, user, newRoles } = data;
    try {
      for (let i = 0; i < currentRoles.length; i += 1) {
        const role = currentRoles[i];
        await cognito.adminRemoveUserFromGroup({
          Username: user.email,
          GroupName: role.name.split("::")[1]
        });
      }

      for (let i = 0; i < newRoles.length; i += 1) {
        await cognito.adminAddUserToGroup({
          Username: user.email,
          GroupName: newRoles[i].name.split("::")[1]
        });
      }
    } catch (err) {
      logger.error(JSON.stringify(err));
      throw GENERAL_ACTION_ERROR("add-user", "cognito-group");
    }
  };

  return {
    action
  };
};

export { AddUser };
