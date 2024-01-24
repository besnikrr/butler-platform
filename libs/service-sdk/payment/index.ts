import { SquareService } from "./square";
import { PaymentProvider } from "./interfaces";

const squareService = new SquareService();

const getPaymentService = (type: PaymentProvider) => {
  switch (type) {
  case PaymentProvider.SQUARE:
    return squareService;
  default:
    throw new Error("Payment type not supported");
  }
};

export { getPaymentService };
