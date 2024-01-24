import { CreateFactoryInput, IdentityProvider, IdentityProviderType } from "./types";
import { ICognitoChangePasswordInput } from "./cognito/use-case/user/change-password";
declare const IdentityProviderFactory: (factory: CreateFactoryInput) => IdentityProvider;
export { IdentityProviderFactory, IdentityProviderType, IdentityProvider, ICognitoChangePasswordInput };
