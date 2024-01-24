export interface IDefaultPayment {
    pay: {};
    refund: {};
    cancel: {};
}
export interface IPaymentService {
    pay(input: ICreatePaymentInput): Promise<ICreatePaymentOutput>;
    refund(input: IRefundPaymentInput): Promise<IRefundPaymentOutput>;
    update(input: IUpdatePaymentInput): Promise<IUpdatePaymentOutput>;
    cancel(input: ICancelPaymentInput): Promise<ICancelPaymentOutput>;
    complete(input: ICancelPaymentInput): Promise<ICancelPaymentOutput>;
}
export declare enum PaymentProvider {
    SQUARE = 0
}
export declare enum Currencies {
    USD = "USD"
}
export interface ICreateCustomerInput {
    clientName: string;
    clientEmail: string;
    clientPhoneNumber: string;
}
export interface ICreateCustomerOutput {
    id: string;
}
export interface ICreateCardInput {
    nonce: string;
}
export interface ICreateCardOutput {
    id: string;
}
export interface ICreatePaymentInput extends ICreateCardInput, ICreateCustomerInput {
    amount: number;
    tip?: number;
}
export interface ICreatePaymentOutput {
    transactionId: string;
    versionToken: string;
}
export interface IRefundPaymentInput {
    paymentId: string;
    amount: number;
    reason: string;
}
export interface IRefundPaymentOutput {
    id: string;
}
export interface IUpdatePaymentInput {
    paymentId: string;
    amount: number;
    tip?: number;
}
export interface IUpdatePaymentOutput {
    id: string;
}
export interface ICancelPaymentInput {
    paymentId: string;
}
export interface ICancelPaymentOutput {
    id: string;
}
export interface ICompletePaymentInput {
    paymentId: string;
    versionToken?: string;
}
export interface ICompletePaymentOutput {
    id: string;
}
