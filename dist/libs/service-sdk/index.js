"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.entitiesToKeyValue = exports.getEntityFromArray = void 0;
const tslib_1 = require("tslib");
tslib_1.__exportStar(require("./authorizer"), exports);
tslib_1.__exportStar(require("./event-provider"), exports);
tslib_1.__exportStar(require("./analytics-provider"), exports);
tslib_1.__exportStar(require("./post-room-charge"), exports);
tslib_1.__exportStar(require("./identity-provider"), exports);
tslib_1.__exportStar(require("./utils"), exports);
tslib_1.__exportStar(require("./uploader"), exports);
tslib_1.__exportStar(require("./migrations"), exports);
tslib_1.__exportStar(require("./test-provider"), exports);
tslib_1.__exportStar(require("./db-provider/postgres"), exports);
tslib_1.__exportStar(require("./express"), exports);
tslib_1.__exportStar(require("./communication"), exports);
tslib_1.__exportStar(require("./logger"), exports);
tslib_1.__exportStar(require("./notification"), exports);
tslib_1.__exportStar(require("./payment"), exports);
tslib_1.__exportStar(require("./payment/interfaces"), exports);
tslib_1.__exportStar(require("./sockets"), exports);
tslib_1.__exportStar(require("./sockets/interfaces"), exports);
tslib_1.__exportStar(require("./authorizer/types"), exports);
const getEntityFromArray = (dep) => {
    const { entityName, arr } = dep;
    return exports.entitiesToKeyValue(arr)[entityName];
};
exports.getEntityFromArray = getEntityFromArray;
const entitiesToKeyValue = (input) => {
    return input.reduce((a, v) => {
        return Object.assign(Object.assign({}, a), { [v.name]: v });
    }, {});
};
exports.entitiesToKeyValue = entitiesToKeyValue;
//# sourceMappingURL=index.js.map