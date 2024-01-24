import { STAGE } from "@butlerhospitality/shared";
import { Twilio } from "twilio";
import { IncomingPhoneNumberInstance } from "twilio/lib/rest/api/v2010/account/incomingPhoneNumber";
import { logger } from "../logger";

export const TwilioClient = (accountSid?: string, authToken?: string,
  twilioTestAvailableNumber?: string, twilioSMSUrl?: string) => {
  let client: Twilio = null;
  if (!client) {
    client = new Twilio(accountSid, authToken);
  }

  const provisionPhoneNumber = async (
    input: { name: string, coordinates: string, voiceUrl: string }
  ): Promise<IncomingPhoneNumberInstance> => {
    if (!client) {
      throw new Error("Twilio client not initiated");
    }
    const { name, coordinates, voiceUrl } = input;
    if (process.env.STAGE !== STAGE.prod) {
      return await createTestNumber();
    }

    const availableNumberDetails = await client.availablePhoneNumbers("US").local.list({
      nearLatLong: coordinates,
      limit: 1
    });
    if (availableNumberDetails?.length < 1) {
      throw new Error("Could not find any suitable number");
    }
    const availableNumber = availableNumberDetails[0].phoneNumber;
    const phoneNumberDetails = await client.incomingPhoneNumbers.create({
      phoneNumber: availableNumber,
      friendlyName: name
    });
    await updateSmsUrl(phoneNumberDetails, voiceUrl);
    return phoneNumberDetails;
  };

  const createTestNumber = async () => {
    // provision phone number - only for testing purpose
    try {
      return await client.incomingPhoneNumbers.create({
        phoneNumber: twilioTestAvailableNumber
      });
    } catch (e) {
      logger.log(e);
      throw new Error("Could not create phone number");
    }
  };

  const updateSmsUrl = async (incomingNumber: { sid: string }, voiceUrl: string) => {
    // Due to how Kustomer works, we need to update the associated sms url so that SMS can be executed properly
    try {
      await client.incomingPhoneNumbers(incomingNumber.sid).update({
        smsUrl: twilioSMSUrl,
        smsMethod: "POST",
        voiceUrl: voiceUrl,
        voiceMethod: "POST"
      });
    } catch (e) {
      logger.log(e);
      throw new Error("Update sms url failed");
    }
  };

  return {
    client,
    provisionPhoneNumber
  };
};

