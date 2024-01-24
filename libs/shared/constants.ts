export const SNS_TOPIC = {
  IAM: {
    USER: process.env.ServiceIamUserTopic || "ServiceIamUserTopic"
  },
  NETWORK: {
    HUB: process.env.ServiceNetworkHubTopic || "ServiceNetworkHubTopic",
    HOTEL: process.env.ServiceNetworkHotelTopic || "ServiceNetworkHotelTopic",
    CITY: process.env.ServiceNetworkCityTopic || "ServiceNetworkCityTopic"
  },
  MENU: {
    MODIFIER: process.env.ServiceMenuModifierTopic || "ServiceMenuModifierTopic",
    LABEL: process.env.ServiceMenuLabelTopic || "ServiceMenuLabelTopic",
    CATEGORY: process.env.ServiceMenuCategoryTopic || "ServiceMenuCategoryTopic",
    PRODUCT: process.env.ServiceMenuProductTopic || "ServiceMenuProductTopic",
    MENU: process.env.ServiceMenuMenuTopic || "ServiceMenuMenuTopic"
  },
  VOUCHER: {
    PROGRAM: process.env.ServiceVoucherProgramTopic || "ServiceVoucherProgramTopic"
  },
  ORDER: {
    ORDER: process.env.ServiceOrderOrderTopic || "ServiceOrderOrderTopic"
  }
};

export const ENTITY = {
  IAM: {
    USER: "user"
  },
  NETWORK: {
    CITY: "city",
    HUB: "hub",
    HOTEL: "hotel"
  },
  MENU: {
    MODIFIER: "modifier",
    CATEGORY: "category",
    PRODUCT: "product",
    MENU: "menu",
    OUT_OF_STOCK: "out-of-stock",
    LABEL: "label"
  },
  VOUCHER: {
    PROGRAM: "program"
  },
  ORDER: {
    ORDER: "order"
  }
};

export enum STAGE {
  test = "test",
  dev = "dev",
  local = "local",
  prod = "prod",
  qa = "qa",
}
