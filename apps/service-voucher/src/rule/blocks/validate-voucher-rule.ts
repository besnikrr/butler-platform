import { BadRequestError } from "@butlerhospitality/service-sdk";
import { MikroORM } from "@mikro-orm/core";
import { IRuleRepository } from "@services/service-voucher/src/rule/repository";
import Code from "../../code/entities/code";
import { ICodeRepository } from "../../code/repository";
import Rule, { IRule } from "../entities/rule";

export interface IValidateVoucherRuleInput extends IValidateRuleInput { }

export interface IProduct {
  id?: number;
  productId: number;
  name: string;
  categoryId: number;
  categoryName: string;
  price: number;
  originalPrice?: number;
  quantity: number;
  options: number[];
  comment?: string;
  code?: string;
  codeId?: number;
  ruleId?: number;
}

export interface IValidateRuleInput {
  products: IProduct[];
}
export interface IRuleProductMapping {
  key: number;
  value: IProduct;
}

export interface IValidateVoucherRuleDependency<> {
  connection: MikroORM;
}

export default (
  dependency: IValidateVoucherRuleDependency
) => {
  return async (input: IValidateVoucherRuleInput) => {
    const codeRepository = dependency.connection.em.getRepository(Code) as ICodeRepository;
    const codeIds = [...new Set(input.products.map((product) => product.codeId))];
    const codes = await codeRepository.getEntitiesOrFailIfNotFound(codeIds, ["program.rules"]);

    validateRuleBelongsToCode(codes, input.products);
    const ruleProductsMapping = mapRuleProducts(input.products);
    const rules = await getRules(
      ruleProductsMapping,
      dependency.connection.em.getRepository(Rule) as IRuleRepository
    );

    validateIfRuleExists(ruleProductsMapping, rules);
    validateQuantityAndMaxPrice(ruleProductsMapping, rules);
  };
};

function validateRuleBelongsToCode(codes: Code[], products: IProduct[]) {
  for (const code of codes) {
    const product = products.find((p) => p.codeId === code.id);

    if (product) {
      const rules = code.program.rules;
      if (!rules.getItems().some((rule) => rule.id === product.ruleId)) {
        throw new BadRequestError(
          `Rule with the id '${product.ruleId}' does not belong to the voucher code '${code.code}' of product '${product.name}'`
        );
      }
    }
  }
}
async function getRules(products: IRuleProductMapping, ruleRepository: IRuleRepository) {
  return ruleRepository.getEntitiesOrFailIfNotFound(
    Object.keys(products).map((ruleId) => Number(ruleId)),
    ["categories"]
  );
}

function validateIfRuleExists(products: IRuleProductMapping, rules: IRule[]) {
  for (const rule of rules) {
    for (const product of products[rule.id]) {
      const ruleCategories = rule.categories.getItems().filter((category) => category.id === product.categoryId);

      if (ruleCategories.length === 0) {
        throw new BadRequestError("Rule and product categories do not match.");
      }
    }
  }
  return true;
}

function validateQuantityAndMaxPrice(
  products: IRuleProductMapping,
  rules: IRule[]) {
  for (const rule of rules) {
    const ruleProducts = products[rule.id];
    const maxValueOfProducts = ruleProducts.reduce((acc: number, current) => acc + current.price, 0);

    if (rule.quantity < ruleProducts.length) {
      throw new BadRequestError(`Invalid quantity provided for rule with id ${rule.id}.`);
    }

    if (rule.max_price < maxValueOfProducts) {
      throw new BadRequestError(`Invalid price provided for rule with id ${rule.id}.`);
    }
  }
  return true;
}

function mapRuleProducts(products: IProduct[]): IRuleProductMapping {
  return products.reduce((objectsByKeyValue, obj) => {
    const ruleId = obj.ruleId;
    if (ruleId) {
      objectsByKeyValue[ruleId] = (objectsByKeyValue[ruleId] || []).concat(obj);
    }
    return objectsByKeyValue;
  }, {}) as IRuleProductMapping;
}
