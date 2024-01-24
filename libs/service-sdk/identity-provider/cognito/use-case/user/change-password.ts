
import { GENERAL_ACTION_ERROR } from "@butlerhospitality/shared";
import ICognito from "../../interface";

export interface ICognitoChangePasswordInput {
  AccessToken: string;
  PreviousPassword: string;
  ProposedPassword: string;
}

const ChangePassword = (cognito: ICognito, logger: any) => {
  const action = async (params: ICognitoChangePasswordInput) => {
    try {
      return await cognito.adminChangePassword(params);
    } catch (err) {
      logger.error(JSON.stringify(err));
      throw GENERAL_ACTION_ERROR("ChangePassword", "cognito-user");
    }
  };

  return {
    action
  };
};

export { ChangePassword };
