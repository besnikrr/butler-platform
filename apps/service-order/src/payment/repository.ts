import { CustomEntityRepository } from "@butlerhospitality/service-sdk";
import { Payment } from "./entity";

export interface IPaymentRepository extends CustomEntityRepository<Payment> {}

export class PaymentRepository extends CustomEntityRepository<Payment> implements IPaymentRepository {}
