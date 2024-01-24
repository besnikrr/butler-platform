import { GENERAL_ACTION_ERROR } from "@butlerhospitality/shared";
import { DeleteIdentityRoleInput } from "../../../types";
import ICognito from "../../interface";

const DeleteGroup = (cognito: ICognito, logger: any) => {
  const action = async (data: DeleteIdentityRoleInput) => {
    try {
      return await cognito.deleteGroup({
        GroupName: data.role.name
      });
    } catch (err) {
      logger.error(JSON.stringify(err));
      throw GENERAL_ACTION_ERROR("delete", "cognito-group");
    }
  };

  return {
    action
  };
};

export { DeleteGroup };
