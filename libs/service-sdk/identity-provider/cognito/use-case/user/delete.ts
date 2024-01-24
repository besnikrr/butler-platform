import { GENERAL_ACTION_ERROR } from "@butlerhospitality/shared";
import ICognito from "../../interface";

const DeleteUser = (cognito: ICognito, logger: any) => {
  const action = async (username: string) => {
    try {
      // todo: this has to be transactional with saga since it can fail adding a user to a group
      return await cognito.adminDisableUser({
        Username: username
      });
    } catch (err) {
      logger.error(JSON.stringify(err));
      throw GENERAL_ACTION_ERROR("delete", "cognito-user");
    }
  };

  return {
    action
  };
};

export { DeleteUser };
