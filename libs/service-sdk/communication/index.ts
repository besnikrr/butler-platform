import { TwilioClient } from "./twilio";
import { SecretManagerService } from "../secret-manager";
export enum CommunicationClient {
	TWILIO
}

export interface ICommunicationClient {
	provisionPhoneNumber(input: { name: string, coordinates: string, voiceUrl: string }): Promise<void>
}

export const communicationClient = async (client: CommunicationClient) => {
  switch (client) {
  case CommunicationClient.TWILIO: {
    const SecretId = `${process.env.STAGE == "local" ? "dev" : process.env.STAGE}/twilio`;
    const secretValues = await SecretManagerService().getSecretValue(SecretId);
    const {
      TWILIO_ACCOUNT_SID: twilioAccountId,
      TWILIO_AUTH_TOKEN: twilioAuthToken,
      TWILIO_TEST_AVAILABLE_NUMBER: twilioTestAvailableNumber,
      TWILIO_SMS_URL: twilioSMSUrl
    } = secretValues;
    if (twilioAccountId && twilioAuthToken) {
      return TwilioClient(twilioAccountId, twilioAuthToken, twilioTestAvailableNumber, twilioSMSUrl);
    }
    throw new Error("TWILIO_ACCOUNT_SID or TWILIO_AUTH_TOKEN env variables must be set");
  }
  default:
    throw new Error(`Communication client ${client} not supported`);
  }
};
