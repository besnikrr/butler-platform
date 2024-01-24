import {
  clearDatabase, getTestConnection, NotFoundError, seedDatabase
} from "@butlerhospitality/service-sdk";
import { MikroORM } from "@mikro-orm/core";
import * as path from "path";
import { IAMEntities } from "../../../entities";
import deleteRole from "../delete-role";
import getRole from "../get-role";
import Role from "../../entities/role";
import { IRoleRepository } from "../../repository";

describe("Delete role usecase", () => {
  let orm: MikroORM;
  let roleRepository: IRoleRepository;
  beforeAll(async () => {
    const conn = await getTestConnection(process.env.TEST_DB, IAMEntities.asArray());
    orm = conn;
    await seedDatabase(conn, path.join(__dirname, "..", "..", "..", ".."));
    roleRepository = conn.em.getRepository(Role);
  });

  it("should delete role by id", async () => {
    const roleToBeDeleted = await roleRepository.findOne({});
    await deleteRole({ roleRepository })(roleToBeDeleted.id);

    expect(async () => {
      await getRole({ roleRepository })(roleToBeDeleted.id);
    }).rejects.toThrowError(NotFoundError);
  });

  afterAll(async () => {
    await clearDatabase(orm);
    await orm.close(true);
  });
});
