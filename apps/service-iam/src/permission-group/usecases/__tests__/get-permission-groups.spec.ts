
import {
  clearDatabase, getTestConnection, parsePaginationParam, seedDatabase
} from "@butlerhospitality/service-sdk";
import { MikroORM } from "@mikro-orm/core";
import * as path from "path";
import { IAMEntities } from "../../../entities";
import listPermissionGroups from "../list-permission-groups";
import PermissionGroup from "../../entities/permission-group";
import { IPermissionGroupRepository } from "../../repository";

describe("Get permission group list usecase", () => {
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

  it("should get permission group list without params", async () => {
    const params = {};
    const permissionGroups = await listPermissionGroups({
      permissionGroupRepository
    })({ ...parsePaginationParam(params), ...params });

    for (const permissionGroup of permissionGroups[0]) {
      validateKeysToHave(permissionGroup);
      expect(permissionGroup.deleted_at).toBe(null);
    }
  });

  it("should get permission group list with params", async () => {
    const params = { page: 1, limit: 5 };
    const permissionGroups = await listPermissionGroups({
      permissionGroupRepository
    })({ ...parsePaginationParam(params), ...params });

    expect(permissionGroups.length).toBeLessThanOrEqual(params.limit);
    for (const permissionGroup of permissionGroups[0]) {
      validateKeysToHave(permissionGroup);
      expect(permissionGroup.deleted_at).toBe(null);
    }
  });

  it("should get permission group list with search params", async () => {
    const params = { search: existingPermissionGroup.name };
    const permissionGroups = await listPermissionGroups({
      permissionGroupRepository
    })({ ...parsePaginationParam(params), ...params });

    for (const permissionGroup of permissionGroups[0]) {
      validateKeysToHave(permissionGroup);
      expect(permissionGroup.deleted_at).toBe(null);
      expect(permissionGroup.name).toBe(existingPermissionGroup.name);
      expect(permissionGroup.permissions.length).toBe(existingPermissionGroup.permissions.length);
      expect(permissionGroup.created_at).toBe(existingPermissionGroup.created_at);
    }
  });

  afterAll(async () => {
    await clearDatabase(orm);
    await orm.close(true);
  });
});
