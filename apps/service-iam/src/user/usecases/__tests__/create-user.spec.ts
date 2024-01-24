
import { clearDatabase, getTestConnection, seedDatabase } from "@butlerhospitality/service-sdk";
import { mockedTenant } from "@butlerhospitality/shared";
import { faker } from "@faker-js/faker";
import { MikroORM } from "@mikro-orm/core";
import * as path from "path";
import User from "../../entities/user";
import createUser, { ICreateUserInput } from "../create-user";
import { IAMEntities } from "../../../entities";
import { EntityManager } from "@mikro-orm/postgresql";

describe("Create user usecase", () => {
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
  beforeAll(async () => {
    const conn = await getTestConnection(process.env.TEST_DB, IAMEntities.asArray());
    orm = conn;
    await seedDatabase(conn, path.join(__dirname, "..", "..", "..", ".."));
  });

  it("should create user with roles", async () => {
    const data: ICreateUserInput = {
      name: `${faker.name.firstName()} ${faker.name.lastName()}`,
      email: faker.internet.email(),
      phone_number: faker.phone.phoneNumber(),
      roles: [1]
    };

    const user = await createUser({
      em: orm.em as EntityManager,
      validate: true,
      tenant: mockedTenant.name
    })(data, mockedTenant);

    validateKeysToHave(user);
    expect(user.name).toBe(data.name);
    expect(user.email).toBe(data.email);
    expect(user.phone_number).toBe(data.phone_number);
    expect(user.roles.length).toBe(data.roles.length);

    for (const role of user.roles) {
      expect(data.roles).toContain(role.id);
    }
  });

  it("should create user without roles", async () => {
    const data: ICreateUserInput = {
      name: `${faker.name.firstName()} ${faker.name.lastName()}`,
      email: faker.internet.email(),
      phone_number: faker.phone.phoneNumber(),
      roles: []
    };

    const user = await createUser({
      em: orm.em as EntityManager,
      validate: true,
      tenant: mockedTenant.name
    })(data, mockedTenant);

    validateKeysToHave(user);
    expect(user.name).toBe(data.name);
    expect(user.email).toBe(data.email);
    expect(user.phone_number).toBe(data.phone_number);
    expect(user.roles.length).toBe(data.roles.length);
  });

  afterAll(async () => {
    await clearDatabase(orm);
    await orm.close(true);
  });
});
