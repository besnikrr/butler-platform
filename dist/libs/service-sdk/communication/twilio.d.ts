import { Twilio } from "twilio";
export declare const TwilioClient: (accountSid?: string, authToken?: string, twilioTestAvailableNumber?: string, twilioSMSUrl?: string) => {
    client: Twilio;
    provisionPhoneNumber: (input: {
        name: string;
        coordinates: string;
        voiceUrl: string;
    }) => Promise<import("twilio/lib/rest/api/v2010/account/incomingPhoneNumber").IncomingPhoneNumberInstance>;
};
