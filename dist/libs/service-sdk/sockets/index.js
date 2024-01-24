"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getWebSocketService = void 0;
const interfaces_1 = require("./interfaces");
const api_gateway_1 = require("./api-gateway");
const getWebSocketService = (type) => {
    switch (type) {
        case interfaces_1.WebSocketProvider.APIGATEWAY:
            return new api_gateway_1.APIGatewayWebSocketService();
        default:
            throw new Error("WebSocket type not supported");
    }
};
exports.getWebSocketService = getWebSocketService;
//# sourceMappingURL=index.js.map