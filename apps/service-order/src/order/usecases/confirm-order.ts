import { Order } from "../entities/order";
import { OrderStatus } from "../shared/enums";
import { AppEnum } from "@butlerhospitality/shared";
import { IsBoolean, IsNumber } from "class-validator";
import { LockMode, MikroORM } from "@mikro-orm/core";
import Hub from "@services/service-network/src/hub/entity";
import { IAuthorizedUser, IWebsocketBroadcastMessageInput, orderConfirmedEvent } from "@butlerhospitality/service-sdk";
import { getHubBlock } from "@services/service-network/src/hub/blocks";
import { NetworkEntities } from "@services/service-network/src/entities";
import { User } from "../../user/entity";
import * as segment from "../shared/segment";
import {
  BadRequestError,
  WebSocketProvider,
  getWebSocketService,
  WebSocketActionTypes,
  getServiceDBConnection
} from "@butlerhospitality/service-sdk";

export interface IConfirmOrderInput {
  version: number;
  printReceipt: boolean;
}

export interface IConfirmOrderDependency {
  connection: MikroORM;
  tenant: string;
  user: IAuthorizedUser;
}

export interface IConfirmOrderOutput {
}

export class ConfirmOrderInput {
  @IsNumber()
  version: number;

  @IsBoolean()
  printReceipt: boolean;
}

export default (dependency: IConfirmOrderDependency) => {
  return async (id: number, payload: IConfirmOrderInput): Promise<IConfirmOrderOutput> => {
    const order = await dependency.connection.em.findOne(Order, id, {
      lockMode: LockMode.OPTIMISTIC,
      lockVersion: payload.version,
      populate: ["meta", "client"]
    });

    if (order.status !== OrderStatus.PENDING) {
      throw new BadRequestError("Cannot confirm order. Order status is not PENDING.");
    }

    order.status = OrderStatus.CONFIRMATION;
    order.confirmedDate = new Date();
    order.meta.dispatcher = { id: dependency.user.id } as User;
    await dependency.connection.em.flush();

    await segment.orderConfirmed(order.client.phoneNumber, {
      clientName: order.client.name,
      hotelId: order.meta.hotelId,
      hotelName: order.meta.hotelName,
      orderId: order.id,
      phoneNumber: order.client.phoneNumber,
      confirmationDate: order.confirmedDate
    });

    const networkConnection = await getNetworkConnection(dependency);
    const hub = await getHubBlock({ hubRepository: networkConnection.conn.em.getRepository(Hub) })(order.meta?.hubId);
    if (hub?.id && !hub?.has_expeditor_app_enabled && payload.printReceipt) {
      // TODO: SQU5-353 Print receipt
      // POST : https://oms-printer.butlerhospitality.com/api/printReceipt
      // Payload: { "orderId": 1 }
    }

    const socketService = getWebSocketService(WebSocketProvider.APIGATEWAY);
    const broadCastParameters: IWebsocketBroadcastMessageInput = {
      action: WebSocketActionTypes[orderConfirmedEvent].key,
      id
    };
    await socketService.broadcast(broadCastParameters);

    return { ...order, version: payload.version + 1 };
  };
};

const getNetworkConnection = (dependency: IConfirmOrderDependency) => {
  return getServiceDBConnection({
    tenant: dependency.tenant,
    service: AppEnum.NETWORK,
    entities: NetworkEntities.asArray()
  });
};
