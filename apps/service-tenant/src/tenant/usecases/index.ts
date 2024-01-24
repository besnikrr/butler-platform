import * as AWS from "aws-sdk";
import getTenant, { IGetTenantInput, IGetTenantOutput } from "./get-tenant";

export interface TenantUsecase {
  getTenant(name: IGetTenantInput): Promise<IGetTenantOutput>;
}

const dynamoConnection = new AWS.DynamoDB.DocumentClient(
  process.env.STAGE === "local" ? {
    region: "localhost",
    endpoint: "http://0.0.0.0:8000"
  } : {}
);

export default (): TenantUsecase => ({
  getTenant: getTenant(dynamoConnection)
});
