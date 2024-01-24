
import {
  clearDatabase, getTestConnection, parsePaginationParam, seedDatabase
} from "@butlerhospitality/service-sdk";
import { MikroORM } from "@mikro-orm/core";
import * as path from "path";
import { IAMEntities } from "../../../entities";
import User from "../../entities/user";
import { IUserRepository } from "../../repository";
import listUsers from "../list-users";

describe("Get list of users usecase", () => {
  const validateKeysToHave = (userObj: User) => {
    expect(userObj).toBeDefined();
    expect(userObj).toHaveProperty("id");
    expect(userObj).toHaveProperty("name");
    expect(userObj).toHaveProperty("email");
    expect(userObj).toHaveProperty("phone_number");
    expect(userObj).toHaveProperty("roles");
    expect(userObj).toHaveProperty("created_at");
    expect(userObj).toHaveProperty("updated_at");
    expect(userObj).toHaveProperty("deleted_at");
  };

  let orm: MikroORM;
  let userRepository: IUserRepository;
  let userToSearch: User;
  beforeAll(async () => {
    const conn = await getTestConnection(process.env.TEST_DB, IAMEntities.asArray());
    orm = conn;
    await seedDatabase(conn, path.join(__dirname, "..", "..", "..", ".."));
    userRepository = conn.em.getRepository(User);
    userToSearch = await userRepository.findOne({});
  });

  it("should get user list without params", async () => {
    const params = {};
    const users = await listUsers({ userRepository })({ ...parsePaginationParam(params), ...params });

    for (const user of users[0]) {
      validateKeysToHave(user);
      expect(user.deleted_at).toBe(null);
    }
  });

  it("should get user list with params", async () => {
    const params = { page: 1, limit: 5 };
    const users = await listUsers({ userRepository })({ ...parsePaginationParam(params), ...params });

    expect(users.length).toBeLessThanOrEqual(params.limit);
    for (const user of users[0]) {
      validateKeysToHave(user);
      expect(user.deleted_at).toBe(null);
    }
  });

  it("should get user list by email as search param", async () => {
    const params = { search: userToSearch.email };
    const users = await listUsers({ userRepository })({ ...parsePaginationParam(params), ...params });
    for (const user of users[0]) {
      validateKeysToHave(user);
      expect(user.deleted_at).toBe(null);
      expect(user.email).toBe(userToSearch.email);
      expect(user.name).toBe(userToSearch.name);
      expect(user.created_at).toBe(userToSearch.created_at);
    }
  });

  it("should get user list by name as search param", async () => {
    const params = { search: userToSearch.name };
    const users = await listUsers({ userRepository })({ ...parsePaginationParam(params), ...params });
    for (const user of users[0]) {
      validateKeysToHave(user);
      expect(user.deleted_at).toBe(null);
      expect(user.email).toBe(userToSearch.email);
      expect(user.name).toBe(userToSearch.name);
      expect(user.created_at).toBe(userToSearch.created_at);
    }
  });

  afterAll(async () => {
    await clearDatabase(orm);
    await orm.close(true);
  });
});
