
import {
  clearDatabase, ConflictError, getTestConnection, NotFoundError, seedDatabase
} from "@butlerhospitality/service-sdk";
import { faker } from "@faker-js/faker";
import { MikroORM } from "@mikro-orm/core";
import * as path from "path";
import Label from "../../entities/label";
import updateLabel, { IUpdateLabelInput } from "../update-label";
import { MenuEntities } from "../../../entities";
import { ILabelRepository } from "../../repository";

describe("Update label usecase", () => {
  const expectResponseToHaveKeys = (label: Label) => {
    for (const property of Object.getOwnPropertyNames(label)) {
      expect(label).toHaveProperty(property);
    }
  };

  let orm: MikroORM;
  let labelRepository: ILabelRepository;
  let labelToUpdate: Label;
  beforeAll(async () => {
    const conn = await getTestConnection(process.env.TEST_DB, MenuEntities.asArray());
    orm = conn;
    await seedDatabase(conn, path.join(__dirname, "..", "..", "..", ".."));
    labelRepository = conn.em.getRepository(Label);
    labelToUpdate = await labelRepository.findOne({});
  });

  const data: IUpdateLabelInput = {
    name: faker.commerce.productMaterial()
  };

  it("should update a label", async () => {
    const label = await updateLabel({ labelRepository })(labelToUpdate.id, data);

    expectResponseToHaveKeys(label);
    expect(label.id).toBeGreaterThan(0);
    expect(label.name).toEqual(data.name);
  });

  it("should fail to update a label", async () => {
    await expect(async () => updateLabel({ labelRepository })(-1, data)).rejects.toThrow(NotFoundError);
  });

  it("should fail to update a label that has an existing name", async () => {
    const label = await labelRepository.findOne({ id: { $ne: labelToUpdate.id } });

    await expect(
      async () => updateLabel({ labelRepository })(labelToUpdate.id, { name: label.name })
    ).rejects.toThrow(ConflictError);
  });

  afterAll(async () => {
    await clearDatabase(orm);

    await orm.close(true);
  });
});
