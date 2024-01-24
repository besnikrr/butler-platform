import {
  IdentityProvider, IdentityProviderFactory, IdentityProviderType
} from "@butlerhospitality/service-sdk";
import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export interface IResetAccountPasswordInput {
  clientId: string;
  email: string;
  password?: string;
  code?: string;
  poolId?: string;
}

export class ResetPasswordInput implements IResetAccountPasswordInput {
  @IsNotEmpty()
  @IsString()
  clientId: string;

  @IsNotEmpty()
  @IsString()
  email: string;

  @IsString()
  @IsOptional()
  password?: string;

  @IsString()
  @IsOptional()
  code?: string;

  @IsString()
  @IsOptional()
  poolId?: string;
}

export default () => {
  return async (inputData: IResetAccountPasswordInput): Promise<IdentityProvider> => {
    return await IdentityProviderFactory({
      type: IdentityProviderType.Cognito,
      logger: console,
      poolId: inputData.poolId
    }).resetUserPassword({
      clientID: inputData.clientId,
      username: inputData.email,
      password: inputData.password,
      confirmationCode: inputData.code
    });
  };
};
