"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parsePaginationParam = void 0;
const utils_1 = require("../utils");
const parsePaginationParam = (reqQuery) => {
    var _a;
    if ((reqQuery === null || reqQuery === void 0 ? void 0 : reqQuery.page) && reqQuery.page < 1) {
        throw new utils_1.BadRequestError("Page should not be less than 1");
    }
    if ((reqQuery === null || reqQuery === void 0 ? void 0 : reqQuery.limit) && reqQuery.limit < 0) {
        throw new utils_1.BadRequestError("Limit should not be less than 0");
    }
    return {
        page: (reqQuery === null || reqQuery === void 0 ? void 0 : reqQuery.page) ? Number(reqQuery.page) : 1,
        limit: (reqQuery === null || reqQuery === void 0 ? void 0 : reqQuery.limit) ? Number(reqQuery.limit) : 10,
        paginate: (_a = reqQuery === null || reqQuery === void 0 ? void 0 : reqQuery.paginate) !== null && _a !== void 0 ? _a : true
    };
};
exports.parsePaginationParam = parsePaginationParam;
//# sourceMappingURL=parse.js.map