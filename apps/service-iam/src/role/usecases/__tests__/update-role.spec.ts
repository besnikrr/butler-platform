import { clearDatabase, getTestConnection, seedDatabase } from "@butlerhospitality/service-sdk";
import { faker } from "@faker-js/faker";
import { MikroORM } from "@mikro-orm/core";
import * as path from "path";
import { IAMEntities } from "../../../entities";
import updateRole, { IUpdateRoleInput } from "../update-role";
import Role from "../../entities/role";
import { IRoleRepository } from "../../repository";

describe("Update role usecase", () => {
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

  it("should update single role", async () => {
    const updateObj: IUpdateRoleInput = {
      name: faker.random.alphaNumeric(20),
      description: faker.random.alphaNumeric(20),
      permissiongroups: []
    };

    const updatedRole = await updateRole({ roleRepository })(existingRole.id, updateObj);

    validateKeysToHave(updatedRole);
    expect(updatedRole.name).toBe(updateObj.name);
    expect(updatedRole.description).toBe(updateObj.description);
    expect(updatedRole.permissiongroups.length).toBe(updateObj.permissiongroups.length);
  });

  afterAll(async () => {
    await clearDatabase(orm);
    await orm.close(true);
  });
});
