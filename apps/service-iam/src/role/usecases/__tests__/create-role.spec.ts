
import { clearDatabase, getTestConnection, seedDatabase } from "@butlerhospitality/service-sdk";
import { faker } from "@faker-js/faker";
import { MikroORM } from "@mikro-orm/core";
import * as path from "path";
import { IAMEntities } from "../../../entities";
import createRole, { IRoleCreateInput } from "../create-role";
import Role from "../../entities/role";
import { IRoleRepository } from "../../repository";

describe("Create role usecase", () => {
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
  beforeAll(async () => {
    const conn = await getTestConnection(process.env.TEST_DB, IAMEntities.asArray());
    orm = conn;
    await seedDatabase(conn, path.join(__dirname, "..", "..", "..", ".."));
    roleRepository = conn.em.getRepository(Role);
  });

  it("should create role with permissiongroups", async () => {
    const data: IRoleCreateInput = {
      name: faker.random.alphaNumeric(20),
      description: faker.random.alphaNumeric(20),
      permissiongroups: [1]
    };

    const role = await createRole({ roleRepository })(data);

    validateKeysToHave(role);
    expect(role.name).toBe(data.name);
    expect(role.description).toBe(data.description);
    expect(role.permissiongroups.length).toBe(data.permissiongroups.length);

    for (const permissiongroup of role.permissiongroups) {
      expect(data.permissiongroups).toContain(permissiongroup.id);
    }
  });

  it("should create role without permissiongroups", async () => {
    const data: IRoleCreateInput = {
      name: faker.random.alphaNumeric(20),
      description: faker.random.alphaNumeric(20),
      permissiongroups: []
    };

    const role = await createRole({ roleRepository })(data);

    validateKeysToHave(role);
    expect(role.name).toBe(data.name);
    expect(role.description).toBe(data.description);
    expect(role.permissiongroups.length).toBe(data.permissiongroups.length);
  });

  afterAll(async () => {
    await clearDatabase(orm);
    await orm.close(true);
  });
});
