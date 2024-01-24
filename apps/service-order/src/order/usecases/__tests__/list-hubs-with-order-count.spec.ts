import { clearDatabase, getTestConnection, seedDatabase } from "@butlerhospitality/service-sdk";
import { MikroORM } from "@mikro-orm/core";
import listHubsWithOrderCount, {
  IListHubsWithOrderCountInput,
  IListHubsWithOrderCountOutput
} from "../list-hubs-with-order-count";
import entitiesArray from "../../../utils/entities";
import * as path from "path";
import { EntityManager } from "@mikro-orm/postgresql";
import { OrderStatus } from "../../shared/enums";

describe("listHubsWithOrderCount", () => {
  let orm: MikroORM;
  beforeAll(async () => {
    const conn = await getTestConnection(process.env.TEST_DB, entitiesArray);
    await seedDatabase(conn, path.join(__dirname, "..", "..", "..", ".."));

    orm = conn;
  });

  beforeEach(() => {
    jest.spyOn((orm.em as EntityManager), "createQueryBuilder").mockImplementation(() => ({
      select() {
        return this;
      },
      where() {
        return this;
      },
      join() {
        return this;
      },
      groupBy() {
        return this;
      },
      execute() {
        return [
          {
            status: "IN_DELIVERY",
            hub_id: 1,
            hub_name: "Hub1",
            count: "1",
            status_count: "1"
          },
          {
            status: "PREPARATION",
            hub_id: 1,
            hub_name: "Hub1",
            count: "2",
            status_count: "2"
          },
          {
            status: "PENDING",
            hub_id: 2,
            hub_name: "Hub1",
            count: "1",
            status_count: "1"
          }
        ];
      }
    } as any));
  });

  it("should return an object with the correct structure", async () => {
    const input: IListHubsWithOrderCountInput = {
      hubIds: [1, 2, 3]
    };
    const expectedOutput: IListHubsWithOrderCountOutput = {
      "hubs": [
        {
          "hubId": 1,
          "hubName": "Hub1",
          "count": 3
        },
        {
          "hubId": 2,
          "hubName": "Hub1",
          "count": 1
        }
      ],
      "statuses": [
        {
          "status": OrderStatus.PENDING,
          "count": 1
        },
        {
          "status": OrderStatus.CONFIRMATION,
          "count": 0
        },
        {
          "status": OrderStatus.PREPARATION,
          "count": 2
        },
        {
          "status": OrderStatus.IN_DELIVERY,
          "count": 1
        },
        {
          "status": OrderStatus.DELIVERED,
          "count": 0
        },
        {
          "status": OrderStatus.CANCELLED,
          "count": 0
        },
        {
          "status": OrderStatus.REJECTED,
          "count": 0
        },
        {
          "status": OrderStatus.MERGED,
          "count": 0
        },
        {
          "status": OrderStatus.SCHEDULED,
          "count": 0
        }
      ]
    };

    const result = await listHubsWithOrderCount({ conn: orm })(input);
    expect(result).toEqual(expectedOutput);
  });

  afterAll(async () => {
    await clearDatabase(orm);
    await orm?.close(true);
  });
});
