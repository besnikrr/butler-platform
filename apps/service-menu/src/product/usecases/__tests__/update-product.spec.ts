
import {
  BadRequestError, clearDatabase, getTestConnection, NotFoundError, seedDatabase
} from "@butlerhospitality/service-sdk";
import { faker } from "@faker-js/faker";
import { MikroORM } from "@mikro-orm/core";
import * as path from "path";
import { IMenuRepository, IProductMenuRepository } from "../../../menu/repository";
import Product from "../../entities/product";
import updateProduct, {
  IUpdateProductCategoriesInput,
  IUpdateProductInformationInput,
  IUpdateProductLabelsInput,
  IUpdateProductModifiersInput,
  ProductUpdateType
} from "../update-product";
import { MenuEntities } from "../../../entities";
import Modifier from "../../../modifier/entities/modifier";
import Category from "../../../category/entities/category";
import { IProductRepository } from "../../repository";
import { IModifierRepository } from "../../../modifier/repository";
import { ICategoryRepository } from "../../../category/repository";
import ProductMenu from "@services/service-menu/src/menu/entities/product-menu";
import Menu from "@services/service-menu/src/menu/entities/menu";
import Label from "@services/service-menu/src/label/entities/label";
import { ILabelRepository } from "@services/service-menu/src/label/repository";

describe("Update product usecase", () => {
  const expectResponseToHaveKeys = (product: Product) => {
    for (const property of Object.getOwnPropertyNames(product)) {
      expect(product).toHaveProperty(property);
    }
  };

  let orm: MikroORM;
  let productRepository: IProductRepository;
  let modifierRepository: IModifierRepository;
  let categoryRepository: ICategoryRepository;
  let productMenuRepository: IProductMenuRepository;
  let menuRepository: IMenuRepository;
  let labelRepository: ILabelRepository;
  let productToUpdate: Product;
  beforeAll(async () => {
    const conn = await getTestConnection(process.env.TEST_DB, MenuEntities.asArray());
    orm = conn;
    await seedDatabase(conn, path.join(__dirname, "..", "..", "..", ".."));
    productRepository = conn.em.getRepository(Product);
    modifierRepository = conn.em.getRepository(Modifier);
    categoryRepository = conn.em.getRepository(Category);
    productMenuRepository = conn.em.getRepository(ProductMenu);
    menuRepository = conn.em.getRepository(Menu);
    labelRepository = conn.em.getRepository(Label);
    productToUpdate = await productRepository.findOne({});
  });

  it("should update a product general information", async () => {
    const data: IUpdateProductInformationInput = {
      name: faker.commerce.productName(),
      price: +faker.commerce.price(1, 25),
      description: faker.random.words(7),
      needs_cutlery: faker.datatype.boolean(),
      guest_view: faker.datatype.boolean(),
      raw_food: faker.datatype.boolean(),
      image: faker.internet.url()
    };

    const product = await updateProduct({
      productRepository, categoryRepository, modifierRepository, productMenuRepository, menuRepository, labelRepository
    })(
      productToUpdate.id,
      ProductUpdateType.GENERAL_INFORMATION,
      data
    );

    expectResponseToHaveKeys(product);
    expect(product.id).toBeGreaterThan(0);
    expect(product.name).toEqual(data.name);
    expect(product.description).toEqual(data.description);
    expect(product.needs_cutlery).toEqual(data.needs_cutlery);
    expect(product.guest_view).toEqual(data.guest_view);
    expect(product.raw_food).toEqual(data.raw_food);
  });

  it("should update a product modifiers", async () => {
    const { id: modId } = await modifierRepository.findOne({});
    const data: IUpdateProductModifiersInput = {
      modifiers: [modId]
    };

    const product = await updateProduct({
      productRepository, categoryRepository, modifierRepository, productMenuRepository, menuRepository, labelRepository
    })(
      productToUpdate.id,
      ProductUpdateType.MODIFIERS,
      data
    );

    expectResponseToHaveKeys(product);
    expect(product.modifiers.getItems().map((item) => item.id)).toEqual(data.modifiers);
  });

  it("should update a products categories", async () => {
    const { id: catId } = await categoryRepository.findOne({ parent_category_id: null });
    const data: IUpdateProductCategoriesInput = {
      categories: [catId]
    };

    const product = await updateProduct({
      productRepository, categoryRepository, modifierRepository, productMenuRepository, menuRepository, labelRepository
    })(
      productToUpdate.id,
      ProductUpdateType.CATEGORIES,
      data
    );

    expectResponseToHaveKeys(product);
    expect(product.categories.getItems().map((item) => item.id)).toEqual(data.categories);
  });

  it("should update a products labels", async () => {
    const { id: labelId } = await categoryRepository.findOne({});
    const data: IUpdateProductLabelsInput = {
      labels: [labelId]
    };

    const product = await updateProduct({
      productRepository, categoryRepository, modifierRepository, productMenuRepository, menuRepository, labelRepository
    })(
      productToUpdate.id,
      ProductUpdateType.LABELS,
      data
    );

    expectResponseToHaveKeys(product);
    expect(product.labels.getItems().map((label) => label.id)).toEqual(data.labels);
  });

  it(
    "should fail to update the product when the update type provided is not in the ProductUpdateType enum",
    async () => {
      const data: IUpdateProductInformationInput = {
        name: faker.commerce.productName(),
        image: faker.internet.url(),
        price: faker.datatype.float(0.01),
        guest_view: faker.datatype.boolean(),
        needs_cutlery: faker.datatype.boolean(),
        raw_food: faker.datatype.boolean()
      };

      await expect(async () => updateProduct({
        productRepository,
        categoryRepository,
        modifierRepository,
        productMenuRepository,
        menuRepository,
        labelRepository
      })(
        productToUpdate.id,
        "bad type" as any,
        data
      )).rejects.toThrow(BadRequestError);
    }
  );

  it("should fail to update the product when non existing categories are provided", async () => {
    const data: IUpdateProductCategoriesInput = {
      categories: [-1]
    };

    await expect(async () => updateProduct({
      productRepository, categoryRepository, modifierRepository, productMenuRepository, menuRepository, labelRepository
    })(
      productToUpdate.id,
      ProductUpdateType.CATEGORIES,
      data
    )).rejects.toThrow(NotFoundError);
  });

  it("should fail to update the product when non existing labels are provided", async () => {
    const data: IUpdateProductLabelsInput = {
      labels: [-1]
    };

    await expect(async () => updateProduct({
      productRepository, categoryRepository, modifierRepository, productMenuRepository, menuRepository, labelRepository
    })(
      productToUpdate.id,
      ProductUpdateType.LABELS,
      data
    )).rejects.toThrow(NotFoundError);
  });

  it("should fail to update the product when non existing modifiers are provided", async () => {
    const data: IUpdateProductModifiersInput = {
      modifiers: [-1]
    };

    await expect(async () => updateProduct({
      productRepository, categoryRepository, modifierRepository, productMenuRepository, menuRepository, labelRepository
    })(
      productToUpdate.id,
      ProductUpdateType.MODIFIERS,
      data
    )).rejects.toThrow(NotFoundError);
  });

  afterAll(async () => {
    await clearDatabase(orm);

    await orm.close(true);
  });
});
