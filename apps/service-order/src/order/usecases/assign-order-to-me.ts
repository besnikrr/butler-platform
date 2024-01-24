import { IOrder } from "../entity";
import { User } from "../../user/entity";
import { OrderStatus } from "../shared/enums";
import { IsNumber, IsPositive } from "class-validator";
import { IValidateUsecase } from "../shared/interfaces";
import { OrderRepository, UserRepository } from "../repository";
import { BadRequestError, getWebSocketService, IAuthorizedUser, WebSocketActionTypes, WebSocketProvider, IWebsocketBroadcastMessageInput, orderAssignedEvent } from "@butlerhospitality/service-sdk";

export interface IAssignOrderToMeInput {
  version: number;
}

export interface IAssignOrderToMeOutput extends IOrder {}

export class AssignOrderInput implements IAssignOrderToMeInput {
  @IsNumber()
  @IsPositive()
  version: number;
}

export interface IAssignOrderToMeDependency extends IValidateUsecase {
  orderRepository: OrderRepository;
  userRepository: UserRepository;
  user: IAuthorizedUser;
}

export default (dependency: IAssignOrderToMeDependency) =>
  async (orderId: number, data: AssignOrderInput): Promise<IAssignOrderToMeOutput> => {
    const order = await dependency.orderRepository.getOneEntityOrFailWithLock(orderId, data.version);

    if (order.status !== OrderStatus.PENDING) {
      throw new BadRequestError(`An order must be ${OrderStatus.PENDING} before you can assign it to you.`);
    }

    order.meta.dispatcher = { id: dependency.user?.id } as User;
    await dependency.orderRepository.flush();

    const socketService = getWebSocketService(WebSocketProvider.APIGATEWAY);
    const broadCastParameters: IWebsocketBroadcastMessageInput = {
      action: WebSocketActionTypes[orderAssignedEvent].key,
      id: orderId
    };
    await socketService.broadcast(broadCastParameters);
    return order;
  };
