import { GENERAL_ACTION_ERROR } from "@butlerhospitality/shared";
import { CreateIdentityUserInput } from "../../../types";
import ICognito from "../../interface";

const CreateUser = (cognito: ICognito, logger: any) => {
  const action = async (data: CreateIdentityUserInput) => {
    try {
      // todo: this has to be transactional with saga since it can fail adding a user to a group
      await cognito.adminCreateUser({
        Username: data.user.email,
        ClientMetadata: {
          displayName: data.metadata?.display_name
        },
        UserAttributes: [
          { Name: "email", Value: data.user.email },
          { Name: "email_verified", Value: "true" }
        ]
      });
    } catch (err) {
      logger.error("[cognito-create-user-error]", err, JSON.stringify(err));
      throw GENERAL_ACTION_ERROR("create", "cognito-user");
    }
  };

  return {
    action
  };
};

export { CreateUser };
