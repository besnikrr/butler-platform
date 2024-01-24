import {
  clearDatabase, getTestConnection, NotFoundError, seedDatabase
} from "@butlerhospitality/service-sdk";
import { MikroORM } from "@mikro-orm/core";
import * as path from "path";
import Modifier from "../../entities/modifier";
import deleteModifier from "../delete-modifier";
import { MenuEntities } from "../../../entities";
import { IModifierRepository } from "../../repository";

describe("Delete modifier usecase", () => {
  let orm: MikroORM;
  let modifierRepository: IModifierRepository;
  let modifierToDelete: Modifier;
  beforeAll(async () => {
    const conn = await getTestConnection(process.env.TEST_DB, MenuEntities.asArray());
    orm = conn;
    await seedDatabase(conn, path.join(__dirname, "..", "..", "..", ".."));
    modifierRepository = conn.em.getRepository(Modifier);
    modifierToDelete = await modifierRepository.findOne({});
  });

  it("should delete a modifier", async () => {
    const deleted = await deleteModifier({ modifierRepository })(modifierToDelete.id);

    const deletedModifier = await modifierRepository.findOne(
      { id: modifierToDelete.id },
      { filters: { excludeDeleted: { isDeleted: true } }, populate: ["options"] }
    );

    expect(deleted).toEqual(true);
    expect(deletedModifier).toHaveProperty("deleted_at");
    expect(deletedModifier.deleted_at).toBeTruthy();
    expect(deletedModifier.options.getItems()).toEqual([]);
  });

  it("should fail to delete a modifier", async () => {
    await expect(async () => deleteModifier({ modifierRepository })(-1)).rejects.toThrow(NotFoundError);
  });

  afterAll(async () => {
    await clearDatabase(orm);

    await orm.close(true);
  });
});
