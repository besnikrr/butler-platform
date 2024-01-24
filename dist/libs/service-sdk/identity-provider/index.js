"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IdentityProviderType = exports.IdentityProviderFactory = void 0;
const shared_1 = require("@butlerhospitality/shared");
const types_1 = require("./types");
Object.defineProperty(exports, "IdentityProviderType", { enumerable: true, get: function () { return types_1.IdentityProviderType; } });
const cognito_1 = require("./cognito");
const IdentityProviderFactory = (factory) => {
    switch (factory.type) {
        case types_1.IdentityProviderType.Cognito:
            if (!factory.poolId) {
                factory.logger.error("poolId required");
                throw shared_1.GENERAL_ACTION_ERROR("initialize", "cognito manager");
            }
            return cognito_1.default(factory.poolId, factory.logger);
    }
};
exports.IdentityProviderFactory = IdentityProviderFactory;
//# sourceMappingURL=index.js.map