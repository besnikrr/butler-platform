import {
  IdentityProvider,
  IdentityProviderFactory,
  IdentityProviderType
} from "@butlerhospitality/service-sdk";

export interface IForgotPasswordInput {
  clientId: string;
  email: string;
  poolId: string
}

export default () => {
  return async (inputData: IForgotPasswordInput): Promise<IdentityProvider> => {
    return IdentityProviderFactory({
      type: IdentityProviderType.Cognito,
      logger: console,
      poolId: inputData.poolId
    }).forgotPassword({
      clientID: inputData.clientId,
      username: inputData.email
    });
  };
};
