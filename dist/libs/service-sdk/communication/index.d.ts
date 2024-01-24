export declare enum CommunicationClient {
    TWILIO = 0
}
export interface ICommunicationClient {
    provisionPhoneNumber(input: {
        name: string;
        coordinates: string;
        voiceUrl: string;
    }): Promise<void>;
}
export declare const communicationClient: (client: CommunicationClient) => Promise<{
    client: import("twilio/lib/rest/Twilio");
    provisionPhoneNumber: (input: {
        name: string;
        coordinates: string;
        voiceUrl: string;
    }) => Promise<import("twilio/lib/rest/api/v2010/account/incomingPhoneNumber").IncomingPhoneNumberInstance>;
}>;
