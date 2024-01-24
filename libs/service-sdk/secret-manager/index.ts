import { SecretsManager } from "aws-sdk";
import { logger } from "../logger";

const smClient = new SecretsManager({ region: process.env.REGION });

export interface ISecretValue {
	[key: string]: string;
}

export const SecretManagerService = () => {
  const getSecretValue = async (SecretId: string): Promise<ISecretValue> => {
    let secretValue = null;
    try {
      secretValue = await smClient.getSecretValue({ SecretId }).promise();
    } catch (e) {
      logger.log(e);
      throw new Error("Could not retrieve the secret value");
    }
    try {
      return JSON.parse(secretValue?.SecretString);
    } catch (e) {
      logger.log(e);
      throw new Error("Error parsing the secret string");
    }
  };

  return {
    getSecretValue
  };
};
