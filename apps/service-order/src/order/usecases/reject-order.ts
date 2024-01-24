import { Order } from "../entities/order";
import { OrderStatus } from "../shared/enums";
import { LockMode, MikroORM } from "@mikro-orm/core";
import { IsNotEmpty, IsNumber, IsPositive, IsString } from "class-validator";
import { getVoucherConnection, saveOrderAndClearCodeTransaction } from "./cancel-order";
import {
  NotFoundError,
  BadRequestError,
  WebSocketProvider,
  orderRejectEvent,
  getWebSocketService,
  WebSocketActionTypes,
  IWebsocketBroadcastMessageInput
} from "@butlerhospitality/service-sdk";

export interface IRejectOrderInput {
  version: number;
  reason: string;
}

export interface IRejectOrderOutput {

}

export class RejectOrderInput implements IRejectOrderInput {
  @IsPositive()
  @IsNumber()
  version: number;

  @IsString()
  @IsNotEmpty()
  reason: string;
}

export interface IRejectOrderDependency {
  conn: MikroORM;
  tenant: string;
}

export default ({ conn, tenant }: IRejectOrderDependency) => {
  return async (id: number, payload: IRejectOrderInput): Promise<IRejectOrderOutput> => {
    const order = await conn.em.findOne(Order, id, {
      lockVersion: payload.version,
      lockMode: LockMode.OPTIMISTIC
    });

    if (!order?.id) {
      throw new NotFoundError("Order");
    }

    if (order.status !== OrderStatus.PENDING) {
      throw new BadRequestError("Cannot reject order. Only orders with status PENDING can be rejected");
    }

    order.reason = payload.reason;
    order.status = OrderStatus.REJECTED;
    const voucherConn = await getVoucherConnection(tenant);
    await saveOrderAndClearCodeTransaction({ order, conn, voucherConn: voucherConn.conn });

    const socketService = getWebSocketService(WebSocketProvider.APIGATEWAY);
    const broadCastParameters: IWebsocketBroadcastMessageInput = {
      action: WebSocketActionTypes[orderRejectEvent].key,
      id
    };
    await socketService.broadcast(broadCastParameters);
    return order;
  };
};
