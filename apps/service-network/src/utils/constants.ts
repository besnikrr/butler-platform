
export const SNS_TOPIC = {
  HOTEL: process.env.ServiceNetworkHotelTopic || "ServiceNetworkHotelTopic",
  HUB: process.env.ServiceNetworkHubTopic || "ServiceNetworkHubTopic",
  CITY: process.env.ServiceNetworkCityTopic || "ServiceNetworkCityTopic"
};

export enum ENTITY {
  HOTEL = "hotel",
  HUB = "hub",
  CITY = "city",
}

export const ONBOARDING_MESSAGE = "Butler Menu will automatically be updated in approximately 5 minutes. If this is a critical partner, please manually confirm that the hotel appears on our site!";

export enum EMAIL_STATUS {
  ONBOARDING_COMPLETED = "Onboarding Completed",
  ONBOARDING_FAILED = "Onboarding Failed"
}

export enum EMAILS {
  SUPPORT = "support@butlermenu.com",
  DEV = "dev@butlerhospitality.com",
  QA = "qa@butlerhospitality.com",
  HOTELS = "hotels@butlerhospitality.com"
}
