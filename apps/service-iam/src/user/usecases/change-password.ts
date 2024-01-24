import {
  IdentityProviderFactory,
  IdentityProviderType,
  ICognitoChangePasswordInput
} from "@butlerhospitality/service-sdk";
import { ITenant } from "@butlerhospitality/shared";
import { IsNotEmpty, IsString } from "class-validator";

export interface IChangePasswordInput {
  temporaryPassword: string;
  password: string;
  verifyPassword: string;
}

export class ChangePasswordInput implements IChangePasswordInput {
  @IsString()
  @IsNotEmpty()
  temporaryPassword: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsString()
  @IsNotEmpty()
  verifyPassword: string;
}

export default () => {
  return async (
    inputData: ICognitoChangePasswordInput, tenant: ITenant
  ) => {
    return await IdentityProviderFactory({
      type: IdentityProviderType.Cognito,
      logger: console,
      poolId: tenant.cognito.poolId
    }).changePassword(inputData);
  };
};
