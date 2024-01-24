import { clearDatabase, getTestConnection, seedDatabase } from "@butlerhospitality/service-sdk";
import { faker } from "@faker-js/faker";
import { MikroORM } from "@mikro-orm/core";
import * as path from "path";
import { IAMEntities } from "../../../entities";
import updatePermissionGroup, { IUpdatePermissionGroupInput } from "../update-permission-group";
import PermissionGroup from "../../entities/permission-group";
import { IPermissionGroupRepository } from "../../repository";

describe("Update permission group usecase", () => {
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

  it("should update single permission group", async () => {
    const updateObj: IUpdatePermissionGroupInput = {
      name: faker.random.alphaNumeric(20),
      permissions: []
    };

    const updatedPermissionGroup = await updatePermissionGroup({
      permissionGroupRepository
    })(existingPermissionGroup.id, updateObj);

    validateKeysToHave(updatedPermissionGroup);
    expect(updatedPermissionGroup.name).toBe(updateObj.name);
    expect(updatedPermissionGroup.permissions.length).toBe(updateObj.permissions.length);
    expect(updatedPermissionGroup.created_at).toBe(existingPermissionGroup.created_at);
  });

  afterAll(async () => {
    await clearDatabase(orm);
    await orm.close(true);
  });
});
