import { getWebSocketService, IWebsocketBroadcastMessageInput, markOrderAsReadEvent, WebSocketActionTypes, WebSocketProvider } from "@butlerhospitality/service-sdk";
import { IOrder } from "../entity";
import { OrderRepository } from "../repository";

export interface IGetOrderDependency {
  orderRepository: OrderRepository;
}

export interface IGetOrderOutput extends IOrder { }

export default (dependency: IGetOrderDependency) => async (id: number): Promise<IOrder> => {
  const orderRepository = dependency.orderRepository as OrderRepository;

  const order = await orderRepository.getOneEntityOrFail(id);

  if (!order.isRead) {
    const socketService = getWebSocketService(WebSocketProvider.APIGATEWAY);
    const broadCastParameters: IWebsocketBroadcastMessageInput = {
      action: WebSocketActionTypes[markOrderAsReadEvent].key,
      id
    };

    await socketService.broadcast(broadCastParameters);
    await orderRepository.markAsRead(order);
  }

  return orderRepository.applyRelationsToOrder(order);
};
