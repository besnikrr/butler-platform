import { WebSocketProvider } from "./interfaces";
import { APIGatewayWebSocketService } from "./api-gateway";

const getWebSocketService = (type: WebSocketProvider) => {
  switch (type) {
  case WebSocketProvider.APIGATEWAY:
    return new APIGatewayWebSocketService();
  default:
    throw new Error("WebSocket type not supported");
  }
};

export { getWebSocketService };
