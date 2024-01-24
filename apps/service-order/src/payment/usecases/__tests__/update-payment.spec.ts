import path = require("path");
import { MikroORM } from "@mikro-orm/core";
import {
  clearDatabase,
  CustomEntityRepository,
  getTestConnection,
  NotFoundError,
  seedDatabase
} from "@butlerhospitality/service-sdk";
import { Payment } from "../../entity";
import updatePayment, { IUpdatePaymentInput } from "../update-payment";
import entities from "../../../utils/entities";
import { generateMockPayment } from "../../../utils/mock-tests";

const validateValuesToHave = (data: IUpdatePaymentInput, payment: IUpdatePaymentInput) => {
  expect(data.transactionId).toBe(payment.transactionId);
};

describe("update payment", () => {
  let orm: MikroORM;
  let paymentRepository: CustomEntityRepository<Payment>;

  let payment: Payment;

  const validUpdatePaymentInput = generateMockPayment();

  beforeAll(async () => {
    const connection = await getTestConnection(process.env.TEST_DB, entities);
    await clearDatabase(connection);
    await seedDatabase(connection, path.join(__dirname, "..", "..", "..", ".."));

    orm = connection;
    paymentRepository = orm.em.getRepository(Payment);
    payment = await paymentRepository.findOne({});
  });

  afterAll(async () => {
    await clearDatabase(orm);
    await orm?.close(true);
  });

  it("should update payment", async () => {
    expect(payment).toBeDefined();
    const updatePaymentData = await updatePayment(paymentRepository)(payment.id, { ...validUpdatePaymentInput });
    validateValuesToHave(updatePaymentData, validUpdatePaymentInput);
  });

  it("should throw not found when a payment does not exist", async () => {
    await expect(async () => {
      await updatePayment(paymentRepository)(-1, { ...validUpdatePaymentInput });
    }).rejects.toThrowError(NotFoundError);
  });
});
