import { GENERAL_ACTION_ERROR } from "@butlerhospitality/shared";
import { CreateIdentityRoleInput } from "../../../types";
import ICognito from "../../interface";

const ListGroupUsers = (cognito: ICognito, logger: any) => {
  const action = async (data: CreateIdentityRoleInput) => {
    try {
      const cgRes = await cognito.listUsersInGroup({
        GroupName: data.role.name
      });
      logger.info(JSON.stringify(cgRes));
      return cgRes.Users || [];
    } catch (err) {
      logger.error(err);
      throw GENERAL_ACTION_ERROR("list-users", "cognito-group");
    }
  };

  return {
    action
  };
};

export { ListGroupUsers };
