import { DeliveredLocation, OrderStatus } from "../shared/enums";
import { UserRepository } from "../../user/repository";
import { EntityManager } from "@mikro-orm/postgresql";
import { Payment } from "../../payment/entity";
import { PaymentType } from "@butlerhospitality/shared";
import { User, Carrier, CarrierStatus } from "../../user/entity";
import { IOrder, Order, OrderTransactionLog } from "../entity";
import { IsNotEmpty, IsNumber, IsString, IsISO8601, IsOptional } from "class-validator";
import { ICompletePaymentInput, PaymentProvider } from "libs/service-sdk/payment/interfaces";
import { OrderPaymentRepository, OrderRepository, OrderTransactionLogRepository } from "../repository";
import * as segment from "../shared/segment";
import {
  validate,
  BadRequestError,
  getPaymentService,
  WebSocketProvider,
  PostRoomChargeType,
  getWebSocketService,
  orderDeliveredEvent,
  WebSocketActionTypes,
  getPostRoomChargeService,
  IWebsocketBroadcastMessageInput
} from "@butlerhospitality/service-sdk";

export interface IDeliverOrderDependency {
  em: EntityManager;
  validate: boolean;
  tenant: string;
}

export class DeliverOrderInput implements IDeliverOrderInput {
  @IsNumber()
  @IsNotEmpty()
  version: number;

  @IsNumber()
  @IsNotEmpty()
  carrierId: number;

  @IsString()
  @IsNotEmpty()
  notes: string;

  @IsNumber()
  @IsNotEmpty()
  tip: number;

  @IsNumber()
  @IsNotEmpty()
  imageId: number;

  @IsISO8601()
  @IsOptional()
  deliveryDate?: string;
}

export interface IDeliverOrderInput {
  version: number,
  carrierId: number,
  notes: string,
  tip: number,
  imageId: number;
  deliveryDate?: string
}

export interface IDeliverOrderOutput extends IOrder { }

class CompletePaymentError extends BadRequestError { }

export default (dependency: IDeliverOrderDependency) =>
  async (id: number, data: IDeliverOrderInput): Promise<IDeliverOrderOutput> => {
    await validate(DeliverOrderInput, data, dependency.validate);

    const orderRepository = dependency.em.getRepository(Order) as OrderRepository;
    const orderTransactionRepository =
      dependency.em.getRepository(OrderTransactionLog) as OrderTransactionLogRepository;
    const orderPaymentRepository = dependency.em.getRepository(Payment) as OrderPaymentRepository;
    const userRepository = dependency.em.getRepository(User) as UserRepository;

    const order = await orderRepository.getOneEntityOrFailWithLock(id, data.version, ["meta.foodCarrier"]);

    if (order.status == OrderStatus.DELIVERED) {
      throw new BadRequestError("Order already delivered");
    } else if (order.status !== OrderStatus.IN_DELIVERY) {
      throw new BadRequestError("Order can not be delivered as it is not in delivery");
    } else if (order.meta.foodCarrier?.id !== data.carrierId) {
      throw new BadRequestError("Order is not assigned to this food carrier");
    }

    const user = await userRepository.getOneEntityOrFail({ userId: data.carrierId, role: Carrier.FOOD_CARRIER });

    await dependency.em.begin();
    try {
      includeTipInOrder(order, data);
      updateOrderStatus(order);
      await updateCarrierStatus(data.carrierId, id, user, orderRepository);

      await segment.orderDelivered(order.client.phoneNumber, {
        deliveredLocation: DeliveredLocation.DELIVERED_TO_GUEST, // TODO
        clientName: order.client.name,
        hotelId: order.meta.hotelId,
        hotelName: order.meta.hotelName,
        orderId: order.id,
        phoneNumber: order.client.phoneNumber,
        deliveredDate: order.deliveryDate
      });

      await completePayment({ paymentId: order.transactionId });

      if (order.meta.pmsId && order.paymentType === PaymentType.CHARGE_TO_ROOM && order.grandTotal != 0) {
        await postRoomChargeService(order);
      }

      // TODO finish the implementation of the function below
      if (order.meta.pmsId) {
        await sendSMS();
      }

      order.deliveryDate = data.deliveryDate ? new Date(data.deliveryDate) : new Date();

      await dependency.em.commit();
      await orderTransactionRepository.log(order);
      await orderPaymentRepository.succeeded(order);
    } catch (err) {
      await dependency.em.rollback();
      if (err instanceof CompletePaymentError) {
        dependency.em.clear();
        await orderPaymentRepository.failed(order);
      }
      throw err;
    }

    const socketService = getWebSocketService(WebSocketProvider.APIGATEWAY);
    const broadCastParameters: IWebsocketBroadcastMessageInput = {
      action: WebSocketActionTypes[orderDeliveredEvent].key,
      id
    };
    await socketService.broadcast(broadCastParameters);

    return order;
  };

const includeTipInOrder = (order: IOrder, data: IDeliverOrderInput): void => {
  order.grandTotal += data.tip;
  order.tip += data.tip;
  order.comment = data.notes;
  if (order.paymentType === PaymentType.CHARGE_TO_ROOM) {
    order.hotelGrandTotal += data.tip;
  }
};

const updateCarrierStatus = async (
  carrierId: number,
  orderId: number,
  user: User,
  orderRepository: OrderRepository
) => {
  const userOrders = await orderRepository.find({
    meta: { foodCarrier: carrierId },
    status: { $nin: [OrderStatus.DELIVERED, OrderStatus.CANCELLED] },
    id: { $ne: orderId }
  });

  if (userOrders.length > 0) {
    user.carrierStatus = CarrierStatus.OUT_FOR_DELIVERY;
  } else {
    user.carrierStatus = CarrierStatus.RETURNING;
  }
};

const updateOrderStatus = (order: IOrder) => {
  order.status = OrderStatus.DELIVERED;
};

const completePayment = async (input: ICompletePaymentInput) => {
  try {
    return await getPaymentService(PaymentProvider.SQUARE).complete(input);
  } catch (err) {
    throw new CompletePaymentError("Payment could not be completed");
  }
};

// TBD - SQU5-371
const postRoomChargeService = async (order: IOrder) => {
  try {
    await getPostRoomChargeService(PostRoomChargeType.PMS).post({
      room_number: order.meta.roomNumber,
      oms_hotel_id: order.meta.hotelId,
      amount: order.grandTotal,
      order_id: order.id,
      status: order.status
    });
  } catch (err) {
    throw new BadRequestError("Post room charge service failed");
  }
};

// TBD - SQU5-371
const sendSMS = async () => {
  return new Promise((resolve, reject) => {
    resolve("SMS sent");
  });
};
