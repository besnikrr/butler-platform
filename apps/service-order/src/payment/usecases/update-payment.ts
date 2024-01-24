import { IsNotEmpty, IsString } from "class-validator";
import { PaymentRepository } from "../repository";

export interface IUpdatePaymentInput {
  transactionId: string;
}

export interface IUpdatePaymentOuput {
  transactionId: string;
}

export class UpdatePaymentInput implements IUpdatePaymentInput {
  @IsString()
  @IsNotEmpty()
  transactionId!: string;
}

export default (paymentRepository: PaymentRepository) => {
  return async (id: number, data: IUpdatePaymentInput): Promise<IUpdatePaymentOuput> => {
    const payment = await paymentRepository.getOneEntityOrFail(id);
    paymentRepository.assign(payment, data);
    await paymentRepository.flush();
    return {
      transactionId: payment.transactionId
    };
  };
};
