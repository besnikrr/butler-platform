import {
  clearDatabase, getTestConnection, NotFoundError, seedDatabase
} from "@butlerhospitality/service-sdk";
import { MikroORM } from "@mikro-orm/core";
import * as path from "path";
import { mockedTenant } from "@butlerhospitality/shared";
import { IAMEntities } from "../../../entities";
import deleteUser from "../delete-user";
import getUser from "../get-user";
import User from "../../entities/user";
import { IUserRepository } from "../../repository";
import { EntityManager } from "@mikro-orm/postgresql";

describe("Delete user usecase", () => {
  let orm: MikroORM;
  let userRepository: IUserRepository;
  let em: EntityManager;
  beforeAll(async () => {
    const conn = await getTestConnection(process.env.TEST_DB, IAMEntities.asArray());
    orm = conn;
    await seedDatabase(conn, path.join(__dirname, "..", "..", "..", ".."));
    em = conn.em as EntityManager;
    userRepository = em.getRepository(User);
  });

  it("should delete user by id", async () => {
    const userToBeDeleted = await userRepository.findOne({});
    await deleteUser({ em })(userToBeDeleted.id, mockedTenant);

    expect(async () => {
      await getUser({ userRepository })(userToBeDeleted.id);
    }).rejects.toThrowError(NotFoundError);
  });

  afterAll(async () => {
    await clearDatabase(orm);
    await orm.close(true);
  });
});
