import { IdentityProvider, IdentityProviderFactory, IdentityProviderType, logger, NotFoundError } from "@butlerhospitality/service-sdk";
import { ITenant } from "@butlerhospitality/shared";
import AWS = require("aws-sdk");
import { IsArray, IsNotEmpty, MaxLength } from "class-validator";
import User from "../entities/user";
import { IUserRepository } from "../repository";

export interface IAddUsersToCognitoInput {
  ids: number[];
}

export class AddUsersToCognitoInput implements IAddUsersToCognitoInput {
  @IsArray()
  @IsNotEmpty()
  @MaxLength(20, {
    each: true
  })
  ids: number[];
}

export interface IAddUsersToCognitoDependency {
  userRepository: IUserRepository;
	validate: boolean;
}

export interface IAddUsersToCognitoResponse {
  existingCognitoUsers: string[],
  newCognitoUsers: User[]
}

export const saveUsersInCognito = async (users: User[], identityProvider: IdentityProvider): Promise<void> => {
  logger.log("on save cognito", users);
  const promises = [];
  users.forEach((user) => {
    promises.push(identityProvider.createUser({ user }));
  });
  await Promise.all(promises);
};

export const checkIfUsersAreInCognito = async (users: User[], identityProvider: IdentityProvider)
  : Promise<string[]> => {
  const promises = [];
  users.forEach((user) => {
    promises.push(identityProvider.getUser(user.email));
  });
  const payload = await Promise.all(promises);
  const usersThatAreInCognito: string[] = [];
  payload.forEach((res) => {
    if (res) {
      usersThatAreInCognito.push(res);
    }
  });
  return usersThatAreInCognito;
};

interface IGetTenantOutput extends ITenant {}
interface IGetTenantInput extends String {}

const dynamoConn = new AWS.DynamoDB.DocumentClient(
  process.env.STAGE === "local" ? {
    region: "localhost",
    endpoint: "http://0.0.0.0:8000"
  } : {}
);

// Getting Tenant directly for only migration users
export const getTenant = async (dynamoConnection: AWS.DynamoDB.DocumentClient, id: IGetTenantInput)
: Promise<IGetTenantOutput> => {
  console.log("getTenant", id);
  console.log("table_main", process.env.TABLE_MAIN);
  try {
    const result = await dynamoConnection.get({
      TableName: process.env.TABLE_MAIN,
      Key: {
        pk: "tenant",
        sk: `tenant::${id}`
      }
    }).promise();
    return result.Item as ITenant;
  } catch (e) {
    logger.log("[get-tenant-error]: ", e);
    throw new NotFoundError("Tenant", "Tenant not found");
  }
};

export default (dependency: IAddUsersToCognitoDependency) => {
  const { userRepository } = dependency;
  return async (data: IAddUsersToCognitoInput): Promise<IAddUsersToCognitoResponse> => {
    console.log("add users in cognito", data);
    const users = await userRepository.getEntitiesOrFailIfNotFound(data.ids);
    const tenant = await getTenant(dynamoConn, "butler");
    console.log("tenant", tenant);

    const identityProvider = IdentityProviderFactory({
      type: IdentityProviderType.Cognito,
      logger: console,
      poolId: tenant.cognito.poolId
    });

    const existingCognitoUsers = await checkIfUsersAreInCognito(users, identityProvider);
    if (existingCognitoUsers.length) {
      logger.log(`Some of these users already exist in cognito: [${existingCognitoUsers.map((el) => el)}]`);
    }

    const newCognitoUsers = users.filter((user) => !existingCognitoUsers.includes(user.email));

    if (newCognitoUsers.length) {
      await saveUsersInCognito(newCognitoUsers, identityProvider);
      logger.log(`New Cognito Users: ${newCognitoUsers}`);
    }
    return {
      existingCognitoUsers,
      newCognitoUsers
    };
  };
};

