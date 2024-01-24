import { IOrder, Order } from "../entity";
import { MikroORM } from "@mikro-orm/core";
import { OrderStatus } from "../shared/enums";
import { OrderRepository } from "../repository";
import Hub from "@services/service-network/src/hub/entity";
import { IBaseOrderDependency } from "../shared/interfaces";
import { IsInt, IsNotEmpty, IsPositive } from "class-validator";
import { initializeDependencyConnections } from "../../utils/util";
import { getHubBlock } from "@services/service-network/src/hub/blocks";
import {
  BadRequestError,
  WebSocketProvider,
  getWebSocketService,
  WebSocketActionTypes,
  orderUpdateKitchenConfirmDate,
  IWebsocketBroadcastMessageInput
} from "@butlerhospitality/service-sdk";

export interface SetKitchenConfirmedDateDependency extends IBaseOrderDependency {}

export interface ISetKitchenConfirmedDateInput {
	version: number;
}

export class SetKitchenConfirmedDate implements ISetKitchenConfirmedDateInput {
	@IsInt()
  @IsPositive()
	@IsNotEmpty()
	version!: number;
}

export interface ISetKitchenConfirmedDateOutput extends IOrder { }

function validateHubHasExpeditorAllowed(networkConnection: MikroORM) {
  return async (hubId: number) => {
    const hub = await getHubBlock({ hubRepository: networkConnection.em.getRepository(Hub) })(hubId);
    if (hub?.id && !hub?.has_expeditor_app_enabled) {
      throw new BadRequestError("This hub does not have the expeditor app enabled.");
    }
  };
}

export default (dependency: SetKitchenConfirmedDateDependency) =>
  async (orderId: number, data: ISetKitchenConfirmedDateInput): Promise<ISetKitchenConfirmedDateOutput> => {
    const orderConnection = dependency.connection;
    const {
      networkConnection
    } = await initializeDependencyConnections(dependency.tenant);
    const orderRepository = orderConnection.em.getRepository(Order) as OrderRepository;
    const order = await orderRepository.getOneEntityOrFailWithLock(orderId, data.version);
    if (order.status !== OrderStatus.PREPARATION) {
      throw new BadRequestError(`Order status is not in ${OrderStatus.PREPARATION}`);
    }
    await validateHubHasExpeditorAllowed(networkConnection)(order.meta.hubId);
    const orderUpdated = orderRepository.setKitchenConfirmedDate(order);
    const socketService = getWebSocketService(WebSocketProvider.APIGATEWAY);
    const broadCastParameters: IWebsocketBroadcastMessageInput = {
      action: WebSocketActionTypes[orderUpdateKitchenConfirmDate].key,
      id: orderId
    };
    await socketService.broadcast(broadCastParameters);
    return orderUpdated;
  };
