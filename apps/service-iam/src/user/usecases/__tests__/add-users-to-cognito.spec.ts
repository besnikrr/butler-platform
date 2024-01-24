import { clearDatabase, getTestConnection, NotFoundError, seedDatabase } from "@butlerhospitality/service-sdk";
import { Collection } from "@mikro-orm/core";
import Hub from "@services/service-iam/src/hub/entities/hub";
import path = require("path");
import { IAMEntities } from "../../../entities";
import User from "../../entities/user";
import Role from "../../../role/entities/role";
import addUsersToCognito from "../add-users-to-cognito";

let userConnection;
let IDependencyInjection;

let findUsersSpy;

jest.mock("@butlerhospitality/service-sdk", () => {
  const originalModule = jest.requireActual("@butlerhospitality/service-sdk");
  originalModule.IdentityProviderFactory = () => {
    return {};
  };
  originalModule.log = () => {
    return {
      log: (e) => {
        console.log(e);
      }
    };
  };
  return originalModule;
});

jest.mock("../add-users-to-cognito", () => {
  const originalModule = jest.requireActual("../add-users-to-cognito");
  originalModule.getTenant = (() => Promise.resolve({
    id: 1,
    name: "mocked tenant",
    domain: "butler",
    cognito: { poolId: "butler", clientId: "123" },
    jwks: "asd",
    awsDefaultRegion: "asd"
  }));
  originalModule.saveUsersInCognito = (() => Promise.resolve());
  originalModule.checkIfUsersAreInCognito = (() => Promise.resolve(["test@butlerhospitality.com"]));

  return originalModule;
});

beforeAll(async () => {
  userConnection = await getTestConnection(process.env.TEST_DB, IAMEntities.asArray());
  await seedDatabase(userConnection, path.join(__dirname, "..", "..", "..", ".."));

  IDependencyInjection = {
    userRepository: userConnection.em.getRepository(User),
    validate: true
  };
});

afterAll(async () => {
  await clearDatabase(userConnection);
  await userConnection?.close(true);
});

beforeEach(() => {
  jest.restoreAllMocks();
  jest.useFakeTimers();
  jest.setSystemTime(new Date());

  findUsersSpy = jest.spyOn(IDependencyInjection.userRepository, "getEntitiesOrFailIfNotFound");
});

describe("Add synced users to cognito", () => {
  const data = { ids: [1] };
  const mockedUser: User = {
    id: 1,
    created_at: new Date(Date.now()),
    updated_at: new Date(Date.now()),
    email: "test@butlerhospitality.com",
    hubs: new Collection<Hub>(this),
    name: "User",
    roles: new Collection<Role>(this)
  };
  it("should not allow non existing users to be added", async () => {
    findUsersSpy.mockImplementation(() => Promise.reject(new NotFoundError("Entity", `Some of the users do not exist in the database`)));
    expect(async () => {
      await addUsersToCognito(IDependencyInjection)(data);
    }).rejects.toThrow(NotFoundError);
    expect(findUsersSpy).toBeCalled();
  });
  it("should not add users that are already in cognito", async () => {
    findUsersSpy.mockImplementation(() => Promise.resolve([{ mockedUser }]));

    const result = await addUsersToCognito(IDependencyInjection)(data);
    expect(result.existingCognitoUsers.length).toBeGreaterThan(0);
    expect(findUsersSpy).toBeCalled();
  });
});
