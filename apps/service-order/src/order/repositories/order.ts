import { CustomEntityRepository } from "@butlerhospitality/service-sdk";
import { FilterQuery, QueryOrder } from "@mikro-orm/core";
import { Order } from "../entity";

export interface IOrderRepository extends CustomEntityRepository<Order> {
  generateOrderNumber(hubId: number, scheduledDate: Date): Promise<number>;
  getOrderWithRelations(id: number, version: number): Promise<Order>;
  getDeliveredOrdersByClientPhoneNumber(clientPhoneNumber: string): Promise<Order[]>;
  markAsRead(order: Order): Promise<void>;
  applyRelationsToOrder(order: Order): Promise<Order>;
  setKitchenConfirmedDate(order: Order): Promise<Order>;
}

export class OrderRepository extends CustomEntityRepository<Order> implements IOrderRepository {
  async generateOrderNumber(hubId: number, scheduledDate: Date) {
    const today = new Date().toISOString();

    const latestOrder = await this.findOne({
      meta: {
        hubId: hubId
      },
      ...(scheduledDate ? {
        scheduledDate: {
          $gte: new Date(new Date(scheduledDate).setUTCHours(0, 0, 0, 0)),
          $lte: new Date(new Date(scheduledDate).setUTCHours(23, 59, 59, 999))
        }
      } : {
        created_at: {
          $gte: new Date(new Date(today).setUTCHours(0, 0, 0, 0)),
          $lte: new Date(new Date(today).setUTCHours(23, 59, 59, 999))
        }
      })
    }, [], {
      number: QueryOrder.DESC
    });

    return latestOrder ? latestOrder.number + 1 : 1;
  }

  async getOrderWithRelations(id: number, version: number): Promise<Order> {
    const order = await this.getOneEntityOrFailWithLock(
      id,
      version
    );

    return this.applyRelationsToOrder(order);
  }

  async getOrdersForDashboard(filters: FilterQuery<Order>): Promise<[Order[], number]> {
    return this.findAndCount(filters, {
      fields: [
        "id", "created_at", "version", "number", "type", "paymentType", "scheduledDate", "confirmedDate", "status",
        "grandTotal", "totalNet", "totalGross", "tax", "tip", "hotelTax", "hotelTotalNet", "hotelTotalGross", "hotelGrandTotal", "totalVoucherPrice",
        "meta", "meta.hubId", "meta.hotelId", "meta.hubName", "meta.hubColor", "meta.hotelName", "meta.dispatcher",
        "meta.dispatcher.name", "meta.foodCarrier", "meta.foodCarrier.name", "meta.roomNumber", "client",
        "client.name", "client.email", "client.phoneNumber", "number"
      ]
    });
  }

  async getDeliveredOrdersByClientPhoneNumber(clientPhoneNumber: string): Promise<Order[]> {
    return this.find({
      client: {
        phoneNumber: clientPhoneNumber
      }
    }, {
      populate: ["discounts"],
      filters: ["delivered"]
    });
  }

  async applyRelationsToOrder(order: Order): Promise<Order> {
    return this.populate(order, ["vouchers", "discounts", "products", "products.vouchers", "products.modifiers", "customProducts"]);
  }

  async markAsRead(order: Order): Promise<void> {
    order.isRead = true;

    await this.flush();
  }

  async setKitchenConfirmedDate(order: Order): Promise<Order> {
    order.kitchenConfirmedDate = new Date();
    await this.flush();

    return order;
  }
}
