import { Order } from "../entities/order";
import { OrderVoucher } from "../entities/voucher";
import { AppEnum } from "@butlerhospitality/shared";
import { LockMode, MikroORM } from "@mikro-orm/core";
import { OrderStatus } from "../shared/enums";
import Code from "@services/service-voucher/src/code/entities/code";
import { IsNotEmpty, IsNumber, IsPositive } from "class-validator";
import { VoucherEntities } from "@services/service-voucher/src/entities";
import { clearCodeBlock } from "@services/service-voucher/src/code/blocks";
import { IClearCodeInput } from "@services/service-voucher/src/code/blocks/clear-code";
import { VoucherType } from "@butlerhospitality/shared";
import {
  NotFoundError,
  BadRequestError,
  PaymentProvider,
  getPaymentService,
  WebSocketProvider,
  getWebSocketService,
  orderCancelledEvent,
  WebSocketActionTypes,
  getServiceDBConnection,
  IWebsocketBroadcastMessageInput
}
  from "@butlerhospitality/service-sdk";

export interface ICancelOrderInput {
  version: number;
  reason: string;
}

export interface ICancelOrderOutput {
}

export class CancelOrderInput implements ICancelOrderInput {
  @IsPositive()
  @IsNumber()
  version: number;

  @IsNotEmpty()
  reason: string;
}

export interface ICancelOrderDependency {
  conn: MikroORM;
  tenant: string;
}

export default ({ conn, tenant }: ICancelOrderDependency) => {
  return async (id: number, payload: ICancelOrderInput): Promise<ICancelOrderOutput | Error> => {
    const order = await conn.em.findOne(Order, id, {
      lockMode: LockMode.OPTIMISTIC,
      lockVersion: payload.version
    });

    if (!order?.id) {
      throw new NotFoundError("Order");
    }

    if (![OrderStatus.PREPARATION, OrderStatus.IN_DELIVERY, OrderStatus.CONFIRMATION, OrderStatus.PENDING]
      .includes(order.status)) {
      throw new BadRequestError(`Cannot cancel order with status: ${order.status}. Only order with statuses: ${OrderStatus.PREPARATION}, ${OrderStatus.IN_DELIVERY}, ${OrderStatus.CONFIRMATION} or ${OrderStatus.PENDING} can be cancelled`);
    }

    order.reason = payload.reason;
    order.status = OrderStatus.CANCELLED;
    const { conn: voucherConn } = await getVoucherConnection(tenant);
    await saveOrderAndClearCodeTransaction({ order, conn, voucherConn });

    const socketService = getWebSocketService(WebSocketProvider.APIGATEWAY);
    const broadCastParameters: IWebsocketBroadcastMessageInput = {
      action: WebSocketActionTypes[orderCancelledEvent].key,
      id
    };
    await socketService.broadcast(broadCastParameters);

    return order;
  };
};

export const saveOrderAndClearCodeTransaction = async ({ order, conn, voucherConn }) => {
  try {
    await conn.em.begin();
    await voucherConn.em.begin();

    await conn.em.flush();

    const orderVouchers = await conn.em.find(OrderVoucher, { order });
    const refundPayload: IClearCodeInput = { codeIds: orderVouchers?.map((orderVoucher) => orderVoucher.codeId) };
    if (orderVouchers?.[0]?.type === VoucherType.PER_DIEM) {
      refundPayload.amount = orderVouchers[0].amount;
    }
    const codeRepo = voucherConn.em.getRepository(Code);
    await clearCodeBlock({ codeRepository: codeRepo })(refundPayload);

    if (order.transactionId) {
      await getPaymentService(PaymentProvider.SQUARE).cancel(order.transactionId);
    }

    await conn.em.commit();
    await voucherConn.em.commit();
  } catch (error) {
    await conn.em.rollback();
    await voucherConn.em.rollback();
  }
};

export const getVoucherConnection = (tenant: string) => {
  return getServiceDBConnection({
    tenant,
    service: AppEnum.VOUCHER,
    entities: VoucherEntities.asArray()
  });
};
