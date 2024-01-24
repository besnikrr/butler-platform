import { CustomEntityRepository, logger } from "@butlerhospitality/service-sdk";
import { Payment, PaymentStatus } from "../../payment/entity";
import { IOrder } from "../entity";

export interface IAddOrderPayment extends IOrder { }

export interface IOrderPaymentRepository extends CustomEntityRepository<Payment> {
  succeeded: (data: IAddOrderPayment) => Promise<void>;
  failed: (data: IAddOrderPayment) => Promise<void>;
}

export class OrderPaymentRepository extends CustomEntityRepository<Payment> implements IOrderPaymentRepository {
  private createPayment = (data: IAddOrderPayment, status: PaymentStatus) => {
    return this.create({
      order: data.id,
      service: data.service.id,
      paymentType: data.paymentType,
      status: status,
      transactionId: data.transactionId,
      tip: data.tip,
      tax: data.tax,
      totalNet: data.totalNet,
      totalGross: data.totalGross,
      grandTotal: data.grandTotal,
      hotelTax: data.hotelTax,
      hotelTotalNet: data.hotelTotalNet,
      hotelTotalGross: data.hotelTotalGross,
      hotelGrandTotal: data.hotelGrandTotal,
      receiptAmount: data.receiptAmount
    });
  };

  public async succeeded(data: IAddOrderPayment) {
    try {
      const payment = this.createPayment(data, PaymentStatus.SUCCESS);

      await this.persistAndFlush(payment);
    } catch (err) {
      // TBD - probably save the logs in a file
      /*
        Not throwing the error here the reason being that we dont want to rollback
        and cancel the order because the transaction log failed
      */
      logger.log("err", err);
    }
  }

  public async failed(data: IAddOrderPayment) {
    try {
      const payment = this.createPayment(data, PaymentStatus.FAILURE);

      await this.persistAndFlush(payment);
    } catch (err) {
      // TBD - probably save the logs in a file
      /*
        Not throwing the error here the reason being that we dont want to rollback
        and cancel the order because the transaction log failed
      */
      logger.log("err", err);
    }
  }
}
