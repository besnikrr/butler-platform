import { CustomEntityRepository, logger } from "@butlerhospitality/service-sdk";
import { Currency, IOrder, OrderTransactionLog, TransactionType } from "../entity";

export interface IOrderTransactionLogRepository extends CustomEntityRepository<OrderTransactionLog> {
  log: (order: IOrder) => Promise<void>;
}

export class OrderTransactionLogRepository extends
  CustomEntityRepository<OrderTransactionLog> implements IOrderTransactionLogRepository {
  public async log(order: IOrder) {
    try {
      const orderTransactionLog = this.create({
        order: order.id,
        service: order.service.id,
        type: TransactionType[order.paymentType],
        currency: Currency.USD,
        transactionId: order.transactionId,
        amount: order.tip
      });

      await this.persistAndFlush(orderTransactionLog);
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

