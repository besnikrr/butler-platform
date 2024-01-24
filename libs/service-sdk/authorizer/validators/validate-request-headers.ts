import { logger } from "libs/service-sdk/logger";

const validateRequestHeaders = async (event: any) => {
  logger.log("headers: ", event.headers);
  const requiredHeaders: any = {
    Origin: event.headers.referer || event.headers.Referer ||
        event.headers.Authority || event.headers.authority || event.headers.Origin || event.headers.origin,
    Authorization: event.headers.Authorization || event.headers.authorization,
    Host: event.headers.Host || event.headers.host
  };

  const missingHeaders = Object.keys(
    requiredHeaders
  ).filter((key: string) => {
    const header = requiredHeaders[key];
    return header === undefined || header === null;
  });

  if (missingHeaders && missingHeaders.length) {
    let msg = "";
    missingHeaders.forEach((header) => {
      msg += `Missing header [${header}]\n`;
    });
    throw new Error(msg);
  }
};

export {
  validateRequestHeaders
};
