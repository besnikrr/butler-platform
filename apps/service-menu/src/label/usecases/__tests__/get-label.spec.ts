import {
  clearDatabase, getTestConnection, NotFoundError, seedDatabase
} from "@butlerhospitality/service-sdk";
import { MikroORM } from "@mikro-orm/core";
import * as path from "path";
import Label, { ILabel } from "../../entities/label";
import getLabel from "../get-label";
import { MenuEntities } from "../../../entities";
import { ILabelRepository } from "../../repository";

describe("Get label usecase", () => {
  const expectResponseToHaveKeys = (label: ILabel) => {
    for (const property of Object.getOwnPropertyNames(label)) {
      expect(label).toHaveProperty(property);
    }
  };

  let orm: MikroORM;
  let labelRepository: ILabelRepository;
  let existingLabel: Label;
  beforeAll(async () => {
    const conn = await getTestConnection(process.env.TEST_DB, MenuEntities.asArray());
    orm = conn;
    await seedDatabase(conn, path.join(__dirname, "..", "..", "..", ".."));
    labelRepository = conn.em.getRepository(Label);
    existingLabel = await labelRepository.findOne({});
  });

  it("should get a label", async () => {
    const label = await getLabel({ labelRepository })(existingLabel.id);

    expectResponseToHaveKeys(label);
    expect(JSON.stringify(label)).toEqual(JSON.stringify(existingLabel));
  });

  it("should fail to get a label", async () => {
    await expect(async () => getLabel({ labelRepository })(-1)).rejects.toThrow(NotFoundError);
  });

  afterAll(async () => {
    await clearDatabase(orm);

    await orm.close(true);
  });
});
