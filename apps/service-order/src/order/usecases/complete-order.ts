import { IsOptional, IsString } from "class-validator";
import {
  PaymentProvider,
  WebSocketProvider,
  getPaymentService,
  getWebSocketService,
  orderCompletedEvent,
  WebSocketActionTypes,
  ICompletePaymentInput,
  ICompletePaymentOutput,
  IWebsocketBroadcastMessageInput
} from "@butlerhospitality/service-sdk";

export interface ICompleteOrderInput extends ICompletePaymentInput { }
export interface ICompleteOrderOutput extends ICompletePaymentOutput { }
export class CompleteOrderInput implements ICompleteOrderInput {
  @IsString()
  paymentId: string;

  @IsString()
  @IsOptional()
  versionToken?: string;
}

export default () =>
  async (data: ICompleteOrderInput) => {
    const socketService = getWebSocketService(WebSocketProvider.APIGATEWAY);
    const broadCastParameters: IWebsocketBroadcastMessageInput = {
      action: WebSocketActionTypes[orderCompletedEvent].key
    };
    await socketService.broadcast(broadCastParameters);
    return getPaymentService(PaymentProvider.SQUARE).complete(data);
  };
