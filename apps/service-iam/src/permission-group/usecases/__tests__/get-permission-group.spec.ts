import { clearDatabase, getTestConnection, seedDatabase } from "@butlerhospitality/service-sdk";
import { MikroORM } from "@mikro-orm/core";
import * as path from "path";
import { IAMEntities } from "../../../entities";
import getPermissionGroup from "../get-permission-group";
import PermissionGroup from "../../entities/permission-group";
import { IPermissionGroupRepository } from "../../repository";

describe("Get permission group usecase", () => {
  const validateKeysToHave = (permissionGroupObj: PermissionGroup) => {
    expect(permissionGroupObj).toBeDefined();
    expect(permissionGroupObj).toHaveProperty("id");
    expect(permissionGroupObj).toHaveProperty("name");
    expect(permissionGroupObj).toHaveProperty("created_at");
    expect(permissionGroupObj).toHaveProperty("permissions");
  };

  let orm: MikroORM;
  let permissionGroupRepository: IPermissionGroupRepository;
  let existingPermissionGroup: PermissionGroup;
  beforeAll(async () => {
    const conn = await getTestConnection(process.env.TEST_DB, IAMEntities.asArray());
    orm = conn;
    await seedDatabase(conn, path.join(__dirname, "..", "..", "..", ".."));
    permissionGroupRepository = conn.em.getRepository(PermissionGroup);
    existingPermissionGroup = await permissionGroupRepository.findOne({});
  });

  it("should get single permission group by id", async () => {
    const permissionGroup = await getPermissionGroup({ permissionGroupRepository })(existingPermissionGroup.id);

    validateKeysToHave(permissionGroup);
    expect(permissionGroup.name).toBe(existingPermissionGroup.name);
    expect(permissionGroup.permissions.length).toBe(existingPermissionGroup.permissions.length);
  });

  afterAll(async () => {
    await clearDatabase(orm);
    await orm.close(true);
  });
});
