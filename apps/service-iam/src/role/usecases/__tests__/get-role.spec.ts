import { clearDatabase, getTestConnection, seedDatabase } from "@butlerhospitality/service-sdk";
import { MikroORM } from "@mikro-orm/core";
import * as path from "path";
import { IAMEntities } from "../../../entities";
import getRole from "../get-role";
import Role from "../../entities/role";
import { IRoleRepository } from "../../repository";

describe("Get role usecase", () => {
  const validateKeysToHave = (roleObj: Role) => {
    expect(roleObj).toBeDefined();
    expect(roleObj).toHaveProperty("id");
    expect(roleObj).toHaveProperty("name");
    expect(roleObj).toHaveProperty("description");
    expect(roleObj).toHaveProperty("created_at");
    expect(roleObj).toHaveProperty("permissiongroups");
  };

  let orm: MikroORM;
  let roleRepository: IRoleRepository;
  let existingRole: Role;
  beforeAll(async () => {
    const conn = await getTestConnection(process.env.TEST_DB, IAMEntities.asArray());
    orm = conn;
    await seedDatabase(conn, path.join(__dirname, "..", "..", "..", ".."));
    roleRepository = conn.em.getRepository(Role);
    existingRole = await roleRepository.findOne({});
  });

  it("should get single role by id", async () => {
    const role = await getRole({ roleRepository })(existingRole.id);

    validateKeysToHave(role);
    expect(role.name).toBe(existingRole.name);
    expect(role.description).toBe(existingRole.description);
    expect(role.permissiongroups.length).toBe(existingRole.permissiongroups.length);
  });

  afterAll(async () => {
    await clearDatabase(orm);
    await orm.close(true);
  });
});
