import { BaseError } from "libs/service-sdk";
import { Client } from "square";
import { IPaymentService, IUpdatePaymentInput, ICreatePaymentInput, IRefundPaymentInput, ICancelPaymentInput, IUpdatePaymentOutput, ICancelPaymentOutput, ICreatePaymentOutput, IRefundPaymentOutput, ICompletePaymentInput, ICompletePaymentOutput } from "../interfaces";
export declare class InvalidTokenError extends BaseError {
}
export declare class InvalidRefundError extends BaseError {
}
export declare class InvalidUpdateError extends BaseError {
}
export declare class InvalidCancelError extends BaseError {
}
export declare class InvalidCompleteError extends BaseError {
}
export declare class InvalidCreateCardError extends BaseError {
}
export declare class InvalidCreateCustomerError extends BaseError {
}
export declare class SquareService implements IPaymentService {
    client: Client;
    pay(input: ICreatePaymentInput): Promise<ICreatePaymentOutput>;
    refund(input: IRefundPaymentInput): Promise<IRefundPaymentOutput>;
    update(input: IUpdatePaymentInput): Promise<IUpdatePaymentOutput>;
    complete(input: ICompletePaymentInput): Promise<ICompletePaymentOutput>;
    cancel(input: ICancelPaymentInput): Promise<ICancelPaymentOutput>;
    private createCustomer;
    private createCard;
    private createPayment;
    private refundPayment;
    private updatePayment;
    private cancelPayment;
    private completePayment;
}
