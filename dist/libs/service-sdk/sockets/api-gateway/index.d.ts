import { BaseError } from "libs/service-sdk";
import { IWebsocketService, IWebsocketBroadcastInput, IWebsocketBroadcastOutput, IWebscoketDisconnectOutput } from "../interfaces";
export declare class ConnectionError extends BaseError {
}
export declare class BroadCastError extends BaseError {
}
export declare class APIGatewayWebSocketService implements IWebsocketService {
    connect(event: any): Promise<IWebsocketBroadcastOutput>;
    broadcast(input: IWebsocketBroadcastInput): Promise<IWebsocketBroadcastOutput>;
    disconnect(event: any): Promise<IWebscoketDisconnectOutput>;
}
