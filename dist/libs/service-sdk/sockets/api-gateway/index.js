"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.APIGatewayWebSocketService = exports.BroadCastError = exports.ConnectionError = void 0;
const tslib_1 = require("tslib");
const AWS = require("aws-sdk");
const jwt = require("jsonwebtoken");
const logger_1 = require("libs/service-sdk/logger");
const service_sdk_1 = require("libs/service-sdk");
const tableName = process.env.DYNAMO_TABLE_MANAGEMENT_CONNECTION;
const dbClient = new AWS.DynamoDB.DocumentClient({
    apiVersion: "2012-08-10",
    endpoint: process.env.DYNAMO_ENDPOINT,
    region: process.env.REGION,
    accessKeyId: process.env.ACCESS_KEY_ID,
    secretAccessKey: process.env.SECRET_ACCESS_KEY
});
class ConnectionError extends service_sdk_1.BaseError {
}
exports.ConnectionError = ConnectionError;
class BroadCastError extends service_sdk_1.BaseError {
}
exports.BroadCastError = BroadCastError;
class APIGatewayWebSocketService {
    connect(event) {
        var _a, _b;
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const connectionId = event.requestContext.connectionId;
            const token = (_a = event.queryStringParameters) === null || _a === void 0 ? void 0 : _a.token;
            // TODO: SQU5-440
            const payload = token ? jwt.decode(token, { complete: true }) : null;
            const putParams = {
                TableName: tableName,
                Item: {
                    connectionId,
                    email: (_b = payload === null || payload === void 0 ? void 0 : payload.payload) === null || _b === void 0 ? void 0 : _b.username
                }
            };
            try {
                yield dbClient.put(putParams).promise();
            }
            catch (e) {
                logger_1.logger.log(e);
                throw new ConnectionError("Connection Error", e.statusCode, JSON.stringify(e));
            }
            return {
                statusCode: service_sdk_1.StatusCodes.OK
            };
        });
    }
    broadcast(input) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const apigwManagementApi = new AWS.ApiGatewayManagementApi({
                apiVersion: "2018-11-29",
                endpoint: process.env.SOCKET_API_GATEWAY_URL
            });
            const connectionIds = input.connectionIds;
            if (!connectionIds || connectionIds.length === 0) {
                return {
                    statusCode: service_sdk_1.StatusCodes.BAD_REQUEST,
                    message: "No connectionIds"
                };
            }
            const postData = input.body.data;
            const postCalls = connectionIds === null || connectionIds === void 0 ? void 0 : connectionIds.map((connectionId) => tslib_1.__awaiter(this, void 0, void 0, function* () {
                try {
                    yield apigwManagementApi
                        .postToConnection({ ConnectionId: connectionId, Data: postData })
                        .promise();
                }
                catch (e) {
                    if (e.statusCode === 410) {
                        logger_1.logger.log(`Found stale connection, deleting ${connectionId}`);
                        yield dbClient
                            .delete({
                            TableName: tableName,
                            Key: { connectionId }
                        })
                            .promise();
                    }
                    else {
                        logger_1.logger.log(JSON.stringify(e));
                        throw new BroadCastError("Broadcast Error", e.statusCode, JSON.stringify(e));
                    }
                }
            }));
            try {
                if (postCalls)
                    yield Promise.all(postCalls);
            }
            catch (e) {
                logger_1.logger.log(e);
                throw new BroadCastError("Broadcast Error", e.statusCode, JSON.stringify(e));
            }
            return {
                statusCode: service_sdk_1.StatusCodes.OK,
                message: "Data sent."
            };
        });
    }
    disconnect(event) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const connectionId = event.requestContext.connectionId;
            const delParams = {
                TableName: tableName,
                Key: {
                    connectionId
                }
            };
            try {
                yield dbClient.delete(delParams).promise();
            }
            catch (e) {
                logger_1.logger.log(e);
                throw new ConnectionError("Disconnect Error", e.statusCode, JSON.stringify(e));
            }
            return {
                statusCode: service_sdk_1.StatusCodes.OK
            };
        });
    }
}
exports.APIGatewayWebSocketService = APIGatewayWebSocketService;
//# sourceMappingURL=index.js.map