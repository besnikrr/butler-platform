import { clearDatabase, getTestConnection, seedDatabase } from "@butlerhospitality/service-sdk";
import entitiesArray from "../../../utils/entities";
import { MikroORM } from "@mikro-orm/core";
import { IOrder, Order } from "../../entity";
import listOrders, { IListOrdersOutput } from "../list-orders";
import * as path from "path";
import { OrderRepository } from "../../repository";
import { OrderStatus } from "../../shared/enums";
import { parseOrderFilters } from "@services/service-order/src/utils/util";

describe("List orders usecase", () => {
  let orm: MikroORM;
  let orderRepository: OrderRepository;
  let orderToSearch: IOrder;
  beforeAll(async () => {
    const conn = await getTestConnection(process.env.TEST_DB, entitiesArray);
    await seedDatabase(conn, path.join(__dirname, "..", "..", "..", ".."));

    orm = conn;
    orderRepository = conn.em.getRepository(Order);
    orderToSearch = await orderRepository.findOne({}, ["meta.foodCarrier"]);
  });

  const expectResponseToHaveKeys = (order: IListOrdersOutput) => {
    for (const property of Object.getOwnPropertyNames(order)) {
      expect(order).toHaveProperty(property);
    }
  };

  it("Should list orders", async () => {
    const [orders, count] = await listOrders({ orderRepository })({ paginationFilters: { page: 1, limit: 10 } });

    for (const order of orders) {
      expectResponseToHaveKeys(order);
    }

    expect(count).toBeGreaterThan(0);
    expect(orders.length).toBeGreaterThan(0);
    expect(orders.length).toBeLessThanOrEqual(10);
  });

  it("should list orders with $or when search has value", async () => {
    const search = orderToSearch.status.slice(1, orderToSearch.status.length - 1);
    const parsedFilters = parseOrderFilters({ });
    const [orders, count] = await listOrders({ orderRepository })({
      paginationFilters: { page: 1, limit: 10 },
      orderFilters: parsedFilters,
      originalFilters: { search }
    });

    for (const order of orders) {
      expectResponseToHaveKeys(order);
      expect(order.status).toBe(orderToSearch.status);
    }

    expect(count).toBeGreaterThan(0);
    expect(orders.length).toBeGreaterThan(0);
    expect(orders.length).toBeLessThanOrEqual(10);
  });

  it("Should list orders by order number", async () => {
    const [orders, count] = await listOrders({ orderRepository })({
      paginationFilters: { page: 1, limit: 10 },
      orderFilters: parseOrderFilters({ orderNumber: orderToSearch.number.toString() })
    });

    for (const order of orders) {
      expectResponseToHaveKeys(order);
      expect(order.number).toBe(orderToSearch.number);
    }

    expect(count).toBeGreaterThan(0);
    expect(orders.length).toBeGreaterThan(0);
    expect(orders.length).toBeLessThanOrEqual(10);
  });

  it("Should list orders by order status", async () => {
    const [orders, count] = await listOrders({ orderRepository })({
      paginationFilters: { page: 1, limit: 10 },
      orderFilters: { status: [OrderStatus.IN_DELIVERY] }
    });

    for (const order of orders) {
      expectResponseToHaveKeys(order);
      expect(order.status).toBe(OrderStatus.IN_DELIVERY);
    }

    expect(count).toBeGreaterThan(0);
    expect(orders.length).toBeGreaterThan(0);
    expect(orders.length).toBeLessThanOrEqual(10);
  });

  it("Should list orders by order type", async () => {
    const [orders, count] = await listOrders({ orderRepository })({
      paginationFilters: { page: 1, limit: 10 }, orderFilters: parseOrderFilters({ type: orderToSearch.type })
    });

    for (const order of orders) {
      expectResponseToHaveKeys(order);
      expect(order.type).toBe(orderToSearch.type);
    }

    expect(count).toBeGreaterThan(0);
    expect(orders.length).toBeGreaterThan(0);
    expect(orders.length).toBeLessThanOrEqual(10);
  });

  it("Should list orders between dates", async () => {
    const fromDate = new Date(orderToSearch.created_at.getTime());
    fromDate.setDate(fromDate.getDate() - 1);
    const dateTo = new Date();
    dateTo.setDate(new Date().getDate() + 1);

    const [orders, count] = await listOrders({ orderRepository })({
      paginationFilters: { page: 1, limit: 10 },
      orderFilters: parseOrderFilters({ createdDate: { from: fromDate.toISOString(), to: dateTo.toISOString() } })
    });

    for (const order of orders) {
      expectResponseToHaveKeys(order);
      expect(order.created_at.getTime()).toBeGreaterThanOrEqual(orderToSearch.created_at.getTime());
      expect(order.created_at.getTime()).toBeLessThanOrEqual(dateTo.getTime());
    }

    expect(count).toBeGreaterThan(0);
    expect(orders.length).toEqual(6);
    expect(orders.length).toBeLessThanOrEqual(10);
  });

  it("Should list orders by hotel", async () => {
    const [orders, count] = await listOrders({ orderRepository })({
      paginationFilters: { page: 1, limit: 10 }, orderFilters: parseOrderFilters({
        hotelIds: [orderToSearch.meta.hotelId.toString()]
      })
    });

    for (const order of orders) {
      expectResponseToHaveKeys(order);
      expect(order.meta.hotelId).toBe(orderToSearch.meta.hotelId);
    }

    expect(count).toBeGreaterThan(0);
    expect(orders.length).toBeGreaterThan(0);
    expect(orders.length).toBeLessThanOrEqual(10);
  });

  it("Should list orders by hub", async () => {
    const [orders, count] = await listOrders({ orderRepository })({
      paginationFilters: { page: 1, limit: 10 }, orderFilters: parseOrderFilters({
        hubIds: [orderToSearch.meta.hubId.toString()]
      })
    });

    for (const order of orders) {
      expectResponseToHaveKeys(order);
      expect(order.meta.hubId).toBe(orderToSearch.meta.hubId);
    }

    expect(count).toBeGreaterThan(0);
    expect(orders.length).toBeGreaterThan(0);
    expect(orders.length).toBeLessThanOrEqual(10);
  });

  it("Should list orders by room number", async () => {
    const [orders, count] = await listOrders({ orderRepository })({
      paginationFilters: { page: 1, limit: 10 }, orderFilters: parseOrderFilters({
        roomNumber: orderToSearch.meta.roomNumber
      })
    });

    for (const order of orders) {
      expectResponseToHaveKeys(order);
      expect(order.meta.roomNumber).toBe(orderToSearch.meta.roomNumber);
    }

    expect(count).toBeGreaterThan(0);
    expect(orders.length).toBeGreaterThan(0);
    expect(orders.length).toBeLessThanOrEqual(10);
  });

  it("Should list orders by carrier", async () => {
    const [orders, count] = await listOrders({ orderRepository })({
      paginationFilters: { page: 1, limit: 10 }, orderFilters: parseOrderFilters({
        carrierId: orderToSearch.meta.foodCarrier.id.toString()
      })
    });

    for (const order of orders) {
      expectResponseToHaveKeys(order);
      expect(order.meta.foodCarrier.id).toBe(orderToSearch.meta.foodCarrier.id);
    }

    expect(count).toBeGreaterThan(0);
    expect(orders.length).toBeGreaterThan(0);
    expect(orders.length).toBeLessThanOrEqual(10);
  });

  it("Should list orders by created date", async () => {
    const createdDate = new Date().toISOString();
    const fromDate = new Date(new Date(createdDate).setUTCHours(0, 0, 0, 0));
    const toDate = new Date(new Date(createdDate).setUTCHours(23, 59, 59, 999));
    const [orders, count] = await listOrders({ orderRepository })({
      paginationFilters: { page: 1, limit: 10 }, orderFilters: parseOrderFilters({
        createdDate: {
          from: fromDate.toISOString(),
          to: toDate.toISOString()
        }
      })
    });

    for (const order of orders) {
      expectResponseToHaveKeys(order);
      expect(order.created_at.getTime()).toBeGreaterThanOrEqual(
        fromDate.getTime()
      );
      expect(order.created_at.getTime()).toBeLessThanOrEqual(
        toDate.getTime()
      );
    }

    expect(count).toBeGreaterThan(0);
    expect(orders.length).toEqual(6);
    expect(orders.length).toBeLessThanOrEqual(10);
  });

  it("Should list orders by confirmed date", async () => {
    const confirmedDate = new Date();
    const fromDate = new Date(new Date(confirmedDate).setUTCHours(0, 0, 0, 0));
    const toDate = new Date(new Date(confirmedDate).setUTCHours(23, 59, 59, 999));
    const [orders, count] = await listOrders({ orderRepository })({
      paginationFilters: { page: 1, limit: 10 }, orderFilters: parseOrderFilters({
        confirmedDate: {
          from: fromDate.toISOString(),
          to: toDate.toISOString()
        }
      })
    });

    for (const order of orders) {
      expectResponseToHaveKeys(order);
      expect(order.confirmedDate.getTime()).toBeGreaterThanOrEqual(
        fromDate.getTime()
      );
      expect(order.confirmedDate.getTime()).toBeLessThanOrEqual(
        toDate.getTime()
      );
    }

    expect(count).toBeGreaterThan(0);
    expect(orders.length).toEqual(1);
    expect(orders.length).toBeLessThanOrEqual(10);
  });

  afterAll(async () => {
    await clearDatabase(orm);
    await orm?.close(true);
  });
});
