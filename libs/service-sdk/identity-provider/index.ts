import { GENERAL_ACTION_ERROR } from "@butlerhospitality/shared";
import { CreateFactoryInput, IdentityProvider, IdentityProviderType } from "./types";
import CognitoManager from "./cognito";
import { ICognitoChangePasswordInput } from "./cognito/use-case/user/change-password";

const IdentityProviderFactory = (factory: CreateFactoryInput): IdentityProvider => {
  switch (factory.type) {
  case IdentityProviderType.Cognito:
    if (!factory.poolId) {
      factory.logger.error("poolId required");
      throw GENERAL_ACTION_ERROR("initialize", "cognito manager");
    }
    return CognitoManager(factory.poolId, factory.logger);
  }
};

export { IdentityProviderFactory, IdentityProviderType, IdentityProvider, ICognitoChangePasswordInput };
