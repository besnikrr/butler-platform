"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostRoomChargeType = exports.getPostRoomChargeService = void 0;
const utils_1 = require("../utils");
const pms_1 = require("./pms");
var PostRoomChargeType;
(function (PostRoomChargeType) {
    PostRoomChargeType["PMS"] = "PMS";
})(PostRoomChargeType || (PostRoomChargeType = {}));
exports.PostRoomChargeType = PostRoomChargeType;
class PostRoomChargeError extends utils_1.BaseError {
    constructor(message, code = utils_1.StatusCodes.INTERNAL_SERVER) {
        super("Post room charge error", code, message);
    }
}
const postRoomChargePMS = pms_1.PMSProvider();
const getPostRoomChargeService = (type) => {
    if (type === PostRoomChargeType.PMS) {
        return postRoomChargePMS;
    }
    else {
        throw new PostRoomChargeError(`Post room charge type ${type} is not supported`, utils_1.StatusCodes.NOT_IMPLEMENTED);
    }
};
exports.getPostRoomChargeService = getPostRoomChargeService;
//# sourceMappingURL=index.js.map