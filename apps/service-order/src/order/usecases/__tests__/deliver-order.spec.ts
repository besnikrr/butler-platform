import * as path from "path";
import {
	seedDatabase,
	clearDatabase,
	BadRequestError,
	getTestConnection,
	PostRoomChargeType,
	getPostRoomChargeService,
	IPostRoomChargeInput,
	getPaymentService
} from "@butlerhospitality/service-sdk";
import { MikroORM } from "@mikro-orm/core";
import { EntityManager } from "@mikro-orm/postgresql";
import { ICompletePaymentInput, ICompletePaymentOutput, PaymentProvider } from "libs/service-sdk/payment/interfaces";

import { OrderRepository } from "../../repository";
import entitiesArray from "../../../utils/entities";
import { IOrder, Order } from "../../entity";
import deliverOrder, { IDeliverOrderDependency } from "../deliver-order";
import { OrderStatus } from "../../shared/enums";

const constructDeliverOrderInput = (carrierId: number, version?: number) => {
  return {
    carrierId: carrierId,
    imageId: 1,
    notes: "Order has been delivered",
    tip: 10,
    version: version || 1
  };
};

describe("Deliver order usecase", () => {
  let orm: MikroORM;
  let orderRepository: OrderRepository;
  let orderToDeliver: IOrder;
  let initialOrderToDeliver: IOrder;
  let notInDeliveryOrder: IOrder;
  let pmsEnabledOrder: IOrder;
  let completePaymentSpy: jest.SpyInstance<Promise<ICompletePaymentOutput>>;
  let pmsProviderSpy: jest.SpyInstance<Promise<void>, [data: IPostRoomChargeInput]>;
  let dependency: IDeliverOrderDependency;

  beforeAll(async () => {
    const conn = await getTestConnection(process.env.TEST_DB, entitiesArray);
    await seedDatabase(conn, path.join(__dirname, "..", "..", "..", ".."));
    orm = conn;
    orderRepository = conn.em.getRepository(Order);
    orderToDeliver = await orderRepository.findOne({
      status: OrderStatus.IN_DELIVERY, meta: { pmsId: null }
    }, ["meta", "meta.foodCarrier"]);
    initialOrderToDeliver = Object.assign({}, orderToDeliver);
    notInDeliveryOrder = await orderRepository.findOne(
      { status: { $ne: OrderStatus.IN_DELIVERY } },
      ["meta", "meta.foodCarrier"]
    );
    pmsEnabledOrder = await orderRepository.findOne({ meta: { pmsId: { $ne: null } } }, ["meta", "meta.foodCarrier"]);
    dependency = {
      em: orm.em as EntityManager,
      validate: false,
      tenant: "butler"
    };
  });

  it("Should fail to deliver an order because the order is not assigned to that carrier", async () => {
    try {
      await deliverOrder(dependency)(orderToDeliver.id, constructDeliverOrderInput(-1));
    } catch (err) {
      expect(err).toBeInstanceOf(BadRequestError);
    }
  });

  it("Should fail to deliver an order because the payment failed", async () => {
    completePaymentSpy = jest.spyOn(
      getPaymentService(PaymentProvider.SQUARE),
      "complete"
    ).mockImplementation(() => Promise.reject(new Error("Payment failed")));

    try {
      await deliverOrder(dependency)(orderToDeliver.id, constructDeliverOrderInput(1));
    } catch (error) {
      expect(error).toBeInstanceOf(BadRequestError);
    }
  });

  it("Should deliver an order", async () => {
    completePaymentSpy = jest.spyOn(
      getPaymentService(PaymentProvider.SQUARE),
      "complete"
    ).mockImplementation(async (input: ICompletePaymentInput) => {
      return {
        id: input.paymentId
      };
    });
    await deliverOrder(dependency)(
      initialOrderToDeliver.id,
      constructDeliverOrderInput(initialOrderToDeliver.meta.foodCarrier.id)
    );

    const deliveredOrder = await orderRepository.findOne(initialOrderToDeliver.id);

    expect(completePaymentSpy).toHaveBeenCalled();
    expect(deliveredOrder).toBeDefined();
    expect(deliveredOrder.meta.foodCarrier.id).toEqual(initialOrderToDeliver.meta.foodCarrier.id);
    expect(deliveredOrder.comment).toEqual("Order has been delivered");
    expect(deliveredOrder.tip).toEqual(initialOrderToDeliver.tip + 10);
    expect(deliveredOrder.version).toEqual(2);
    expect(deliveredOrder.status).toEqual(OrderStatus.DELIVERED);
  });

  it("Should deliver an order with pms enabled", async () => {
    pmsProviderSpy = jest.spyOn(
      getPostRoomChargeService(PostRoomChargeType.PMS),
      "post"
    ).mockImplementation(async () => { });

    await deliverOrder(dependency)(pmsEnabledOrder.id, constructDeliverOrderInput(pmsEnabledOrder.meta.foodCarrier.id));

    const deliveredOrder = await orderRepository.findOne(pmsEnabledOrder.id);

    expect(pmsProviderSpy).toHaveBeenCalled();
    expect(deliveredOrder).toBeDefined();
    expect(deliveredOrder.meta.foodCarrier.id).toEqual(pmsEnabledOrder.meta.foodCarrier.id);
    expect(deliveredOrder.comment).toEqual("Order has been delivered");
    expect(deliveredOrder.tip).toEqual(10);
    expect(deliveredOrder.version).toEqual(2);
    expect(deliveredOrder.status).toEqual(OrderStatus.DELIVERED);
  });

  it("Should fail to deliver an order because the order is not in delivery", async () => {
    await expect(async () =>
      deliverOrder(dependency)(
        notInDeliveryOrder.id,
        constructDeliverOrderInput(notInDeliveryOrder.meta.foodCarrier.id)
      )
    ).rejects.toThrow(BadRequestError);
  });

  it("Should fail to deliver an order because the order has already been delivered", async () => {
    await expect(async () =>
      deliverOrder(dependency)(orderToDeliver.id, constructDeliverOrderInput(orderToDeliver.meta.foodCarrier.id, 2))
    ).rejects.toThrow(BadRequestError);
  });

  afterAll(async () => {
    await clearDatabase(orm);
    await orm?.close(true);
  });
});
