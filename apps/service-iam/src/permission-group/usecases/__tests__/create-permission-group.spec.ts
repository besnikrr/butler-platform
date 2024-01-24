
import { clearDatabase, getTestConnection, seedDatabase } from "@butlerhospitality/service-sdk";
import { faker } from "@faker-js/faker";
import { MikroORM } from "@mikro-orm/core";
import * as path from "path";
import { IAMEntities } from "../../../entities";
import createPermissionGroup, { IPermissionGroupCreateInput } from "../create-permission-group";
import PermissionGroup from "../../entities/permission-group";
import { IPermissionGroupRepository } from "../../repository";

describe("Create permission group usecase", () => {
  const validateKeysToHave = (permissionGroupObj: PermissionGroup) => {
    expect(permissionGroupObj).toBeDefined();
    expect(permissionGroupObj).toHaveProperty("id");
    expect(permissionGroupObj).toHaveProperty("name");
    expect(permissionGroupObj).toHaveProperty("created_at");
    expect(permissionGroupObj).toHaveProperty("permissions");
  };

  let orm: MikroORM;
  let permissionGroupRepository: IPermissionGroupRepository;
  beforeAll(async () => {
    const conn = await getTestConnection(process.env.TEST_DB, IAMEntities.asArray());
    orm = conn;
    await seedDatabase(conn, path.join(__dirname, "..", "..", "..", ".."));
    permissionGroupRepository = conn.em.getRepository(PermissionGroup);
  });

  it("should create permission group with permissions", async () => {
    const data: IPermissionGroupCreateInput = {
      name: faker.random.alphaNumeric(20),
      permissions: [1]
    };

    const permissionGroup = await createPermissionGroup({ permissionGroupRepository })(data);

    validateKeysToHave(permissionGroup);
    expect(permissionGroup.name).toBe(data.name);
    expect(permissionGroup.permissions.length).toBe(data.permissions.length);

    for (const permission of permissionGroup.permissions) {
      expect(data.permissions).toContain(permission.id);
    }
  });

  it("should create permission group without permissions", async () => {
    const data: IPermissionGroupCreateInput = {
      name: faker.random.alphaNumeric(20),
      permissions: []
    };

    const permissionGroup = await createPermissionGroup({ permissionGroupRepository })(data);

    validateKeysToHave(permissionGroup);
    expect(permissionGroup.name).toBe(data.name);
    expect(permissionGroup.permissions.length).toBe(data.permissions.length);
  });

  afterAll(async () => {
    await clearDatabase(orm);
    await orm.close(true);
  });
});
