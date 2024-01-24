"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getServiceDBConnection = void 0;
const tslib_1 = require("tslib");
const service_sdk_1 = require("@butlerhospitality/service-sdk");
const shared_1 = require("@butlerhospitality/shared");
const getServiceDBConnection = (dep) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    const { tenant, service, entities } = dep;
    const serviceConnection = {
        [shared_1.AppEnum.NETWORK]: {
            tenant,
            dbname: process.env.NETWORK_DB,
            entities,
            service: shared_1.AppEnum.NETWORK,
            pooling: true
        },
        [shared_1.AppEnum.MENU]: {
            tenant,
            dbname: process.env.MENU_DB,
            entities,
            service: shared_1.AppEnum.MENU,
            pooling: true
        },
        [shared_1.AppEnum.VOUCHER]: {
            tenant,
            dbname: process.env.VOUCHER_DB,
            entities,
            service: shared_1.AppEnum.VOUCHER,
            pooling: true
        },
        [shared_1.AppEnum.DISCOUNT]: {
            tenant,
            dbname: process.env.DISCOUNT_DB,
            entities,
            service: shared_1.AppEnum.DISCOUNT,
            pooling: true
        },
        [shared_1.AppEnum.IAM]: {
            tenant,
            dbname: process.env.IAM_DB,
            entities,
            service: shared_1.AppEnum.IAM,
            pooling: true
        },
        [shared_1.AppEnum.ORDER]: {
            tenant,
            dbname: process.env.ORDER_DB,
            entities,
            service: shared_1.AppEnum.ORDER,
            pooling: true
        }
    }[service];
    if (!serviceConnection) {
        throw new Error(`No connection found for service ${service} and tenant ${tenant}`);
    }
    return service_sdk_1.connection.getConnection(serviceConnection);
});
exports.getServiceDBConnection = getServiceDBConnection;
//# sourceMappingURL=service-db-connection.js.map