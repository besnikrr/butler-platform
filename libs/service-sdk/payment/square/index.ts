import { uuidv4 } from "@butlerhospitality/shared";
import { BaseError } from "libs/service-sdk";
import {
  Card,
  Money,
  Client,
  Payment,
  ApiError,
  Environment,
  CreateCardRequest,
  CreatePaymentRequest,
  RefundPaymentRequest,
  UpdatePaymentRequest,
  CreateCustomerRequest,
  CompletePaymentRequest
} from "square";
import {
  Currencies,
  IPaymentService,
  ICreateCardOutput,
  IUpdatePaymentInput,
  ICreatePaymentInput,
  IRefundPaymentInput,
  ICancelPaymentInput,
  IUpdatePaymentOutput,
  ICancelPaymentOutput,
  ICreatePaymentOutput,
  IRefundPaymentOutput,
  ICompletePaymentInput,
  ICreateCustomerOutput,
  ICompletePaymentOutput
} from "../interfaces";

export class InvalidTokenError extends BaseError {}
export class InvalidRefundError extends BaseError {}
export class InvalidUpdateError extends BaseError {}
export class InvalidCancelError extends BaseError {}
export class InvalidCompleteError extends BaseError {}
export class InvalidCreateCardError extends BaseError {}
export class InvalidCreateCustomerError extends BaseError {}

export class SquareService implements IPaymentService {
  client = new Client({
    environment: process.env.STAGE === "local" || process.env.STAGE === "development" ?
      Environment.Sandbox : Environment.Production,
    accessToken: process.env.SQUARE_ACCESS_TOKEN
  });

  async pay(input: ICreatePaymentInput): Promise<ICreatePaymentOutput> {
    const bodyForCustomerRequest: CreateCustomerRequest = {};
    bodyForCustomerRequest.emailAddress = input.clientEmail;
    bodyForCustomerRequest.phoneNumber = input.clientPhoneNumber;
    bodyForCustomerRequest.givenName = input.clientName.substring(0, input.clientName.lastIndexOf(" ") + 1);
    bodyForCustomerRequest.familyName = input.clientName.substring(input.clientName.lastIndexOf(" ") + 1,
      input.clientName.length);
    const customer = await this.createCustomer(bodyForCustomerRequest);

    const bodyCard: Card = {};
    bodyCard.customerId = customer.id;

    const bodyForCardRequest: CreateCardRequest = {
      card: bodyCard,
      sourceId: input.nonce,
      idempotencyKey: uuidv4()
    };

    const card = await this.createCard(bodyForCardRequest);
    const bodyAmountMoney: Money = {};

    bodyAmountMoney.amount = BigInt(input.amount);
    bodyAmountMoney.currency = Currencies.USD;

    const bodyTipMoney: Money = {};

    if (input.tip !== null && input.tip !== undefined) {
      bodyTipMoney.amount = BigInt(input.tip);
      bodyTipMoney.currency = Currencies.USD;
    }
    const body: CreatePaymentRequest = {
      sourceId: card.id,
      idempotencyKey: uuidv4(),
      amountMoney: bodyAmountMoney
    };

    body.autocomplete = false;
    body.tipMoney = bodyTipMoney;
    body.customerId = customer.id;
    body.locationId = process.env.SQUARE_LOCATION_ID;
    return this.createPayment(body);
  }

  async refund(input: IRefundPaymentInput): Promise<IRefundPaymentOutput> {
    const bodyAmountMoney: Money = {};
    bodyAmountMoney.amount = BigInt(input.amount);
    bodyAmountMoney.currency = Currencies.USD;

    const body: RefundPaymentRequest = {
      idempotencyKey: uuidv4(),
      amountMoney: bodyAmountMoney
    };
    body.paymentId = input.paymentId;
    body.reason = input.reason;
    return this.refundPayment(body);
  }

  async update(input: IUpdatePaymentInput): Promise<IUpdatePaymentOutput> {
    const { paymentId } = input;

    const bodyPayment: Payment = {};

    if (input.amount !== null && input.amount !== undefined) {
      const bodyPaymentAmountMoney: Money = {};
      bodyPaymentAmountMoney.amount = BigInt(input.amount);
      bodyPaymentAmountMoney.currency = Currencies.USD;
      bodyPayment.amountMoney = bodyPaymentAmountMoney;
    }

    if (input.tip !== null && input.tip !== undefined) {
      const bodyPaymentTipMoney: Money = {};
      bodyPaymentTipMoney.amount = BigInt(input.tip);
      bodyPaymentTipMoney.currency = Currencies.USD;
      bodyPayment.tipMoney = bodyPaymentTipMoney;
    }

    const body: UpdatePaymentRequest = {
      idempotencyKey: uuidv4()
    };
    body.payment = bodyPayment;

    return this.updatePayment(paymentId, body);
  }

