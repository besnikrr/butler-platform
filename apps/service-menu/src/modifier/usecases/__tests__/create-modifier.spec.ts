
import { clearDatabase, getTestConnection, seedDatabase } from "@butlerhospitality/service-sdk";
import { faker } from "@faker-js/faker";
import * as path from "path";
import { MikroORM } from "@mikro-orm/core";
import Modifier from "../../entities/modifier";
import { MenuEntities } from "../../../entities";
import createModifier, { ICreateModifierInput } from "../create-modifier";
import { IModifierRepository } from "../../repository";

describe("Create modifier usecase", () => {
  const expectResponseToHaveKeys = (modifier: Modifier) => {
    for (const property of Object.getOwnPropertyNames(modifier)) {
      expect(modifier).toHaveProperty(property);
    }
  };

  let orm: MikroORM;
  let modifierRepository: IModifierRepository;
  beforeAll(async () => {
    const conn = await getTestConnection(process.env.TEST_DB, MenuEntities.asArray());
    orm = conn;
    await seedDatabase(conn, path.join(__dirname, "..", "..", "..", ".."));
    modifierRepository = conn.em.getRepository(Modifier);
  });

  it("should create a modifier", async () => {
    const data: ICreateModifierInput = {
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

    const modifier = await createModifier({ modifierRepository })(data);
    expectResponseToHaveKeys(modifier);
    expect(modifier.id).toBeGreaterThan(0);
    expect(modifier.name).toEqual(data.name);
    expect(modifier.multiselect).toEqual(data.multiselect);
    expect(modifier.options.getItems().map((item) => ({ name: item.name, price: item.price }))).toEqual(data.options);
  });

  afterAll(async () => {
    await clearDatabase(orm);

    await orm.close(true);
  });
});
