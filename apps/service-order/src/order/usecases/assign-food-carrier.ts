import { Order, IOrder } from "../entity";
import { OrderStatus } from "../shared/enums";
import { IsInt, IsNotEmpty, IsDateString } from "class-validator";
import { OrderRepository, UserRepository } from "../repository";
import {
  BadRequestError,
  WebSocketProvider,
  getWebSocketService,
  WebSocketActionTypes,
  IWebsocketBroadcastMessageInput,
  orderAssignedEvent
} from "@butlerhospitality/service-sdk";

export interface IAssignOrderToFoodCarrierInput {
  userId: number;
  version: number;
  assignDate: Date;
}

export interface IAssignOrderToFoodCarrierOutput extends IOrder { }

export class AssignOrderToFoodCarrierInput implements IAssignOrderToFoodCarrierInput {
  @IsInt()
  @IsNotEmpty()
  userId: number;

  @IsInt()
  @IsNotEmpty()
  version: number;

  @IsDateString()
  @IsNotEmpty()
  assignDate: Date;
}

export interface IValidateUsecase {
  validate: boolean;
}
export interface IAssignOrderToFoodCarrierDependency extends IValidateUsecase {
  orderRepository: OrderRepository;
  userRepository: UserRepository;
  tenant: string;
}

function updateOrderMeta(orderRepository: OrderRepository, userRepository: UserRepository) {
  return async (order: Order, carrierId: number, assignDate: Date) => {
    const user = await userRepository.getOneEntityOrFail(carrierId);
    order.meta.assignDate = assignDate;
    order.meta.foodCarrier = user;
    return orderRepository.flush();
  };
}

export default (dependency: IAssignOrderToFoodCarrierDependency) => {
  return async (orderId: number, data: IAssignOrderToFoodCarrierInput): Promise<IAssignOrderToFoodCarrierOutput> => {
    const order = await dependency.orderRepository.getOneEntityOrFailWithLock(orderId, data.version);

    if (order.status !== OrderStatus.PREPARATION) {
      throw new BadRequestError(`An order must be in preparation before you can assign it to a food carrier.`);
    }

    if (order.meta.foodCarrier !== null) {
      throw new BadRequestError("This order has already been assigned to another carrier.");
    }

    await updateOrderMeta(
      dependency.orderRepository,
      dependency.userRepository
    )(order, data.userId, data.assignDate);

    const socketService = getWebSocketService(WebSocketProvider.APIGATEWAY);
    const broadCastParameters: IWebsocketBroadcastMessageInput = {
      action: WebSocketActionTypes[orderAssignedEvent].key,
      id: orderId
    };
    await socketService.broadcast(broadCastParameters);

    return order;
  };
};
