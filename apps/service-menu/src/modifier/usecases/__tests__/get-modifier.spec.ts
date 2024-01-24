
import {
  clearDatabase, getTestConnection, NotFoundError, seedDatabase
} from "@butlerhospitality/service-sdk";
import { MikroORM } from "@mikro-orm/core";
import * as path from "path";
import Modifier from "../../entities/modifier";
import getModifier from "../get-modifier";
import { MenuEntities } from "../../../entities";
import { IModifierRepository } from "../../repository";

describe("Get modifier usecase", () => {
  const expectResponseToHaveKeys = (modifier: Modifier) => {
    for (const property of Object.getOwnPropertyNames(modifier)) {
      expect(modifier).toHaveProperty(property);
    }
  };

  let orm: MikroORM;
  let modifierRepository: IModifierRepository;
  let existingModifier: Modifier;
  beforeAll(async () => {
    const conn = await getTestConnection(process.env.TEST_DB, MenuEntities.asArray());
    orm = conn;
    await seedDatabase(conn, path.join(__dirname, "..", "..", "..", ".."));
    modifierRepository = conn.em.getRepository(Modifier);
    existingModifier = await modifierRepository.findOne({});
  });

  it("should get a modifier", async () => {
    const modifier = await getModifier({ modifierRepository })(existingModifier.id);

    expectResponseToHaveKeys(modifier);
    expect(modifier).toEqual(existingModifier);
  });

  it("should fail to get a modifier", async () => {
    await expect(async () => getModifier({ modifierRepository })(-1)).rejects.toThrow(NotFoundError);
  });

  afterAll(async () => {
    await clearDatabase(orm);

    await orm.close(true);
  });
});
