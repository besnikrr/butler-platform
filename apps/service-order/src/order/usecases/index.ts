import cancelOrder, { ICancelOrderInput, ICancelOrderOutput } from "./cancel-order";
import refundOrder, { IRefundOrderInput, IRefundOrderOutput } from "./refund-order";
import updateOrder, { IUpdateOrderInput, IUpdateOrderOutput } from "./update-order";
import completeOrder, { ICompleteOrderInput, ICompleteOrderOutput } from "./complete-order";
import { Order } from "../entities/order";
import createOrder, { ICreateOrderInput, ICreateOrderOutput } from "./create-order";
import rejectOrder, { IRejectOrderInput, IRejectOrderOutput } from "./reject-order";
import pickupOrder, { IPickupOrderInput, IPickupOrderOutput } from "./pickup-order";
import listOrders, { IListOrdersFilterDependency, IListOrdersOutput } from "./list-orders";
import listOrdersForDashboard from "./list-orders-for-dashboard";
import getOrder, { IGetOrderOutput } from "./get-order";
import deliverOrder, { IDeliverOrderInput, IDeliverOrderOutput } from "./deliver-order";
import { EntityManager } from "@mikro-orm/postgresql";
import confirmOrder, { IConfirmOrderInput, IConfirmOrderOutput } from "./confirm-order";
import assignFoodCarrierToOrder, {
  IAssignOrderToFoodCarrierInput,
  IAssignOrderToFoodCarrierOutput
} from "./assign-food-carrier";
import listHubsWithOrderCount, {
  IListHubsWithOrderCountInput,
  IListHubsWithOrderCountOutput
} from "./list-hubs-with-order-count";
import removeFoodCarrier, { IRemoveFoodCarriedInput, IRemoveFoodCarrierOutput } from "./remove-food-carrier";
import setKitchenConfirmedDate, { ISetKitchenConfirmedDateInput, ISetKitchenConfirmedDateOutput } from "./set-kitchen-confirmed-date";
import { IAuthorizedUser } from "@butlerhospitality/service-sdk";
import assignOrderToMe, { IAssignOrderToMeInput, IAssignOrderToMeOutput } from "./assign-order-to-me";
import { User } from "../../user/entity";
import { IDefaultUsecaseDependency } from "@butlerhospitality/shared";

export interface IOrderUseCase {
  getOrder(id: number): Promise<IGetOrderOutput>;
  listOrders(filters: IListOrdersFilterDependency): Promise<[IListOrdersOutput[], number]>;
  listOrdersForDashboard(filters: IListOrdersFilterDependency): Promise<[IListOrdersOutput[], number]>;
  createOrder(order: ICreateOrderInput): Promise<ICreateOrderOutput>;
  refundOrder(id: number, order: IRefundOrderInput): Promise<IRefundOrderOutput>;
  updateOrder(id: number, order: IUpdateOrderInput): Promise<IUpdateOrderOutput>;
  cancelOrder(id: number, order: ICancelOrderInput): Promise<ICancelOrderOutput>;
  deliverOrder(id: number, data: IDeliverOrderInput): Promise<IDeliverOrderOutput>;
  completeOrder(order: ICompleteOrderInput): Promise<ICompleteOrderOutput>;
  refundOrder(order: IRefundOrderInput): Promise<IRefundOrderOutput>;
  rejectOrder(id: number, payload: IRejectOrderInput): Promise<IRejectOrderOutput>;
  pickupOrder(orderId: number, data: IPickupOrderInput): Promise<IPickupOrderOutput>;
  confirmOrder(number: number, order: IConfirmOrderInput): Promise<IConfirmOrderOutput>;
  assignFoodCarrierToOrder(id: number, data: IAssignOrderToFoodCarrierInput): Promise<IAssignOrderToFoodCarrierOutput>;
  listHubsWithOrderCount(data: IListHubsWithOrderCountInput): Promise<IListHubsWithOrderCountOutput>;
	removeFoodCarrier(id: number, data: IRemoveFoodCarriedInput): Promise<IRemoveFoodCarrierOutput>;
	setKitchenConfirmedDate(id: number, data: ISetKitchenConfirmedDateInput): Promise<ISetKitchenConfirmedDateOutput>;
  assignOrderToMe(id: number, data: IAssignOrderToMeInput): Promise<IAssignOrderToMeOutput>;
}

export interface IOrderUsecaseDependency extends IDefaultUsecaseDependency {
  user?: IAuthorizedUser;
}

export default (dependency: IOrderUsecaseDependency): IOrderUseCase => <IOrderUseCase>({
  getOrder: getOrder({
    orderRepository: dependency.conn.em.getRepository(Order)
  }),
  listOrders: listOrders({
    orderRepository: dependency.conn.em.getRepository(Order)
  }),
  listOrdersForDashboard: listOrdersForDashboard({
    orderRepository: dependency.conn.em.getRepository(Order)
  }),
  createOrder: createOrder({
    connection: dependency.conn,
    validate: dependency.validate,
    tenant: dependency.tenant
  }),
  updateOrder: updateOrder({
    connection: dependency.conn,
    validate: dependency.validate,
    tenant: dependency.tenant
  }),
  cancelOrder: cancelOrder({
    conn: dependency.conn,
    tenant: dependency.tenant
  }),
  deliverOrder: deliverOrder({
    em: dependency.conn.em as EntityManager,
    validate: dependency.validate,
    tenant: dependency.tenant
  }),
  completeOrder: completeOrder(),
  refundOrder: refundOrder({
    conn: dependency.conn,
    tenant: dependency.tenant
  }),
  rejectOrder: rejectOrder({
    conn: dependency.conn,
    tenant: dependency.tenant
  }),
  pickupOrder: pickupOrder({
    conn: dependency.conn,
    validate: dependency.validate,
    tenant: dependency.tenant
  }),
  assignFoodCarrierToOrder: assignFoodCarrierToOrder({
    orderRepository: dependency.conn.em.getRepository(Order),
    userRepository: dependency.conn.em.getRepository(User),
    validate: dependency.validate,
    tenant: dependency.tenant
  }),
  confirmOrder: confirmOrder({
    connection: dependency.conn,
    tenant: dependency.tenant,
    user: dependency.user
  }),
  listHubsWithOrderCount: listHubsWithOrderCount({
    conn: dependency.conn
  }),
  removeFoodCarrier: removeFoodCarrier({
    orderRepository: dependency.conn.em.getRepository(Order),
    userRepository: dependency.conn.em.getRepository(User),
    validate: dependency.validate
  }),
  setKitchenConfirmedDate: setKitchenConfirmedDate({
    connection: dependency.conn,
    validate: dependency.validate,
    tenant: dependency.tenant
  }),
  assignOrderToMe: assignOrderToMe({
    orderRepository: dependency.conn.em.getRepository(Order),
    userRepository: dependency.conn.em.getRepository(User),
    validate: dependency.validate,
    user: dependency.user
  })
});
