import { clearDatabase, ConflictError, getTestConnection, seedDatabase } from "@butlerhospitality/service-sdk";
import { faker } from "@faker-js/faker";
import * as path from "path";
import { MikroORM } from "@mikro-orm/core";
import Label, { ILabel } from "../../entities/label";
import { MenuEntities } from "../../../entities";
import createLabel, { ICreateLabelInput } from "../create-label";
import { ILabelRepository } from "../../repository";

describe("Create label usecase", () => {
  const expectResponseToHaveKeys = (label: ILabel) => {
    for (const property of Object.getOwnPropertyNames(label)) {
      expect(label).toHaveProperty(property);
    }
  };

  let orm: MikroORM;
  let labelRepository: ILabelRepository;
  let existingLabel: ILabel;
  beforeAll(async () => {
    const conn = await getTestConnection(process.env.TEST_DB, MenuEntities.asArray());
    orm = conn;
    await seedDatabase(conn, path.join(__dirname, "..", "..", "..", ".."));
    labelRepository = conn.em.getRepository(Label);
    existingLabel = await labelRepository.findOne({});
  });

  it("should create a label", async () => {
    const data: ICreateLabelInput = {
      name: faker.commerce.productMaterial()
    };

    const label = await createLabel({ labelRepository })(data);
    expectResponseToHaveKeys(label);
    expect(label.id).toBeGreaterThan(0);
    expect(label.name).toEqual(data.name);
  });

  it("should fail creating a duplicate label", async () => {
    await expect(async () => {
      await createLabel({ labelRepository })({ name: existingLabel.name });
    }).rejects.toThrowError(ConflictError);
  });

  afterAll(async () => {
    await clearDatabase(orm);

    await orm.close(true);
  });
});
