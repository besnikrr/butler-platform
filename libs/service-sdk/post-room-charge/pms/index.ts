import axios from "axios";
import { logger } from "../../logger";

export interface IPostRoomChargeInput {
  room_number: string,
  oms_hotel_id: number,
  amount: number,
  order_id: number,
  status: string
}

const PMS_URLS = {
  local: process.env.PMS_URL_LOCAL,
  dev: process.env.PMS_URL_DEV,
  qa: process.env.PMS_URL_QA,
  prod: process.env.PMS_URL_PROD
};

const getPMSUrl = (stage: string) => {
  return PMS_URLS[stage];
};

const sendToPMS = async (data: IPostRoomChargeInput) => {
  if (process.env.STAGE === "test" || process.env.NODE_ENV === "test") {
    return "Success";
  }

  const pmsUrl = getPMSUrl(process.env.STAGE);
  return axios.post(pmsUrl, data);
};

export const PMSProvider = () => {
  const post = async (data: IPostRoomChargeInput) => {
    try {
      await sendToPMS(data);
      logger.log("Pms post room charge finished successfully", data);
    } catch (e) {
      logger.log("[PMS-post-room-charge]: ", e.message);
    }
  };

  return {
    post
  };
};
