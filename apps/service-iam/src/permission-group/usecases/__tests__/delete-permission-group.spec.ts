import {
  clearDatabase, getTestConnection, NotFoundError, seedDatabase
} from "@butlerhospitality/service-sdk";
import { MikroORM } from "@mikro-orm/core";
import * as path from "path";
import { IAMEntities } from "../../../entities";
import deletePermissionGroup from "../delete-permission-group";
import getPermissionGroup from "../get-permission-group";
import PermissionGroup from "../../entities/permission-group";
import { IPermissionGroupRepository } from "../../repository";

describe("Delete permission group usecase", () => {
  let orm: MikroORM;
  let permissionGroupRepository: IPermissionGroupRepository;
  let permissionGroup: PermissionGroup;
  beforeAll(async () => {
    const conn = await getTestConnection(process.env.TEST_DB, IAMEntities.asArray());
    orm = conn;
    await seedDatabase(conn, path.join(__dirname, "..", "..", "..", ".."));
    permissionGroupRepository = conn.em.getRepository(PermissionGroup);
    permissionGroup = await permissionGroupRepository.findOne({});
  });

  it("should delete permission group by id", async () => {
    await deletePermissionGroup({ permissionGroupRepository })(permissionGroup.id);

    expect(async () => {
      await getPermissionGroup({ permissionGroupRepository })(permissionGroup.id);
    }).rejects.toThrowError(NotFoundError);
  });

  afterAll(async () => {
    await clearDatabase(orm);
    await orm.close(true);
  });
});