  async complete(input: ICompletePaymentInput): Promise<ICompletePaymentOutput> {
    const body: CompletePaymentRequest = {};

    if (input.versionToken !== null) {
      body.versionToken = input.versionToken;
    }

    return this.completePayment(input.paymentId, body);
  }

  async cancel(input: ICancelPaymentInput): Promise<ICancelPaymentOutput> {
    return this.cancelPayment(input.paymentId);
  }

  private createCustomer = async (body: CreateCustomerRequest): Promise<ICreateCustomerOutput> => {
    const { customersApi } = this.client;
    let response: ICreateCustomerOutput;
    try {
      const { result } = await customersApi.createCustomer(body);
      response = {
        id: result.customer?.id
      };
    } catch (error) {
      if (error instanceof ApiError) {
        const { errors } = error.result;
        const { statusCode } = error;
        if (statusCode === 400 || statusCode === 404) {
          throw new InvalidCreateCustomerError(errors[0].code, statusCode, "Customer is not able to be created");
        }
      }
    }
    return response;
  };

  private createCard = async (body: CreateCardRequest): Promise<ICreateCardOutput> => {
    const { cardsApi } = this.client;
    let response: ICreateCardOutput;

    try {
      const { result } = await cardsApi.createCard(body);

      response = {
        id: result.card?.id
      };
    } catch (error) {
      if (error instanceof ApiError) {
        const { errors } = error.result;
        const { statusCode } = error;
        if (statusCode === 400 || statusCode === 404) {
          throw new InvalidCreateCardError(errors[0].code, statusCode, "Card is not able to be created");
        }
      }
    }
    return response;
  };

  private createPayment = async (body: CreatePaymentRequest): Promise<ICreatePaymentOutput> => {
    const { paymentsApi } = this.client;
    let response: ICreatePaymentOutput;
    try {
      const { result } = await paymentsApi.createPayment(body);
      response = {
        transactionId: result.payment.id,
        versionToken: result.payment.versionToken
      };
    } catch (error) {
      if (error instanceof ApiError) {
        const { errors } = error.result;
        const { statusCode } = error;
        if (statusCode === 400 || statusCode === 404) {
          throw new InvalidTokenError(errors[0].code, statusCode, "Card is not valid");
        }
      }
    }
    return response;
  };

  private refundPayment = async (body: RefundPaymentRequest): Promise<IRefundPaymentOutput> => {
    const { refundsApi } = this.client;
    let response: IRefundPaymentOutput;
    try {
      const { result } = await refundsApi.refundPayment(body);
      response = {
        id: result.refund.id
      };
    } catch (error) {
      if (error instanceof ApiError) {
        const { errors } = error.result;
        const { statusCode } = error;
        if (statusCode === 400 || statusCode === 404) {
          throw new InvalidRefundError(errors[0].code, statusCode, "Something went wrong with refund");
        }
      }
    }
    return response;
  };

  private updatePayment = async (paymentId: string, body: UpdatePaymentRequest): Promise<IUpdatePaymentOutput> => {
    const { paymentsApi } = this.client;
    let response: IUpdatePaymentOutput;
    try {
      const { result } = await paymentsApi.updatePayment(paymentId, body);
      response = {
        id: result.payment.id
      };
    } catch (error) {
      if (error instanceof ApiError) {
        const { errors } = error.result;
        const { statusCode } = error;
        if (statusCode === 400 || statusCode === 404) {
          throw new InvalidUpdateError(errors[0].code, statusCode, "Something went wrong with update payment");
        }
      }
    }
    return response;
  };

  private cancelPayment = async (paymentId: string): Promise<ICancelPaymentOutput> => {
    const { paymentsApi } = this.client;
    let response: ICancelPaymentOutput;
    try {
      const { result } = await paymentsApi.cancelPayment(paymentId);
      response = {
        id: result.payment.id
      };
    } catch (error) {
      if (error instanceof ApiError) {
        const { errors } = error.result;
        const { statusCode } = error;
        if (statusCode === 400 || statusCode === 404) {
          throw new InvalidCancelError(errors[0].code, statusCode, "Something went wrong with cancel payment");
        }
      }
    }
    return response;
  };

  private completePayment =
    async (paymentId: string, body: CompletePaymentRequest): Promise<ICompletePaymentOutput> => {
      const { paymentsApi } = this.client;
      let response: ICompletePaymentOutput;
      try {
        const { result } = await paymentsApi.completePayment(paymentId, body);
        response = {
          id: result.payment.id
        };
      } catch (error) {
        if (error instanceof ApiError) {
          const { errors } = error.result;
          const { statusCode } = error;
          if (statusCode === 400 || statusCode === 404) {
            throw new InvalidCompleteError(errors[0].code, statusCode, "Something went wrong with complete payment");
          }
        }
        throw error;
      }
      return response;
    };
}
