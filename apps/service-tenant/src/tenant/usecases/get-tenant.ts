import { logger, NotFoundError } from "@butlerhospitality/service-sdk";
import { ITenant } from "@butlerhospitality/shared";

export interface IGetTenantOutput extends ITenant {}
export interface IGetTenantInput extends String {}

export default (dynamoConnection: AWS.DynamoDB.DocumentClient) => {
  return async (id: IGetTenantInput): Promise<IGetTenantOutput> => {
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
};
