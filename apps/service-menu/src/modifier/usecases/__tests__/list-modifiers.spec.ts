
import { getTestConnection, clearDatabase, seedDatabase } from "@butlerhospitality/service-sdk";
import { MikroORM } from "@mikro-orm/core";
import * as path from "path";
import Modifier from "../../entities/modifier";
import listModifiers from "../list-modifiers";
import { MenuEntities } from "../../../entities";
import { IModifierRepository } from "../../repository";

describe("List modifiers usecase", () => {
  const expectResponseToHaveKeys = (modifier: Modifier) => {
    for (const property of Object.getOwnPropertyNames(modifier)) {
      expect(modifier).toHaveProperty(property);
    }
  };

  let orm: MikroORM;
  let modifierRepository: IModifierRepository;
  let modifierToSearch: Modifier;
  beforeAll(async () => {
    const conn = await getTestConnection(process.env.TEST_DB, MenuEntities.asArray());
    orm = conn;
    await seedDatabase(conn, path.join(__dirname, "..", "..", "..", ".."));
    modifierRepository = conn.em.getRepository(Modifier);
    modifierToSearch = await modifierRepository.findOne({});
  });

  it("should list all modifiers", async () => {
    const [modifiers, count] = await listModifiers({ modifierRepository })({ page: 1, limit: 10 });
    modifiers.map((modifier) => expectResponseToHaveKeys(modifier));
    expect(count).toBeGreaterThan(0);
  });

  it("should filter modifiers by name", async () => {
    const [modifiers, count] = await listModifiers({
      modifierRepository
    })({
      name: modifierToSearch.name,
      page: 1,
      limit: 10
    });

    modifiers.forEach((modifier) => {
      expectResponseToHaveKeys(modifier);
      expect(modifier.name).toContain(modifierToSearch.name);
    });
    expect(count).toBeGreaterThanOrEqual(0);
  });

  afterAll(async () => {
    await clearDatabase(orm);

    await orm.close(true);
  });
});
