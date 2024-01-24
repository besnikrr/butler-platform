import { GENERAL_ACTION_ERROR } from "@butlerhospitality/shared";
import ICognito from "../../interface";

const ForgotPassword = (cognito: ICognito, logger: any) => {
  const action = async (data: { clientID: string, username: string }) => {
    try {
      logger.log("forgort-pwd-data: ", data);
      return await cognito.forgotPassword({
        ClientId: data.clientID,
        Username: data.username
      });
    } catch (err) {
      logger.error(JSON.stringify(err));
      throw GENERAL_ACTION_ERROR("ResetUserPassword", "cognito-user");
    }
  };

  return {
    action
  };
};

export { ForgotPassword };
