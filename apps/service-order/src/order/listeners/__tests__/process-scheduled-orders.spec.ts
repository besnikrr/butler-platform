import { clearDatabase, connection, DIConnectionObject, getTestConnection, seedDatabase } from "@butlerhospitality/service-sdk";
import { MikroORM } from "@mikro-orm/core";
import * as path from "path";
import entitiesArray from "../../../utils/entities";
import { processScheduledOrders } from "../process-scheduled-orders";

let conn: MikroORM;
const setupTest = async () => {
  conn = await getTestConnection(process.env.TEST_DB, entitiesArray);
  await seedDatabase(conn, path.join(__dirname, "..", "..", "..", ".."));
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

describe("ProcessScheduledOrders", () => {
  beforeEach(async () => {
    jest.restoreAllMocks();
    jest.resetAllMocks();
    jest.useFakeTimers();
    jest.spyOn(connection, "getConnection").mockImplementationOnce(
      () => Promise.resolve({ conn } as DIConnectionObject<any>)
    );
  });

  // DB record with scheduled date: 2022-05-11T11:45:00.000Z
  const cases = [
    ["2022-05-11T12:32:00.000Z", 0],
    ["2022-05-11T12:30:59.000Z", 1],
    ["2022-05-11T12:30:01.000Z", 1],
    ["2022-05-11T12:28:55.000Z", 0]
  ];
  test.each(cases)("should search for scheduled order with time: %p and to have result %p", async (time: string, resultLen: number) => {
    jest.setSystemTime(new Date(time).getTime());
    const spy = jest.spyOn(conn.em, "find");
    await processScheduledOrders();
    const value = await spy.mock.results[0].value;
    expect(value.length).toEqual(resultLen);
  });

  afterEach(async () => {
    await clearDatabase(conn);
    await seedDatabase(conn, path.join(__dirname, "..", "..", "..", ".."));
  });
});
