"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPaymentService = void 0;
const square_1 = require("./square");
const interfaces_1 = require("./interfaces");
const squareService = new square_1.SquareService();
const getPaymentService = (type) => {
    switch (type) {
        case interfaces_1.PaymentProvider.SQUARE:
            return squareService;
        default:
            throw new Error("Payment type not supported");
    }
};
exports.getPaymentService = getPaymentService;
exports.default = exports.getPaymentService;
//# sourceMappingURL=index.js.map