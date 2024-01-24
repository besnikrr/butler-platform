
import {
  clearDatabase, getTestConnection, NotFoundError, seedDatabase
} from "@butlerhospitality/service-sdk";
import { faker } from "@faker-js/faker";
import { MikroORM } from "@mikro-orm/core";
import * as path from "path";
import Modifier from "../../entities/modifier";
import updateModifier, { IUpdateModifierInput } from "../update-modifier";
import { MenuEntities } from "../../../entities";
import { IModifierRepository } from "../../repository";

describe("Update modifier usecase", () => {
  const expectResponseToHaveKeys = (modifier: Modifier) => {
    for (const property of Object.getOwnPropertyNames(modifier)) {
      expect(modifier).toHaveProperty(property);
    }
  };

  let orm: MikroORM;
  let modifierRepository: IModifierRepository;
  let modifierToUpdate: Modifier;
  beforeAll(async () => {
    const conn = await getTestConnection(process.env.TEST_DB, MenuEntities.asArray());
    orm = conn;
    await seedDatabase(conn, path.join(__dirname, "..", "..", "..", ".."));
    modifierRepository = conn.em.getRepository(Modifier);
    modifierToUpdate = await modifierRepository.findOne({});
  });

  const data: IUpdateModifierInput = {
    name: faker.commerce.productName(),
    multiselect: faker.datatype.boolean(),
    options: [
      {
        name: faker.commerce.productName(),
        price: +faker.commerce.price(1, 25)
      },
      {
        name: faker.commerce.productName(),
        price: +faker.commerce.price(1, 25)
      }
    ]
  };

  it("should update a modifier", async () => {
    const modifier = await updateModifier({ modifierRepository })(modifierToUpdate.id, data);

    expectResponseToHaveKeys(modifier);
    expect(modifier.id).toBeGreaterThan(0);
    expect(modifier.name).toEqual(data.name);
    expect(modifier.multiselect).toEqual(data.multiselect);
    expect(modifier.options.getItems().map((item) => ({ name: item.name, price: item.price }))).toEqual(data.options);
  });

  it("should fail to update a modifier", async () => {
    await expect(async () => updateModifier({ modifierRepository })(-1, data)).rejects.toThrow(NotFoundError);
  });

  afterAll(async () => {
    await clearDatabase(orm);

    await orm.close(true);
  });
});
