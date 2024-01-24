import * as request from "supertest";
import { MikroORM } from "@mikro-orm/core";
import * as path from "path";
import entitiesArray from "../../utils/entities";
import * as express from "express";
import routes from "../route";
import { ActionRequest, clearDatabase, getTestConnection, seedDatabase } from "@butlerhospitality/service-sdk";
import * as bodyParser from "body-parser";
import { mockedTenant } from "@butlerhospitality/shared";
import { IRejectOrderOutput } from "../usecases/reject-order";
import useCase from "../usecases";

jest.mock("../usecases");
const useCaseMocked = useCase as jest.MockedFunction<typeof useCase>;

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

type Payload = { version?: number; reason?: string };

let conn: MikroORM;
const setupTest = async () => {
  conn = await getTestConnection(process.env.TEST_DB, entitiesArray);
  await seedDatabase(conn, path.join(__dirname, "..", "..", ".."));
  app.use((req: ActionRequest, _: any, next: any) => {
    req.conn = conn;
    req.tenant = mockedTenant.name;
    return next();
  });
  app.use(routes);
};

beforeAll(() => {
  return setupTest();
});

const teardownTest = async () => {
  await clearDatabase(conn);
  await conn.close(true);
};

afterAll(() => {
  return teardownTest();
});

const useCases = {
  getOrder: jest.fn(),
  listOrders: jest.fn(),
  refundOrder: jest.fn(),
  updateOrder: jest.fn(),
  rejectOrder: jest.fn(),
  cancelOrder: jest.fn(),
  pickupOrder: jest.fn(),
  createOrder: jest.fn(),
  confirmOrder: jest.fn(),
  completeOrder: jest.fn(),
  assignFoodCarrierToOrder: jest.fn(),
  deliverOrder: jest.fn(),
  listHubsWithOrderCount: jest.fn()
};

describe("Order Routes", () => {
  describe("RejectOrder", () => {
    const bodyCases = [
      [{}, 422],
      [{ version: 1 }, 422],
      [{ reason: "Test" }, 422],
      [{ version: 1, reason: "" }, 422],
      [{ version: 0, reason: "Test" }, 422],
      [{ version: 1, reason: "Test", prop: "test" }, 422]
    ];

    // eslint-disable-next-line max-len
    test.each(bodyCases)("should validate payload: %p and return status code: %p", async (payload: Payload, expected: number) => {
      const response = await request(app)
        .patch("/api/order/1/reject")
        .set("Accept", "application/json")
        .send(payload);
      expect(response.status).toEqual(expected);
    });

    it("should call rejectOrder useCase", async () => {
      const payload = { version: 1, reason: "Test" };
      const rejectOrder = jest.fn((): Promise<IRejectOrderOutput> => Promise.resolve({}));
      useCaseMocked.mockImplementation(() => ({ ...useCases, rejectOrder }));
      await request(app)
        .patch("/api/order/1/reject")
        .set("Accept", "application/json")
        .send(payload);
      expect(rejectOrder).toHaveBeenCalledWith(1, payload);
    });
  });
});
