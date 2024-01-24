import { SegmentProvider } from "./segment";
declare enum AnalyticsProviderType {
    SEGMENT = "SEGMENT"
}
declare class AnalyticsProvider {
    providerType: string;
    provider: typeof SegmentProvider;
    constructor(providerType: AnalyticsProviderType);
    track(event: string, userId: number, properties: object): Promise<void>;
}
declare const analytics: (providerType: AnalyticsProviderType) => AnalyticsProvider;
export { analytics, AnalyticsProviderType };
