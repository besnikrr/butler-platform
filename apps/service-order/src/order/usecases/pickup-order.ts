import { MikroORM } from "@mikro-orm/core";
import { OrderStatus } from "../shared/enums";
import { Order, OrderStatusChange } from "../entity";
import { CarrierStatus, User } from "../../user/entity";
import { IValidateUsecase } from "../shared/interfaces";
import { IsInt, IsNotEmpty, IsDateString } from "class-validator";
import { OrderRepository, OrderStatusChangeRepository, UserRepository } from "../repository";
import {
  validate,
  BadRequestError,
  orderPickupEvent,
  WebSocketProvider,
  getWebSocketService,
  WebSocketActionTypes,
  IWebsocketBroadcastMessageInput
} from "@butlerhospitality/service-sdk";

export interface IPickupOrderInput {
  userId: number;
  version: number;
  pickupDate: Date;
}

export interface IPickupOrderOutput extends Order { }

export class PickupOrderInput implements IPickupOrderInput {
  @IsInt()
  @IsNotEmpty()
  userId: number;

  @IsInt()
  @IsNotEmpty()
  version: number;

  @IsDateString()
  @IsNotEmpty()
  pickupDate: Date;
}
export interface ICreateOrderStatusChange {
  userId: number;
  date: Date;
  status: OrderStatus;
}

export interface IPickupOrderDependency extends IValidateUsecase {
  conn: MikroORM;
  tenant: string;
}

export default (dependency: IPickupOrderDependency) => {
  return async (orderId: number, data: IPickupOrderInput): Promise<IPickupOrderOutput> => {
    await validate(PickupOrderInput, data, dependency.validate);
    const orderRepository =
      dependency.conn.em.getRepository(Order) as OrderRepository;
    const userRepository =
      dependency.conn.em.getRepository(User) as UserRepository;
    const orderStatusChangeRepository =
      dependency.conn.em.getRepository(OrderStatusChange) as OrderStatusChangeRepository;

    const order = await validateIfOrderExists(orderRepository)(orderId, data.version);

    await dependency.conn.em.begin();

    try {
      await updateOrder(
        userRepository
      )(
        order,
        OrderStatus.IN_DELIVERY,
        data.userId
      );

      await addOrderStatus(
        orderStatusChangeRepository
      )(
        order,
        { userId: data.userId, status: OrderStatus.IN_DELIVERY, date: data.pickupDate }
      );

      await updateCarrierStatus(userRepository)(data.userId, CarrierStatus.OUT_FOR_DELIVERY);

      await dependency.conn.em.commit();
    } catch (error) {
      await dependency.conn.em.rollback();

      throw error;
    }
    const socketService = getWebSocketService(WebSocketProvider.APIGATEWAY);
    const broadCastParameters: IWebsocketBroadcastMessageInput = {
      action: WebSocketActionTypes[orderPickupEvent].key,
      id: orderId
    };
    await socketService.broadcast(broadCastParameters);

    return order;
  };
};

function updateOrder(userRepository: UserRepository) {
  return async (order: Order, status: OrderStatus, userId: number) => {
    const foodCarrier = await userRepository.getOneEntityOrFail(userId);
    order.status = status;
    order.meta.foodCarrier = foodCarrier;
  };
}

function validateIfOrderExists(orderRepository: OrderRepository) {
  return async (id: number, version: number) => {
    const order = await orderRepository.getOneEntityOrFailWithLock(id, version);

    if (order.status !== OrderStatus.PREPARATION) {
      throw new BadRequestError(
        `An order in '${order.status}' status can not be picked up.`
      );
    }

    return order;
  };
}

function addOrderStatus(statusChangeRepository: OrderStatusChangeRepository) {
  return async (order: Order, data: ICreateOrderStatusChange) => {
    const orderStatusChange = statusChangeRepository.create({
      order,
      userId: data.userId,
      status: data.status,
      statusDate: data.date
    });

    statusChangeRepository.persist(orderStatusChange);
  };
}

function updateCarrierStatus(userRepository: UserRepository) {
  return async (userId: number, status: CarrierStatus) => {
    const foodCarrier = await userRepository.getOneEntityOrFail(userId);
    foodCarrier.carrierStatus = status;
    return foodCarrier;
  };
}
