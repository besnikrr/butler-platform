import { clearDatabase, getTestConnection, seedDatabase } from "@butlerhospitality/service-sdk";
import { MikroORM } from "@mikro-orm/core";
import * as path from "path";
import { IAMEntities } from "../../../entities";
import User from "../../entities/user";
import getUser from "../get-user";
import { IUserRepository } from "../../repository";

describe("Get user usecase", () => {
  const validateKeysToHave = (userObj: User) => {
    expect(userObj).toBeDefined();
    expect(userObj).toHaveProperty("id");
    expect(userObj).toHaveProperty("name");
    expect(userObj).toHaveProperty("email");
    expect(userObj).toHaveProperty("phone_number");
    expect(userObj).toHaveProperty("created_at");
    expect(userObj).toHaveProperty("roles");
  };

  let orm: MikroORM;
  let userRepository: IUserRepository;
  let existingUser: User;
  beforeAll(async () => {
    const conn = await getTestConnection(process.env.TEST_DB, IAMEntities.asArray());
    orm = conn;
    await seedDatabase(conn, path.join(__dirname, "..", "..", "..", ".."));
    userRepository = conn.em.getRepository(User);
    existingUser = await userRepository.findOne({});
  });

  it("should get single user by id", async () => {
    const user = await getUser({ userRepository })(existingUser.id);

    validateKeysToHave(user);
    expect(user.name).toBe(existingUser.name);
    expect(user.email).toBe(existingUser.email);
    expect(user.phone_number).toBe(existingUser.phone_number);
    expect(user.roles.length).toBe(existingUser.roles.length);
  });

  afterAll(async () => {
    await clearDatabase(orm);
    await orm.close(true);
  });
});
