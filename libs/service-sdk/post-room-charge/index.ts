import { BaseError, StatusCodes } from "../utils";
import { PMSProvider, IPostRoomChargeInput } from "./pms";

enum PostRoomChargeType {
  PMS = "PMS"
}

class PostRoomChargeError extends BaseError {
  constructor(message: string, code: StatusCodes = StatusCodes.INTERNAL_SERVER) {
    super("Post room charge error", code, message);
  }
}

const postRoomChargePMS = PMSProvider();

const getPostRoomChargeService = (type: PostRoomChargeType) => {
  if (type === PostRoomChargeType.PMS) {
    return postRoomChargePMS;
  } else {
    throw new PostRoomChargeError(`Post room charge type ${type} is not supported`, StatusCodes.NOT_IMPLEMENTED);
  }
};

export { getPostRoomChargeService, PostRoomChargeType, IPostRoomChargeInput };
