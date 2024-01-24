import { IOrder } from "../entity";
import { wrap } from "@mikro-orm/core";
import { OrderStatus } from "../shared/enums";
import { CarrierStatus } from "../../user/entity";
import { IsInt, IsNotEmpty } from "class-validator";
import { IValidateUsecase } from "../shared/interfaces";
import { OrderRepository, UserRepository } from "../repository";
import {
  BadRequestError,
  WebSocketProvider,
  getWebSocketService,
  orderRemoveFoodCarrier,
  WebSocketActionTypes,
  IWebsocketBroadcastMessageInput
} from "@butlerhospitality/service-sdk";

export interface IRemoveFoodCarrierDependency extends IValidateUsecase{
	orderRepository: OrderRepository;
	userRepository: UserRepository;
}

export interface IRemoveFoodCarriedInput {
	version: number;
}

export class RemoveFoodCarrierInput implements IRemoveFoodCarriedInput {
	@IsInt()
	@IsNotEmpty()
	version: number;
}

export interface IRemoveFoodCarrierOutput extends IOrder { }

export default (dependency: IRemoveFoodCarrierDependency) => {
  return async (orderId: number, data: IRemoveFoodCarriedInput): Promise<IRemoveFoodCarrierOutput> => {
    const order = await dependency.orderRepository.getOneEntityOrFailWithLock(orderId, data.version);
    if (![OrderStatus.IN_DELIVERY, OrderStatus.PREPARATION].includes(order.status)) {
      throw new
      BadRequestError(`An order must be ${OrderStatus.PREPARATION} or ${OrderStatus.IN_DELIVERY} before you can remove the food carrier.`);
    }

    if (order.meta.foodCarrier === null) {
      throw new BadRequestError("This order has not been assigned to a food carrier.");
    }

    const orders = await dependency.orderRepository.find({
      meta: {
        foodCarrier: order.meta.foodCarrier
      },
      status: { $in: [OrderStatus.PREPARATION, OrderStatus.IN_DELIVERY] }
    });

    if (orders.length <= 1) {
      const user = await dependency.userRepository.getOneEntityOrFail(order.meta.foodCarrier.id);
      wrap(user).assign({ "carrierStatus": CarrierStatus.IDLE });
      await dependency.userRepository.flush();
    }

    order.meta.assignDate = null;
    order.meta.foodCarrier = null;
    order.status = OrderStatus.PREPARATION;
    await dependency.orderRepository.flush();

    const socketService = getWebSocketService(WebSocketProvider.APIGATEWAY);
    const broadCastParameters: IWebsocketBroadcastMessageInput = {
      action: WebSocketActionTypes[orderRemoveFoodCarrier].key,
      id: orderId
    };
    await socketService.broadcast(broadCastParameters);
    return order;
  };
};
