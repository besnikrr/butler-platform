"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.appsDefinitionLocal = exports.AppEnum = void 0;
var AppEnum;
(function (AppEnum) {
    AppEnum["TENANT"] = "tenant";
    AppEnum["NETWORK"] = "network";
    AppEnum["MENU"] = "menu";
    AppEnum["VOUCHER"] = "voucher";
    AppEnum["DISCOUNT"] = "discount";
    AppEnum["IAM"] = "iam";
    AppEnum["ORDER"] = "order";
})(AppEnum = exports.AppEnum || (exports.AppEnum = {}));
exports.appsDefinitionLocal = {
    [AppEnum.TENANT]: {
        port: 3332,
        title: "TenantService",
        description: "Tenant Service"
    },
    [AppEnum.NETWORK]: {
        port: 3333,
        title: "Network Service",
        description: "Network Service"
    },
    [AppEnum.MENU]: {
        port: 3222,
        title: "Menu Service",
        description: "Menu Service"
    },
    [AppEnum.VOUCHER]: {
        port: 3335,
        title: "Voucher Service",
        description: "Voucher Service"
    },
    [AppEnum.DISCOUNT]: {
        port: 3336,
        title: "Discount Service",
        description: "Discount Service"
    },
    [AppEnum.IAM]: {
        port: 3337,
        title: "IAM Service",
        description: "Identity Access Management Service"
    },
    [AppEnum.ORDER]: {
        port: 3338,
        title: "Order Service",
        description: "Order Service"
    }
};
//# sourceMappingURL=apps-definition-local.js.map