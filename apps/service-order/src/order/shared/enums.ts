export enum OrderStatus {
  PENDING = "PENDING",
  CONFIRMATION = "CONFIRMATION",
  PREPARATION = "PREPARATION",
  IN_DELIVERY = "IN_DELIVERY",
  DELIVERED = "DELIVERED",
  CANCELLED = "CANCELLED",
  REJECTED = "REJECTED",
  MERGED = "MERGED",
  SCHEDULED = "SCHEDULED",
}

export enum OrderType {
  ROOM_SERVICE = "ROOM_SERVICE",
  CATERING = "CATERING",
  AMENITY = "AMENITY",
  FAAS = "FAAS",
}

export enum OrderSource {
  WEB = "WEB",
  PHONE = "PHONE",
  SMS = "SMS",
}

export enum OrderCreationType {
  NORMAL,
  WITH_VOUCHER,
  WITH_DISCOUNT,
  WITH_PRE_FIXE
}

export enum PaymentGateway {
  SQUARE = "SQUARE",
  STRIPE = "STRIPE"
}

export enum DeliveredLocation {
  DELIVERED_TO_GUEST,
  DELIVERED_TO_GUEST_DOOR,
  DELIVERED_TO_DESK,
  OTHERS
}
