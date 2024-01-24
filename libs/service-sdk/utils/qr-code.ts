import * as QRCode from "qrcode";

export const generateQRCode = async (data, version = 8) => {
  return await QRCode.toDataURL(data, { version });
};
