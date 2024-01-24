import * as AWS from "aws-sdk";
import * as jwt from "jsonwebtoken";
import { logger } from "libs/service-sdk/logger";
import { StatusCodes, BaseError } from "libs/service-sdk";

import {
  IWebsocketService,
  WebSocketActionTypes,
  IWebsocketBroadcastInput,
  IWebsocketBroadcastOutput,
  IWebscoketDisconnectOutput,
  IWebsocketBroadcastMessageInput
} from "../interfaces";

const tableName = process.env.DYNAMO_TABLE_MANAGEMENT_CONNECTION;
const dbClient = new AWS.DynamoDB.DocumentClient(
  {
    apiVersion: "2012-08-10",
    endpoint: process.env.DYNAMO_ENDPOINT,
    region: process.env.REGION,
    accessKeyId: process.env.ACCESS_KEY_ID,
    secretAccessKey: process.env.SECRET_ACCESS_KEY
  }
);

const apigwManagementApi = new AWS.ApiGatewayManagementApi({
  apiVersion: "2018-11-29",
  endpoint: process.env.SOCKET_API_GATEWAY_URL
});

export class ConnectionError extends BaseError {}
export class BroadCastError extends BaseError {}

export class APIGatewayWebSocketService implements IWebsocketService {
  async connect(event): Promise<IWebsocketBroadcastOutput> {
    const connectionId = event.requestContext.connectionId;
    const token = event.queryStringParameters?.token;

    const payload = token ? jwt.decode(token, { complete: true }) : null;

    const putParams = {
      TableName: tableName,
      Item: {
        connectionId,
        email: payload?.payload?.username
      }
    };

    try {
      await dbClient.put(putParams).promise();
    } catch (e) {
      logger.log(e);
      throw new ConnectionError("Connection Error", e.statusCode, JSON.stringify(e));
    }

    return {
      statusCode: StatusCodes.OK
    };
  }

  async disconnect(event): Promise<IWebscoketDisconnectOutput> {
    const connectionId = event.requestContext.connectionId;
    const delParams = {
      TableName: tableName,
      Key: {
        connectionId
      }
    };
    try {
      await dbClient.delete(delParams).promise();
    } catch (e) {
      logger.log(e);
      throw new ConnectionError("Disconnect Error", e.statusCode, JSON.stringify(e));
    }
    return {
      statusCode: StatusCodes.OK
    };
  }

  async broadcast(input: IWebsocketBroadcastMessageInput): Promise<IWebsocketBroadcastOutput> {
    if (!Object.keys(WebSocketActionTypes).indexOf(input.action)) {
      return {
        statusCode: StatusCodes.BAD_REQUEST,
        message: "Invalid action"
      };
    }

    let connectionIds = input.connectionIds;

    if (input.connectionIds?.length === 0 || input.connectionIds === undefined) {
      connectionIds = await this.fetchAllData();
    }

    const broadCastParameters: IWebsocketBroadcastInput = {
      connectionIds,
      body: {
        action: WebSocketActionTypes[input.action].key,
        id: input.id,
        data: WebSocketActionTypes[input.action].key
      }
    };
    return this.broadcastMessage(broadCastParameters);
  }

  private async broadcastMessage(input: IWebsocketBroadcastInput): Promise<IWebsocketBroadcastOutput> {
    const connectionIds = input.connectionIds;
    if (!connectionIds || connectionIds.length === 0) {
      return {
        statusCode: StatusCodes.BAD_REQUEST,
        message: "No connectionIds"
      };
    }
    const postData = JSON.stringify(input.body);
    const postCalls = connectionIds?.map(async (connectionId) => {
      try {
        await apigwManagementApi
          .postToConnection({ ConnectionId: connectionId, Data: postData })
          .promise();
      } catch (e) {
        if (e.statusCode === 410) {
          logger.log(`Found stale connection, deleting ${connectionId}`);
          await dbClient
            .delete({
              TableName: tableName,
              Key: { connectionId }
            })
            .promise();
        } else {
          logger.log(JSON.stringify(e));
          throw new BroadCastError("Broadcast Error", e.statusCode, JSON.stringify(e));
        }
      }
    });

    try {
      if (postCalls) await Promise.all(postCalls);
    } catch (e) {
      logger.log(e);
      throw new BroadCastError("Broadcast Error", e.statusCode, JSON.stringify(e));
    }

    return {
      statusCode: StatusCodes.OK,
      message: "Data sent."
    };
  }

  private async fetchAllData(): Promise<any> {
    const connectionData = await dbClient
      .scan({
        TableName: tableName,
        ProjectionExpression: "connectionId"
      })
      .promise();

    return connectionData?.Items?.map((item) => item.connectionId) || [];
  }
}
