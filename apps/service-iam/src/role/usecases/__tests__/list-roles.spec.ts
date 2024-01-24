
import {
  clearDatabase, getTestConnection, parsePaginationParam, seedDatabase
} from "@butlerhospitality/service-sdk";
import { MikroORM } from "@mikro-orm/core";
import * as path from "path";
import { IAMEntities } from "../../../entities";
import listRoles from "../list-roles";
import Role from "../../entities/role";
import { IRoleRepository } from "../../repository";

describe("Get list of roles usecase", () => {
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

  it("should get role list without params", async () => {
    const params = {};
    const roles = await listRoles({ roleRepository })({ ...parsePaginationParam(params), ...params });

    for (const role of roles[0]) {
      validateKeysToHave(role);
      expect(role.deleted_at).toBe(null);
    }
  });

  it("should get role list with params", async () => {
    const params = { page: 1, limit: 5 };
    const roles = await listRoles({ roleRepository })({ ...parsePaginationParam(params), ...params });

    expect(roles.length).toBeLessThanOrEqual(params.limit);
    for (const role of roles[0]) {
      validateKeysToHave(role);
      expect(role.deleted_at).toBe(null);
    }
  });

  it("should get role list with search params", async () => {
    const params = { search: existingRole.name };
    const roles = await listRoles({ roleRepository })({ ...parsePaginationParam(params), ...params });

    for (const role of roles[0]) {
      validateKeysToHave(role);
      expect(role.deleted_at).toBe(null);
      expect(role.name).toBe(existingRole.name);
      expect(role.description).toBe(existingRole.description);
      expect(role.created_at).toBe(existingRole.created_at);
    }
  });

  afterAll(async () => {
    await clearDatabase(orm);
    await orm.close(true);
  });
});
