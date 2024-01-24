import {
  BadRequestError,
  PaymentProvider,
  getPaymentService,
  getServiceDBConnection
}
  from "@butlerhospitality/service-sdk";
import { IsEnum, IsNotEmpty, IsNumber, IsPositive, IsString } from "class-validator";
import { MikroORM, QueryOrder } from "@mikro-orm/core";
import { Order } from "@services/service-order/src/order/entities/order";
import { OrderRefund } from "@services/service-order/src/order/entities/refund";
import { AppEnum, PaymentType, PriceMeasurementType, VoucherPayer, VoucherType } from "@butlerhospitality/shared";
import Code from "@services/service-voucher/src/code/entities/code";
import { VoucherEntities } from "@services/service-voucher/src/entities";
import * as calculation from "@services/service-order/utils/calculation";
import { clearCodeBlock, fetchCodesBlock } from "@services/service-voucher/src/code/blocks";
import { OrderStatus } from "../shared/enums";
import { OrderRepository, OrderRefundRepository } from "../repository";
import { CodeRepository } from "@services/service-voucher/src/code/repository";

export interface IRefundOrderInput {
  reason: string;
  amount: number;
  version: number;
  type: PriceMeasurementType;
}

export interface IRefundOrderOutput {

}

export class RefundOrderInput implements IRefundOrderInput {
  @IsString()
  @IsNotEmpty()
  reason: string;

  @IsEnum(PriceMeasurementType)
  type: PriceMeasurementType;

  @IsNumber()
  @IsPositive()
  amount: number;

  @IsNumber()
  @IsPositive()
  version: number;
}

export interface IRefundOrderDependency {
  conn: MikroORM;
  tenant: string;
}

export default ({ conn, tenant }: IRefundOrderDependency) => {
  return async (id: number, payload: IRefundOrderInput): Promise<IRefundOrderOutput> => {
    const orderRepository = conn.em.getRepository(Order) as OrderRepository;
    const orderRefundRepository = conn.em.getRepository(OrderRefund) as OrderRefundRepository;

    const order = await orderRepository.getOneEntityOrFailWithLock(id, payload.version, ["vouchers"]);

    if (order.status !== OrderStatus.DELIVERED) {
      throw new BadRequestError(`Cannot refund order with status: ${order.status}.`);
    }

    const refund = await orderRefundRepository.findOne({ order }, {
      orderBy: {
        id: QueryOrder.DESC
      }
    });

    if (order.paymentType === PaymentType.CREDIT_CARD && refund?.amount >= payload.amount) {
      throw new BadRequestError("New refund amount cannot be lower or equal to previous amount");
    }

    const { conn: voucherConn } = await getVoucherConnection(tenant);

    let vouchers = [];
    if (order.vouchers.getItems().length) {
      const codes = await fetchCodesBlock({
        codeRepository: voucherConn.em.getRepository(Code)
      })(order.vouchers.getItems().map((orderVoucher) => orderVoucher.codeId));
      vouchers = transformCodesForCalculation(codes, order.paymentType);
    }

    const grandTotal = refund?.grandTotal ?? order.grandTotal;
    const hotelGrandTotal = refund?.hotelGrandTotal ?? order.hotelGrandTotal;
    const totalVoucherPrice = refund?.totalVoucherPrice ?? order.totalVoucherPrice ?? 0;

    const calculatedRefund = calculation.calculateRefund({
      grandTotal,
      hotelGrandTotal,
      totalVoucherPrice,
      refund: {
        type: payload.type,
        value: payload.amount
      },
      taxRate: order.meta.taxRate,
      vouchers
    });

    const {
      newGrandTotal,
      newHotelTax,
      newHotelTotalNet,
      newHotelGrandTotal,
      newTotalVoucherPrice,
      refundedGrandTotal,
      refundedTotalVoucherPrice
    } = calculatedRefund;

    try {
      await conn.em.begin();
      await voucherConn.em.begin();

      updateCalculatedFields(order, {
        newGrandTotal,
        newHotelTax,
        newHotelTotalNet,
        newHotelGrandTotal,
        newTotalVoucherPrice
      });

      const orderRefund = createRefund({
        order,
        grandTotal,
        hotelGrandTotal,
        totalVoucherPrice,
        type: payload.type,
        reason: payload.reason,
        amount: payload.amount
      });
      conn.em.persist(orderRefund);

      if (vouchers[0]?.type === VoucherType.PER_DIEM && refundedTotalVoucherPrice) {
        const codeRepository = voucherConn.em.getRepository(Code) as CodeRepository;
        await clearCodeBlock({ codeRepository })({
          codeIds: [vouchers[0].id],
          amount: refundedTotalVoucherPrice
        });
      }

      if (order.transactionId && order.paymentType === PaymentType.CREDIT_CARD && refundedGrandTotal > 0) {
        await getPaymentService(PaymentProvider.SQUARE).refund({
          reason: payload.reason,
          paymentId: order.transactionId,
          amount: refundedGrandTotal
        });
      }

      await conn.em.commit();
      await voucherConn.em.commit();
    } catch (error) {
      await conn.em.rollback();
      await voucherConn.em.rollback();
      throw error;
    }

    return {};
  };
};

interface IRefundPayload {
  order: Order;
  type: PriceMeasurementType;
  reason: string;
  amount: number;
  grandTotal: number;
  hotelGrandTotal: number;
  totalVoucherPrice: number;
}

const createRefund = (refund: IRefundPayload): OrderRefund => {
  const orderRefund = new OrderRefund();
  orderRefund.type = refund.type;
  orderRefund.order = refund.order;
  orderRefund.reason = refund.reason;
  orderRefund.amount = refund.amount;
  orderRefund.service = refund.order.service;
  orderRefund.grandTotal = refund.grandTotal;
  orderRefund.hotelGrandTotal = refund.hotelGrandTotal;
  orderRefund.totalVoucherPrice = refund.totalVoucherPrice;
  return orderRefund;
};

type ICalculatedFields = {
  newHotelTax: number;
  newGrandTotal: number;
  newHotelTotalNet: number;
  newHotelGrandTotal: number;
  newTotalVoucherPrice: number;
};

const updateCalculatedFields = (order: Order, calculatedFields: ICalculatedFields): void => {
  order.hotelTax = calculatedFields.newHotelTax;
  order.grandTotal = calculatedFields.newGrandTotal;
  order.hotelTotalNet = calculatedFields.newHotelTotalNet;
  order.hotelGrandTotal = calculatedFields.newHotelGrandTotal;
  order.totalVoucherPrice = calculatedFields.newTotalVoucherPrice;
};

const transformCodesForCalculation = (codes: Code[], paymentType: PaymentType) => {
  return codes?.map((code) => {
    return {
      id: code.program.id,
      paymentType,
      value: code.program.amount,
      valueUsed: code.amount_used,
      payerPercentage: code.program.payer_percentage,
      type: code.program.type as unknown as VoucherType,
      payer: code.program.payer as unknown as VoucherPayer
    };
  }) || [];
};

export const getVoucherConnection = (tenant: string) => {
  return getServiceDBConnection({
    tenant,
    service: AppEnum.VOUCHER,
    entities: VoucherEntities.asArray()
  });
};
