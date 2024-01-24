"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SquareService = exports.InvalidCreateCustomerError = exports.InvalidCreateCardError = exports.InvalidCompleteError = exports.InvalidCancelError = exports.InvalidUpdateError = exports.InvalidRefundError = exports.InvalidTokenError = void 0;
const tslib_1 = require("tslib");
const shared_1 = require("@butlerhospitality/shared");
const service_sdk_1 = require("libs/service-sdk");
const square_1 = require("square");
const interfaces_1 = require("../interfaces");
class InvalidTokenError extends service_sdk_1.BaseError {
}
exports.InvalidTokenError = InvalidTokenError;
class InvalidRefundError extends service_sdk_1.BaseError {
}
exports.InvalidRefundError = InvalidRefundError;
class InvalidUpdateError extends service_sdk_1.BaseError {
}
exports.InvalidUpdateError = InvalidUpdateError;
class InvalidCancelError extends service_sdk_1.BaseError {
}
exports.InvalidCancelError = InvalidCancelError;
class InvalidCompleteError extends service_sdk_1.BaseError {
}
exports.InvalidCompleteError = InvalidCompleteError;
class InvalidCreateCardError extends service_sdk_1.BaseError {
}
exports.InvalidCreateCardError = InvalidCreateCardError;
class InvalidCreateCustomerError extends service_sdk_1.BaseError {
}
exports.InvalidCreateCustomerError = InvalidCreateCustomerError;
class SquareService {
    constructor() {
        this.client = new square_1.Client({
            environment: process.env.STAGE === "local" || process.env.STAGE === "development" ?
                square_1.Environment.Sandbox : square_1.Environment.Production,
            accessToken: process.env.SQUARE_ACCESS_TOKEN
        });
        this.createCustomer = (body) => tslib_1.__awaiter(this, void 0, void 0, function* () {
            var _a;
            const { customersApi } = this.client;
            let response;
            try {
                const { result } = yield customersApi.createCustomer(body);
                response = {
                    id: (_a = result.customer) === null || _a === void 0 ? void 0 : _a.id
                };
            }
            catch (error) {
                if (error instanceof square_1.ApiError) {
                    const { errors } = error.result;
                    const { statusCode } = error;
                    if (statusCode === 400 || statusCode === 404) {
                        throw new InvalidCreateCustomerError(errors[0].code, statusCode, "Customer is not able to be created");
                    }
                }
            }
            return response;
        });
        this.createCard = (body) => tslib_1.__awaiter(this, void 0, void 0, function* () {
            var _b;
            const { cardsApi } = this.client;
            let response;
            try {
                const { result } = yield cardsApi.createCard(body);
                response = {
                    id: (_b = result.card) === null || _b === void 0 ? void 0 : _b.id
                };
            }
            catch (error) {
                if (error instanceof square_1.ApiError) {
                    const { errors } = error.result;
                    const { statusCode } = error;
                    if (statusCode === 400 || statusCode === 404) {
                        throw new InvalidCreateCardError(errors[0].code, statusCode, "Card is not able to be created");
                    }
                }
            }
            return response;
        });
        this.createPayment = (body) => tslib_1.__awaiter(this, void 0, void 0, function* () {
            const { paymentsApi } = this.client;
            let response;
            try {
                const { result } = yield paymentsApi.createPayment(body);
                response = {
                    transactionId: result.payment.id,
                    versionToken: result.payment.versionToken
                };
            }
            catch (error) {
                if (error instanceof square_1.ApiError) {
                    const { errors } = error.result;
                    const { statusCode } = error;
                    if (statusCode === 400 || statusCode === 404) {
                        throw new InvalidTokenError(errors[0].code, statusCode, "Card is not valid");
                    }
                }
            }
            return response;
        });
        this.refundPayment = (body) => tslib_1.__awaiter(this, void 0, void 0, function* () {
            const { refundsApi } = this.client;
            let response;
            try {
                const { result } = yield refundsApi.refundPayment(body);
                response = {
                    id: result.refund.id
                };
            }
            catch (error) {
                if (error instanceof square_1.ApiError) {
                    const { errors } = error.result;
                    const { statusCode } = error;
                    if (statusCode === 400 || statusCode === 404) {
                        throw new InvalidRefundError(errors[0].code, statusCode, "Something went wrong with refund");
                    }
                }
            }
            return response;
        });
        this.updatePayment = (paymentId, body) => tslib_1.__awaiter(this, void 0, void 0, function* () {
            const { paymentsApi } = this.client;
            let response;
            try {
                const { result } = yield paymentsApi.updatePayment(paymentId, body);
                response = {
                    id: result.payment.id
                };
            }
            catch (error) {
                if (error instanceof square_1.ApiError) {
                    const { errors } = error.result;
                    const { statusCode } = error;
                    if (statusCode === 400 || statusCode === 404) {
                        throw new InvalidUpdateError(errors[0].code, statusCode, "Something went wrong with update payment");
                    }
                }
            }
            return response;
        });
        this.cancelPayment = (paymentId) => tslib_1.__awaiter(this, void 0, void 0, function* () {
            const { paymentsApi } = this.client;
            let response;
            try {
                const { result } = yield paymentsApi.cancelPayment(paymentId);
                response = {
                    id: result.payment.id
                };
            }
            catch (error) {
                if (error instanceof square_1.ApiError) {
                    const { errors } = error.result;
                    const { statusCode } = error;
                    if (statusCode === 400 || statusCode === 404) {
                        throw new InvalidCancelError(errors[0].code, statusCode, "Something went wrong with cancel payment");
                    }
                }
            }
            return response;
        });
        this.completePayment = (paymentId, body) => tslib_1.__awaiter(this, void 0, void 0, function* () {
            const { paymentsApi } = this.client;
            let response;
            try {
                const { result } = yield paymentsApi.completePayment(paymentId, body);
                response = {
                    id: result.payment.id
                };
            }
            catch (error) {
                if (error instanceof square_1.ApiError) {
                    const { errors } = error.result;
                    const { statusCode } = error;
                    if (statusCode === 400 || statusCode === 404) {
                        throw new InvalidCompleteError(errors[0].code, statusCode, "Something went wrong with complete payment");
                    }
                }
                throw error;
            }
            return response;
        });
    }
    pay(input) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const bodyForCustomerRequest = {};
            bodyForCustomerRequest.emailAddress = input.clientEmail;
            bodyForCustomerRequest.phoneNumber = input.clientPhoneNumber;
            bodyForCustomerRequest.givenName = input.clientName.substring(0, input.clientName.lastIndexOf(" ") + 1);
            bodyForCustomerRequest.familyName = input.clientName.substring(input.clientName.lastIndexOf(" ") + 1, input.clientName.length);
            const customer = yield this.createCustomer(bodyForCustomerRequest);
            const bodyCard = {};
            bodyCard.customerId = customer.id;
            const bodyForCardRequest = {
                card: bodyCard,
                sourceId: input.nonce,
                idempotencyKey: shared_1.uuidv4()
            };
            const card = yield this.createCard(bodyForCardRequest);
            const bodyAmountMoney = {};
            bodyAmountMoney.amount = BigInt(input.amount);
            bodyAmountMoney.currency = interfaces_1.Currencies.USD;
            const bodyTipMoney = {};
            if (input.tip !== null && input.tip !== undefined) {
                bodyTipMoney.amount = BigInt(input.tip);
                bodyTipMoney.currency = interfaces_1.Currencies.USD;
            }
            const body = {
                sourceId: card.id,
                idempotencyKey: shared_1.uuidv4(),
                amountMoney: bodyAmountMoney
            };
            body.autocomplete = false;
            body.tipMoney = bodyTipMoney;
            body.customerId = customer.id;
            body.locationId = process.env.SQUARE_LOCATION_ID;
            return this.createPayment(body);
        });
    }
    refund(input) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const bodyAmountMoney = {};
            bodyAmountMoney.amount = BigInt(input.amount);
            bodyAmountMoney.currency = interfaces_1.Currencies.USD;
            const body = {
                idempotencyKey: shared_1.uuidv4(),
                amountMoney: bodyAmountMoney
            };
            body.paymentId = input.paymentId;
            body.reason = input.reason;
            return this.refundPayment(body);
        });
    }
    update(input) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const { paymentId } = input;
            const bodyPayment = {};
            if (input.amount !== null && input.amount !== undefined) {
                const bodyPaymentAmountMoney = {};
                bodyPaymentAmountMoney.amount = BigInt(input.amount);
                bodyPaymentAmountMoney.currency = interfaces_1.Currencies.USD;
                bodyPayment.amountMoney = bodyPaymentAmountMoney;
            }
            if (input.tip !== null && input.tip !== undefined) {
                const bodyPaymentTipMoney = {};
                bodyPaymentTipMoney.amount = BigInt(input.tip);
                bodyPaymentTipMoney.currency = interfaces_1.Currencies.USD;
                bodyPayment.tipMoney = bodyPaymentTipMoney;
            }
            const body = {
                idempotencyKey: shared_1.uuidv4()
            };
            body.payment = bodyPayment;
            return this.updatePayment(paymentId, body);
        });
    }
    complete(input) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const body = {};
            if (input.versionToken !== null) {
                body.versionToken = input.versionToken;
            }
            return this.completePayment(input.paymentId, body);
        });
    }
    cancel(input) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return this.cancelPayment(input.paymentId);
        });
    }
}
exports.SquareService = SquareService;
//# sourceMappingURL=index.js.map