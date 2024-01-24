"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AmountType = exports.VoucherType = exports.PaymentType = exports.VoucherPayer = exports.DiscountUsage = exports.PriceMeasurementType = void 0;
var PriceMeasurementType;
(function (PriceMeasurementType) {
    PriceMeasurementType["AMOUNT"] = "AMOUNT";
    PriceMeasurementType["PERCENTAGE"] = "PERCENTAGE";
})(PriceMeasurementType = exports.PriceMeasurementType || (exports.PriceMeasurementType = {}));
var DiscountUsage;
(function (DiscountUsage) {
    DiscountUsage["SINGLE_USE"] = "SINGLE_USE";
    DiscountUsage["MULTIPLE_USE"] = "MULTIPLE_USE";
    DiscountUsage["DOLLAR_ALLOTMENT"] = "DOLLAR_ALLOTMENT";
})(DiscountUsage = exports.DiscountUsage || (exports.DiscountUsage = {}));
var VoucherPayer;
(function (VoucherPayer) {
    VoucherPayer["BUTLER"] = "BUTLER";
    VoucherPayer["HOTEL"] = "HOTEL";
})(VoucherPayer = exports.VoucherPayer || (exports.VoucherPayer = {}));
var PaymentType;
(function (PaymentType) {
    PaymentType["CREDIT_CARD"] = "CREDIT_CARD";
    PaymentType["CHARGE_TO_ROOM"] = "CHARGE_TO_ROOM";
})(PaymentType = exports.PaymentType || (exports.PaymentType = {}));
var VoucherType;
(function (VoucherType) {
    VoucherType["DISCOUNT"] = "DISCOUNT";
    VoucherType["PER_DIEM"] = "PER_DIEM";
    VoucherType["PRE_FIXE"] = "PRE_FIXE";
})(VoucherType = exports.VoucherType || (exports.VoucherType = {}));
var AmountType;
(function (AmountType) {
    AmountType["PERCENTAGE"] = "PERCENTAGE";
    AmountType["FIXED"] = "FIXED";
})(AmountType = exports.AmountType || (exports.AmountType = {}));
//# sourceMappingURL=common.js.map