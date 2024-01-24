import path = require("path");
import createOrder from "../create-order";
import { MikroORM } from "@mikro-orm/core";
import entities from "../../../utils/entities";
import { generateMockOrderInput } from "../../../utils/mock-tests";
import { MenuEntities } from "@services/service-menu/src/entities";
import { VoucherEntities } from "@services/service-voucher/src/entities";
import { NetworkEntities } from "@services/service-network/src/entities";
import {
  connection,
  seedDatabase,
  NotFoundError,
  clearDatabase,
  getTestConnection,
  DIConnectionObject
} from
  "@butlerhospitality/service-sdk";

describe("Create Order Suite", () => {
  let menuConnection: MikroORM;
  let orderConnection: MikroORM;
  let networkConnection: MikroORM;
  let voucherConnection: MikroORM;
  let IDependencyInjection;

  beforeAll(async () => {
    orderConnection = await getTestConnection(process.env.TEST_DB, entities);
    await seedDatabase(orderConnection, path.join(__dirname, "..", "..", "..", ".."));

    const networkRootDir = path.join(__dirname, "..", "..", "..", "..", "..", "service-network");
    networkConnection = await getTestConnection("service_network_test", NetworkEntities.asArray());
    await seedDatabase(networkConnection, networkRootDir);

    const menuRootDir = path.join(__dirname, "..", "..", "..", "..", "..", "service-menu");
    menuConnection = await getTestConnection("service_menu_test", MenuEntities.asArray());
    await seedDatabase(menuConnection, menuRootDir);

    IDependencyInjection = {
      connection: orderConnection,
      validate: true,
      tenant: "butler"
    };
  });

  beforeEach(async () => {
    jest.restoreAllMocks();
    const voucherRootDir = path.join(__dirname, "..", "..", "..", "..", "..", "service-voucher");
    voucherConnection = await getTestConnection("service_voucher_test", VoucherEntities.asArray());
    await seedDatabase(voucherConnection, voucherRootDir);

    jest.spyOn(connection, "getConnection").mockImplementationOnce(() =>
      Promise.resolve({ conn: networkConnection } as DIConnectionObject<any>));

    jest.spyOn(connection, "getConnection").mockImplementationOnce(() =>
      Promise.resolve({ conn: menuConnection } as DIConnectionObject<any>));

    jest.spyOn(connection, "getConnection").mockImplementationOnce(() =>
      Promise.resolve({ conn: voucherConnection } as DIConnectionObject<any>));
  });

  afterAll(async () => {
    await clearDatabase(orderConnection);
    await orderConnection?.close(true);
    await clearDatabase(networkConnection);
    await networkConnection?.close(true);
    await clearDatabase(menuConnection);
    await menuConnection?.close(true);
  });

  afterEach(async () => {
    await clearDatabase(voucherConnection);
    await voucherConnection?.close(true);
  });

  describe("Validate Order", () => {
    it("should be able to create an order", async () => {
      const order = await createOrder(IDependencyInjection)(generateMockOrderInput({}));
      expect(order).toBeDefined();
    });

    it("should be able to create an order with PREFIXE vouchers", async () => {
      const order = await createOrder(IDependencyInjection)(generateMockOrderInput({ usePreFixeVoucher: true }));
      expect(order).toBeDefined();
    });

    it("should not pass validateHotelHasHubAndRoomNumber block", async () => {
      await expect(async () => {
        await createOrder(IDependencyInjection)(generateMockOrderInput({ invalidHotelData: true }));
      }).rejects.toThrow(NotFoundError);
    });

    it("should not pass validateProducts block - Product not found", async () => {
      await expect(async () => {
        await createOrder(IDependencyInjection)(generateMockOrderInput({ invalidProduct: true }));
      }).rejects.toThrowError("Some of the products do not exist in the database");
    });

    it("should not pass validateProducts block - Product with its category do not match", async () => {
      const data = generateMockOrderInput({ invalidCategory: true });

      await expect(async () => {
        await createOrder(IDependencyInjection)(data);
      }).rejects.toThrowError(`Category with id '${data.products[0].categoryId}' does not exist or does not belong to product with id '${data.products[0].id}'`);
    });

    it("should not pass validateProducts block - Product with invalid modifiers", async () => {
      const data = generateMockOrderInput({ invalidModifiers: true });
      await expect(async () => {
        await createOrder(IDependencyInjection)(data);
      }).rejects.toThrowError(`Product with id '${data.products[0].id}' has invalid modifier options.`);
    });

    it("should not pass validateProducts block - Product with invalid price", async () => {
      const data = generateMockOrderInput({ invalidPrice: true });
      await expect(async () => {
        await createOrder(IDependencyInjection)(data);
      }).rejects.toThrowError("Product price is not valid.");
    });

    it("should throw an error if payment gateway is not correct", async () => {
      await expect(async () => {
        await createOrder(IDependencyInjection)(generateMockOrderInput({ invalidPaymentGateway: true }));
      }).rejects.toThrowError("Invalid payment gateway.");
    });

    it("should throw an error if voucher code is wrong", async () => {
      await expect(async () => {
        await createOrder(IDependencyInjection)(generateMockOrderInput({ invalidVoucherCode: true }));
      }).rejects.toThrowError("Some of the codes do not exist in the database");
    });

    it("should throw an error if voucher PER_DIEM is claimed", async () => {
      const data = generateMockOrderInput({ usedVoucherCodePERDIEM: true });
      await expect(async () => {
        await createOrder(IDependencyInjection)(data);
      }).rejects.toThrowError(`Voucher code '${data.voucher.code}' has expired`);
    });

    it("should throw an error if voucher DISCOUNT is claimed", async () => {
      const data = generateMockOrderInput({ usedVoucherCodeDISCOUNT: true });
      await expect(async () => {
        await createOrder(IDependencyInjection)(data);
      }).rejects.toThrowError(`Voucher code '${data.voucher.code}' has already been used`);
    });

    it("should throw an error if program is inactive", async () => {
      const data = generateMockOrderInput({ codeWithInactiveProgram: true });
      await expect(async () => {
        await createOrder(IDependencyInjection)(data);
      }).rejects.toThrowError(`Program for voucher code '${data.voucher.code}' is not active.`);
    });
  });

  describe("Create Order", () => {
    let orderBegin;
    let orderCommit;
    let orderRollback;
    let voucherBegin;
    let voucherCommit;
    let voucherRollback;

    beforeEach(async () => {
      orderBegin = jest.spyOn(orderConnection.em, "begin").mockImplementation(() => Promise.resolve());
      orderCommit = jest.spyOn(orderConnection.em, "commit").mockImplementation(() => Promise.resolve());
      orderRollback = jest.spyOn(orderConnection.em, "rollback").mockImplementation(() => Promise.resolve());

      voucherBegin = jest.spyOn(voucherConnection.em, "begin").mockImplementation(() => Promise.resolve());
      voucherCommit = jest.spyOn(voucherConnection.em, "commit").mockImplementation(() => Promise.resolve());
      voucherRollback = jest.spyOn(voucherConnection.em, "rollback").mockImplementation(() => Promise.resolve());
    });

    it("should create an order", async () => {
      const order = await createOrder(IDependencyInjection)(generateMockOrderInput({}));
      expect(order).toBeDefined();
      expect(orderBegin).toHaveBeenCalled();
      expect(orderCommit).toHaveBeenCalled();
      expect(voucherBegin).toHaveBeenCalled();
      expect(voucherCommit).toHaveBeenCalled();
    });

    it("should call rollback if an error happened", async () => {
      jest.spyOn(voucherConnection.em, "flush").mockImplementation(() => Promise.reject(new Error("Testing Rollback")));
      await expect(createOrder(IDependencyInjection)(generateMockOrderInput({}))).rejects.toThrow();
      expect(orderRollback).toHaveBeenCalled();
      expect(voucherRollback).toHaveBeenCalled();
    });
  });
});
