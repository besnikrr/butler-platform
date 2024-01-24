import { GENERAL_ACTION_ERROR } from "@butlerhospitality/shared";
import { CreateIdentityRoleInput } from "../../../types";
import ICognito from "../../interface";

const UpdateGroup = (cognito: ICognito, logger: any) => {
  const action = async (data: CreateIdentityRoleInput) => {
    try {
      const cgRes = await cognito.updateGroup({
        GroupName: data.role.name,
        Description: data.role.description
      });
      logger.info(JSON.stringify(cgRes));
    } catch (err) {
      logger.error(err);
      throw GENERAL_ACTION_ERROR("update", "cognito-group");
    }
  };

  return {
    action
  };
};

export { UpdateGroup };
