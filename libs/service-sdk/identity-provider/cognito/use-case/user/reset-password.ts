import { GENERAL_ACTION_ERROR } from "@butlerhospitality/shared";
import ICognito from "../../interface";
import { ResetUserPasswordInput } from "../../types";

const ResetUserPassword = (cognito: ICognito, logger: any) => {
  const action = async (data: ResetUserPasswordInput) => {
    try {
      return await cognito.adminConfirmForgotPassword({
        ClientId: data.clientID,
        ConfirmationCode: data.confirmationCode,
        Password: data.password,
        Username: data.username
      });
    } catch (err) {
      logger.error("[reset-password-cognito-err]: ", err, JSON.stringify(err));
      throw GENERAL_ACTION_ERROR("ResetUserPassword", "cognito-user");
    }
  };

  return {
    action
  };
};

export { ResetUserPassword };
