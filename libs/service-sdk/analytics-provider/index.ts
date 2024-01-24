import { BaseError, StatusCodes } from "../utils";
import { SegmentProvider } from "./segment";

enum AnalyticsProviderType {
  SEGMENT = "SEGMENT"
}

class AnalyticsError extends BaseError {
  constructor(message: string, code: StatusCodes = StatusCodes.INTERNAL_SERVER) {
    super("Analytics Error", code, message);
  }
}

class AnalyticsProvider {
  providerType: string;

  provider: typeof SegmentProvider;

  constructor(providerType: AnalyticsProviderType) {
    this.providerType = AnalyticsProviderType[providerType];

    if (this.providerType === AnalyticsProviderType.SEGMENT) {
      this.provider = SegmentProvider;
    } else {
      throw new AnalyticsError(`Analytics provider ${this.providerType} is not supported`, StatusCodes.NOT_IMPLEMENTED);
    }
  }

  async identify(userId: string, properties: object): Promise<void> {
    return this.provider().identify(userId, properties);
  }

  async track(event: string, userId: string, properties: object): Promise<void> {
    return this.provider().track(event, userId, properties);
  }

  async page(name: string, userId: string, properties: object): Promise<void> {
    return this.provider().page(name, userId, properties);
  }
}

// TODO: Arber, refactor this implementation. We don't need multiple instances for the same provider
const segmentAnalytics = new AnalyticsProvider(AnalyticsProviderType.SEGMENT);
const analytics = (providerType: AnalyticsProviderType) => {
  if (providerType === AnalyticsProviderType.SEGMENT) {
    return segmentAnalytics;
  }
  return new AnalyticsProvider(providerType);
};

export { analytics, AnalyticsProviderType };
