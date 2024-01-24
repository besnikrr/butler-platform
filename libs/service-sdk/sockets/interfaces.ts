export interface IDefaultWebsocketService {
  connect: {};
  broadcast: {};
  disconnect: {};
}

export interface IWebsocketService extends IDefaultWebsocketService {
  connect(input: IWebsocketConnectInput): Promise<IWebsocketConnectOutput>;
  broadcast(input: IWebsocketBroadcastMessageInput): Promise<IWebsocketBroadcastOutput>;
  disconnect(input: IWebscoketDisconnectInput): Promise<IWebscoketDisconnectOutput>;
}

interface IWebsocketInput {
  connectionId: string;
}

interface IWebsocketOutput {
  statusCode: number;
  message?: string;
}

export interface IWebsocketConnectInput extends IWebsocketInput { }
export const orderAssignedEvent = "order-assigned";
export const orderPickupEvent = "order-pickup";
export const orderRejectEvent = "order-reject";
export const orderUpdatedEvent = "order-updated";
export const orderUpdateTip = "order-update-tip";
export const orderCreatedEvent = "order-created";
export const orderCancelledEvent = "order-cancelled";
export const orderDeliveredEvent = "order-delivered";
export const orderConfirmedEvent = "order-confirmed";
export const orderCompletedEvent = "order-completed";
export const markOrderAsReadEvent = "mark-order-as-read";
export const orderRemoveFoodCarrier = "order-remove-food-carrier";
export const orderUpdateKitchenConfirmDate = "order-update-kitchen-confirm-date";

// SQU5-428
export const WebSocketActionTypes = {
  [orderPickupEvent]: {
    key: "order-pickup"
  },
  [orderUpdatedEvent]: {
    key: "order-updated"
  },
  [orderCreatedEvent]: {
    key: "order-created"
  },
  [orderCancelledEvent]: {
    key: "order-cancelled"
  },
  [orderDeliveredEvent]: {
    key: "order-delivered"
  },
  [orderConfirmedEvent]: {
    key: "order-confirmed"
  },
  [orderCompletedEvent]: {
    key: "order-completed"
  },
  [orderRejectEvent]: {
    key: "order-rejected"
  },
  [orderAssignedEvent]: {
    key: "order-assigned"
  },
  [markOrderAsReadEvent]: {
    key: "mark-order-as-read"
  },
  [orderRemoveFoodCarrier]: {
    key: "order-remove-food-carrier"
  },
  [orderUpdateTip]: {
    key: "order-update-tip"
  },
  [orderUpdateKitchenConfirmDate]: {
    key: "order-update-kitchen-confirm-date"
  }
};

export interface IWebsocketBroadcastInput {
  connectionIds: string[],
  body: {
    action: string,
    id?: number,
    data: string;
  };
}

export interface IWebsocketBroadcastMessageInput {
  action: string;
  id?: number;
  connectionIds?: string[],
}

export interface IWebsocketConnectOutput extends IWebsocketOutput { }

export interface IWebsocketBroadcastOutput extends IWebsocketOutput { }

export interface IWebscoketDisconnectInput extends IWebsocketInput { }

export interface IWebscoketDisconnectOutput extends IWebsocketOutput { }

export enum WebSocketProvider {
  APIGATEWAY
}

