import { clearDatabase, getTestConnection, seedDatabase } from "@butlerhospitality/service-sdk";
import { faker } from "@faker-js/faker";
import { MikroORM } from "@mikro-orm/core";
import * as path from "path";
import { IAMEntities } from "../../../entities";
import updateUser, { IUpdateUserInput } from "../update-user";
import User from "../../entities/user";
import { IUserRepository } from "../../repository";

describe("Update user usecase", () => {
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
  let user: User;
  beforeAll(async () => {
    const conn = await getTestConnection(process.env.TEST_DB, IAMEntities.asArray());
    orm = conn;
    await seedDatabase(conn, path.join(__dirname, "..", "..", "..", ".."));
    userRepository = conn.em.getRepository(User);
    user = await userRepository.findOne({});
  });

  it("should update single user", async () => {
    const updateObj: IUpdateUserInput = {
      name: `${faker.name.firstName()} ${faker.name.lastName()}`,
      phone_number: faker.phone.phoneNumber(),
      roles: []
    };

    const updatedUser = await updateUser({ userRepository })(user.id, updateObj);

    validateKeysToHave(updatedUser);
    expect(updatedUser.name).toBe(updateObj.name);
    expect(updatedUser.phone_number).toBe(updateObj.phone_number);
    expect(updatedUser.roles.length).toBe(updateObj.roles.length);
  });

  afterAll(async () => {
    await clearDatabase(orm);
    await orm.close(true);
  });
});
