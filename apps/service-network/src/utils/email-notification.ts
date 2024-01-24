import { generateQRCode } from "@butlerhospitality/service-sdk";
import { STAGE } from "@butlerhospitality/shared";
import { IHotel } from "../hotel/entity";
import { EMAILS } from "./constants";

export const getEmailsToNotify = () => {
  switch (process.env.STAGE) {
  case STAGE.prod:
    return [EMAILS.DEV, EMAILS.HOTELS];
  case STAGE.dev:
    return [EMAILS.DEV, EMAILS.QA];
  default:
    return [EMAILS.DEV];
  }
};

export interface IHotelProcessStatus {
  twilio: boolean,
  created: boolean
}

export const createButlerMenuQRCodes = async (hotel: IHotel, processStatus: IHotelProcessStatus) => {
  let codes = [];

  if (Object.values(processStatus).every(Boolean)) {
    const rybQR = await generateQRCode(process.env.RYB_BASE_URL + hotel.web_url_id);
    const butlerMenuQR = await generateQRCode(process.env.BUTLER_MENU_BASE_URL + hotel.web_url_id);
    codes = [
      {
        "Name": "ryb.png",
        "Content": rybQR.slice(rybQR.indexOf("base64,") + 7),
        "ContentType": "image/png"
      },
      {
        "Name": "menu.png",
        "Content": butlerMenuQR.slice(butlerMenuQR.indexOf("base64,") + 7),
        "ContentType": "image/png"
      }
    ];
  }

  return codes;
};

export const buildEmailBody = (
  hotel: IHotel, hotelStatus: IHotelProcessStatus, message: string, htmlBody: boolean = true
): string => {
  const twilioMessage = hotelStatus.twilio && hotel.phone_number ? hotel.phone_number : "Failure";
  const hotelMessage = hotelStatus.created ? hotel.name : "Failure";
  if (htmlBody) {
    return `
    <div>
    Hi there, <br>
    
    There has been a new Hotel created with these information: <br> <br>
    Hotel Name: ${hotelMessage}  <br>
    Twilio Number: ${twilioMessage}  <br> <br>
    ${message}
    </div>
    `;
  }

  return `
  Hi there,
  There has been a new Hotel created with these information:
  Hotel Name: ${hotelMessage}
  Twilio Number: ${twilioMessage}
  ${message}
  `;
};

