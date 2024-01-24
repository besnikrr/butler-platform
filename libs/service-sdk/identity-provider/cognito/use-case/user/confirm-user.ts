import { GENERAL_ACTION_ERROR } from "@butlerhospitality/shared";
import ICognito from "../../interface";

const ConfirmUser = (cognito: ICognito, logger: any) => {
  const action = async (email: string) => {
    try {
      await cognito.adminSetUserPassword({
        Username: email,
        Password: "Temporary1!",
        Permanent: true
      });
      return await cognito.adminUpdateUserAttributes({
        Username: email,
        UserAttributes: [
          {
            Name: "email_verified",
            Value: "true"
          }
        ]
      });
    } catch (err) {
      logger.error(JSON.stringify(err));
      throw GENERAL_ACTION_ERROR("confirm-user", "cognito-user");
    }
  };

  return {
    action
  };
};

export { ConfirmUser };
