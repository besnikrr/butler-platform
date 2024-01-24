
import {
  clearDatabase, getTestConnection, NotFoundError, seedDatabase
} from "@butlerhospitality/service-sdk";
import { faker } from "@faker-js/faker";
import { MikroORM } from "@mikro-orm/core";
import * as path from "path";
import Product from "../../entities/product";
import createProduct, { ICreateProductInput } from "../create-product";
import { MenuEntities } from "../../../entities";
import Modifier from "../../../modifier/entities/modifier";
import Category from "../../../category/entities/category";
import { IProductRepository } from "../../repository";
import { IModifierRepository } from "../../../modifier/repository";
import { ICategoryRepository } from "../../../category/repository";
import { ILabelRepository } from "../../../label/repository";
import Label from "../../../label/entities/label";

describe("Create product usecase", () => {
  const expectResponseToHaveKeys = (product: Product) => {
    for (const property of Object.getOwnPropertyNames(product)) {
      expect(product).toHaveProperty(property);
    }
  };

  let orm: MikroORM;
  let productRepository: IProductRepository;
  let modifierRepository: IModifierRepository;
  let categoryRepository: ICategoryRepository;
  let labelRepository: ILabelRepository;

  beforeAll(async () => {
    const conn = await getTestConnection(process.env.TEST_DB, MenuEntities.asArray());
    orm = conn;
    await seedDatabase(conn, path.join(__dirname, "..", "..", "..", ".."));
    productRepository = conn.em.getRepository(Product);
    modifierRepository = conn.em.getRepository(Modifier);
    categoryRepository = conn.em.getRepository(Category);
    labelRepository = conn.em.getRepository(Label);
  });

  it("should create a product", async () => {
    const { id: modId } = await modifierRepository.findOne({});
    const { id: catId } = await categoryRepository.findOne({ parent_category_id: null });
    const { id: labelId } = await labelRepository.findOne({});
    const data: ICreateProductInput = {
      name: faker.commerce.productName(),
      price: +faker.commerce.price(1, 25),
      description: faker.random.words(7),
      needs_cutlery: faker.datatype.boolean(),
      guest_view: faker.datatype.boolean(),
      raw_food: faker.datatype.boolean(),
      image: "whatever",
      categories: [catId],
      modifiers: [modId],
      labels: [labelId]
    };

    const product = await createProduct(
      { productRepository, categoryRepository, modifierRepository, labelRepository }
    )(data);

    expectResponseToHaveKeys(product);
    expect(product.id).toBeGreaterThan(0);
    expect(product.name).toEqual(data.name);
    expect(product.description).toEqual(data.description);
    expect(product.needs_cutlery).toEqual(data.needs_cutlery);
    expect(product.guest_view).toEqual(data.guest_view);
    expect(product.raw_food).toEqual(data.raw_food);
    expect(product.categories.getItems().map((item) => item.id)).toEqual(data.categories);
    expect(product.modifiers.getItems().map((item) => item.id)).toEqual(data.modifiers);
  });

  it("should fail to create a product because of non existing modifier", async () => {
    const { id: modId } = await modifierRepository.findOne({});
    const { id: catId } = await categoryRepository.findOne({ parent_category_id: null });
    const { id: labelId } = await labelRepository.findOne({});
    const data: ICreateProductInput = {
      name: faker.commerce.productName(),
      price: +faker.commerce.price(1, 25),
      description: faker.random.words(7),
      needs_cutlery: faker.datatype.boolean(),
      guest_view: faker.datatype.boolean(),
      raw_food: faker.datatype.boolean(),
      image: "whatever",
      categories: [catId],
      modifiers: [modId, -1],
      labels: [labelId]
    };

    await expect(async () => createProduct({
      productRepository,
      categoryRepository,
      modifierRepository,
      labelRepository
    })(data)).rejects.toThrow(
      NotFoundError
    );
  });

  it("should fail to create a product because of non existing categories", async () => {
    const { id: modId } = await modifierRepository.findOne({});
    const { id: catId } = await categoryRepository.findOne({ parent_category_id: null });
    const { id: labelId } = await labelRepository.findOne({});
    const data: ICreateProductInput = {
      name: faker.commerce.productName(),
      price: +faker.commerce.price(1, 25),
      description: faker.random.words(7),
      needs_cutlery: faker.datatype.boolean(),
      guest_view: faker.datatype.boolean(),
      raw_food: faker.datatype.boolean(),
      image: "whatever",
      categories: [catId, -1],
      modifiers: [modId],
      labels: [labelId]
    };

    await expect(async () => createProduct({
      productRepository,
      categoryRepository,
      modifierRepository,
      labelRepository
    })(data)).rejects.toThrow(
      NotFoundError
    );
  });

  afterAll(async () => {
    await clearDatabase(orm);

    await orm.close(true);
  });
});
