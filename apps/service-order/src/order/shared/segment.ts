import { analytics, AnalyticsProviderType } from "@butlerhospitality/service-sdk";
import { DeliveredLocation, OrderSource } from "./enums";

enum OrderEvent {
  OrderCreated = "Order Created",
  OrderConfirmed = "Order Confirmed",
  OrderDelivered = "Order Delivered",
  OrderPickedUp = "Order Picked Up",
  OrderCancelled = "Order Cancelled",
  OrderRefunded = "Order Refunded"
}

interface IBaseOrderNotification {
  clientName: string;
  hotelId: number;
  hotelName: string;
  orderId: number;
  phoneNumber: string;
}

interface IcreatedDateNotification extends IBaseOrderNotification {
  source: OrderSource;
  createdDate: Date;
 }

interface IOrderConfirmedNotification extends IBaseOrderNotification {
  confirmationDate: Date;
 }

 interface IOrderPickedUpNotification extends IBaseOrderNotification {
  pickedUpDate: Date;
}

interface IOrderDeliveredNotification extends IBaseOrderNotification {
  deliveredDate: Date;
  deliveredLocation: DeliveredLocation;
}

interface IOrderCancelledNotification extends IBaseOrderNotification {
  cancellationTime: Date;
}

interface IOrderRefundedNotification extends IBaseOrderNotification {
  refundedAmount: number;
  refundedDate: Date;
}

const segmentProvider = () => analytics(AnalyticsProviderType.SEGMENT).provider();

export const orderCreated = async (phoneNumber: string, data: IcreatedDateNotification): Promise<void> => {
  const identifyData = {
    fullName: data.clientName,
    id: phoneNumber,
    phone_number: phoneNumber,
    email: "-",
    source: data.source
  };

  await segmentProvider().identify(phoneNumber, identifyData);

  const trackData = {
    clientName: data.clientName,
    hotelName: data.hotelName,
    hotelId: data.hotelId,
    orderId: data.orderId,
    clientPhoneNumber: phoneNumber,
    timestamp: data.createdDate.toISOString(),
    source: data.source
  };

  await segmentProvider().track(OrderEvent.OrderCreated, phoneNumber, trackData);
};

export const orderConfirmed = async (phoneNumber: string, data: IOrderConfirmedNotification): Promise<void> => {
  const trackData = {
    hotelName: data.hotelName,
    hotelId: data.hotelId,
    orderId: data.orderId,
    clientPhoneNumber: phoneNumber,
    timestamp: data.confirmationDate.toISOString()
  };

  await segmentProvider().track(OrderEvent.OrderConfirmed, phoneNumber, trackData);
};

export const orderPickedUp = async (phoneNumber: string, data: IOrderPickedUpNotification): Promise<void> => {
  const trackData = {
    hotelName: data.hotelName,
    hotelId: data.hotelId,
    orderId: data.orderId,
    clientPhoneNumber: phoneNumber,
    timestamp: data.pickedUpDate.toISOString()
  };

  await segmentProvider().track(OrderEvent.OrderPickedUp, phoneNumber, trackData);
};

export const orderDelivered = async (phoneNumber: string, data: IOrderDeliveredNotification): Promise<void> => {
  const trackData = {
    hotelName: data.hotelName,
    hotelId: data.hotelId,
    orderId: data.orderId,
    clientPhoneNumber: phoneNumber,
    timestamp: data.deliveredDate.toISOString(),
    deliveryLocation: data.deliveredLocation
  };

  await segmentProvider().track(OrderEvent.OrderDelivered, phoneNumber, trackData);
};

export const orderCancelled = async (phoneNumber: string, data: IOrderCancelledNotification): Promise<void> => {
  const trackData = {
    clientName: data.clientName,
    orderId: data.orderId,
    timestamp: data.cancellationTime.toISOString()
  };

  await segmentProvider().track(OrderEvent.OrderCancelled, phoneNumber, trackData);
};

export const orderRefunded = async (phoneNumber: string, data: IOrderRefundedNotification) => {
  const trackData = {
    clientName: data.clientName,
    orderId: data.orderId,
    refundedAmount: data.refundedAmount,
    timestamp: data.refundedDate.toISOString()
  };

  await segmentProvider().track(OrderEvent.OrderRefunded, phoneNumber, trackData);
};
