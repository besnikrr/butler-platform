import { SquareService } from "./square";
import { PaymentProvider } from "./interfaces";
export declare const getPaymentService: (type: PaymentProvider) => SquareService;
export default getPaymentService;
