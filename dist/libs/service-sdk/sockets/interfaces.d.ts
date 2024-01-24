export interface IDefaultWebsocketService {
    connect: {};
    broadcast: {};
    disconnect: {};
}
export interface IWebsocketService extends IDefaultWebsocketService {
    connect(input: IWebsocketConnectInput): Promise<IWebsocketConnectOutput>;
    broadcast(input: IWebsocketBroadcastInput): Promise<IWebsocketBroadcastOutput>;
    disconnect(input: IWebscoketDisconnectInput): Promise<IWebscoketDisconnectOutput>;
}
interface IWebsocketInput {
    connectionId: string;
}
interface IWebsocketOutput {
    statusCode: number;
    message?: string;
}
export interface IWebsocketConnectInput extends IWebsocketInput {
}
export declare const WebSocketActionTypes: {
    "order-paid": {
        key: string;
        label: string;
    };
    "order-updated": {
        key: string;
        label: string;
    };
    "order-created": {
        key: string;
        label: string;
    };
    "order-cancelled": {
        key: string;
        label: string;
    };
    "order-delivered": {
        key: string;
        label: string;
    };
    "order-received": {
        key: string;
        label: string;
    };
    "order-refunden": {
        key: string;
        label: string;
    };
    "order-confirmed": {
        key: string;
        label: string;
    };
    "order-rejected": {
        key: string;
        label: string;
    };
    "order-comment": {
        key: string;
        label: string;
    };
    "order-assinged": {
        key: string;
        label: string;
    };
    "order-merged": {
        key: string;
        label: string;
    };
    "mark-order-as-read": {
        key: string;
        label: string;
    };
    "order-update-tip": {
        key: string;
        label: string;
    };
    "order-update-kitchen-confirm-date": {
        key: string;
        label: string;
    };
};
export interface IWebsocketBroadcastInput {
    connectionIds: string[];
    body: {
        action: string;
        data: string;
    };
}
export interface IWebsocketConnectOutput extends IWebsocketOutput {
}
export interface IWebsocketBroadcastOutput extends IWebsocketOutput {
}
export interface IWebscoketDisconnectInput extends IWebsocketInput {
}
export interface IWebscoketDisconnectOutput extends IWebsocketOutput {
}
export declare enum WebSocketProvider {
    APIGATEWAY = 0
}
export {};
