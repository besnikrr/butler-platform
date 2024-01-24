import { faker } from "@faker-js/faker";
import { getPaymentService } from "../../index";
import {
  PaymentProvider,
  ICreatePaymentInput,
  ICreatePaymentOutput,
  IRefundPaymentInput,
  IRefundPaymentOutput,
  IUpdatePaymentInput,
  IUpdatePaymentOutput,
  ICancelPaymentOutput,
  ICancelPaymentInput
} from "../../interfaces";

describe("payment sdk tests", () => {
  const squareService = getPaymentService(PaymentProvider.SQUARE);
  const paymentId: string = faker.random.alphaNumeric(10);

  it("should create a payment", async () => {
    const createPaymentSpyMock = jest.spyOn(squareService, "pay")
      .mockImplementation((): Promise<ICreatePaymentOutput> => {
        return Promise.resolve({
          transactionId: paymentId,
          versionToken: faker.random.alphaNumeric(10)
        });
      });

    const createPaymentInputRequest: ICreatePaymentInput = {
      amount: 100,
      clientEmail: faker.internet.email(),
      clientName: faker.name.firstName() + " " + faker.name.lastName(),
      clientPhoneNumber: faker.phone.phoneNumber("##########"),
      nonce: faker.random.alphaNumeric(18)
    };

    const payment = await squareService.pay(createPaymentInputRequest);

    expect(createPaymentSpyMock).toHaveBeenCalled();
    expect(payment.transactionId).toEqual(paymentId);
  });

  it("should refund a payment", async () => {
    const createRefundSpyMock = jest.spyOn(squareService, "refund")
      .mockImplementation((): Promise<IRefundPaymentOutput> => {
        return Promise.resolve({
          id: paymentId
        });
      });

    const createRefundInputRequest: IRefundPaymentInput = {
      amount: 80,
      paymentId: faker.random.alphaNumeric(10),
      reason: faker.lorem.sentence()
    };

    const refund = await squareService.refund(createRefundInputRequest);

    expect(createRefundSpyMock).toHaveBeenCalled();
    expect(refund.id).toEqual(paymentId);
  });

  it("should update a payment", async () => {
    const createUpdateSpyMock = jest.spyOn(squareService, "update")
      .mockImplementation((): Promise<IUpdatePaymentOutput> => {
        return Promise.resolve({
          id: paymentId
        });
      });

    const createUpdateInputRequest: IUpdatePaymentInput = {
      amount: 80,
      tip: 10,
      paymentId: faker.random.alphaNumeric(10)
    };

    const update = await squareService.update(createUpdateInputRequest);

    expect(createUpdateSpyMock).toHaveBeenCalled();
    expect(update.id).toEqual(paymentId);
  });

  it("should cancel a payment", async () => {
    const createCancelSpyMock = jest.spyOn(squareService, "cancel")
      .mockImplementation((): Promise<ICancelPaymentOutput> => {
        return Promise.resolve({
          id: paymentId
        });
      });

    const createCancelInputRequest: ICancelPaymentInput = {
      paymentId: faker.random.alphaNumeric(10)
    };

    const cancel = await squareService.cancel(createCancelInputRequest);

    expect(createCancelSpyMock).toHaveBeenCalled();
    expect(cancel.id).toEqual(paymentId);
  });
});
