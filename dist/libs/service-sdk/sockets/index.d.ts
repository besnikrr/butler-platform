import { WebSocketProvider } from "./interfaces";
import { APIGatewayWebSocketService } from "./api-gateway";
declare const getWebSocketService: (type: WebSocketProvider) => APIGatewayWebSocketService;
export { getWebSocketService };
