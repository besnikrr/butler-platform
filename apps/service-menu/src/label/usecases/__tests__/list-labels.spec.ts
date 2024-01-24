
import { getTestConnection, clearDatabase, seedDatabase } from "@butlerhospitality/service-sdk";
import { MikroORM } from "@mikro-orm/core";
import * as path from "path";
import Label, { ILabel } from "../../entities/label";
import listLabels from "../list-labels";
import { MenuEntities } from "../../../entities";
import { ILabelRepository } from "../../repository";

describe("List labels usecase", () => {
  const expectResponseToHaveKeys = (label: ILabel) => {
    for (const property of Object.getOwnPropertyNames(label)) {
      expect(label).toHaveProperty(property);
    }
  };

  let orm: MikroORM;
  let labelRepository: ILabelRepository;
  let labelToSearch: Label;
  beforeAll(async () => {
    const conn = await getTestConnection(process.env.TEST_DB, MenuEntities.asArray());
    orm = conn;
    await seedDatabase(conn, path.join(__dirname, "..", "..", "..", ".."));
    labelRepository = conn.em.getRepository(Label);
    labelToSearch = await labelRepository.findOne({});
  });

  it("should list all labels", async () => {
    const [labels, count] = await listLabels({ labelRepository })({ page: 1, limit: 10 });
    labels.map((label) => expectResponseToHaveKeys(label));
    expect(count).toBeGreaterThan(0);
  });

  it("should filter labels by name", async () => {
    const [labels, count] = await listLabels({
      labelRepository
    })({
      name: labelToSearch.name,
      page: 1,
      limit: 10
    });

    labels.forEach((label) => {
      expectResponseToHaveKeys(label);
      expect(label.name).toContain(labelToSearch.name);
    });

    expect(count).toBeGreaterThanOrEqual(0);
  });

  afterAll(async () => {
    await clearDatabase(orm);

    await orm.close(true);
  });
});
