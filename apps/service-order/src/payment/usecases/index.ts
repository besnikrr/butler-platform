import { MikroORM } from "@mikro-orm/core";
import { Payment } from "../entity";
import updatePayment, { IUpdatePaymentInput } from "./update-payment";

export interface IPaymentUseCase {
  updatePayment(id: number, payment: IUpdatePaymentInput): Promise<Payment>;
}

export default (conn: MikroORM) => ({
  updatePayment: updatePayment(conn.em.getRepository(Payment))
});
