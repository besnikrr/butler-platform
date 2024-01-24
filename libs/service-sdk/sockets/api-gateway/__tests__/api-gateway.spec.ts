import faker from "@faker-js/faker";
import { IWebsocketBroadcastMessageInput, StatusCodes } from "libs/service-sdk";
import { getWebSocketService } from "@butlerhospitality/service-sdk";
import {
  WebSocketProvider,
  IWebsocketConnectOutput,
  IWebscoketDisconnectOutput
} from "@butlerhospitality/service-sdk";

describe("api-gateway socket tests", () => {
  const connectionId = faker.random.alphaNumeric(10);
  const socketService = getWebSocketService(WebSocketProvider.APIGATEWAY);

  beforeAll(async () => {
    jest.restoreAllMocks();
  });

  it("should connect to socket", async () => {
    const connectSpyMock = jest.spyOn(socketService, "connect")
      .mockImplementation((): Promise<IWebsocketConnectOutput> => {
        return Promise.resolve({ statusCode: StatusCodes.OK });
      });

    await socketService.connect({ connectionId });
    expect(connectSpyMock).toHaveBeenCalled();
  });

  it("should disconnect from socket", async () => {
    const disconnectSpyMock = jest.spyOn(socketService, "disconnect")
      .mockImplementation((): Promise<IWebscoketDisconnectOutput> => {
        return Promise.resolve({ statusCode: StatusCodes.OK });
      });

    await socketService.disconnect({ connectionId });
    expect(disconnectSpyMock).toHaveBeenCalled();
  });

  it("should connect and broadcast to socket", async () => {
    const connectSpyMock = jest.spyOn(socketService, "connect")
      .mockImplementation((): Promise<IWebsocketConnectOutput> => {
        return Promise.resolve({ statusCode: StatusCodes.OK });
      });

    const broadcastSpyMock = jest.spyOn(socketService, "broadcast")
      .mockImplementation((): Promise<IWebsocketConnectOutput> => {
        return Promise.resolve({ statusCode: StatusCodes.OK });
      });

    await socketService.connect({ connectionId });
    const broadCastParameters: IWebsocketBroadcastMessageInput = {
      connectionIds: [connectionId],
      action: "order-created"
    };
    socketService.broadcast(broadCastParameters);
    expect(connectSpyMock).toHaveBeenCalled();
    expect(broadcastSpyMock).toHaveBeenCalled();
  });
});
