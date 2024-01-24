
import { CustomEntityRepository } from "@butlerhospitality/service-sdk";
import { wrap } from "@mikro-orm/core";
import { IUpdateRuleInput } from "../program/usecases/update-program";
import Rule from "../rule/entities/rule";

export const updateRules = (ruleRepository: CustomEntityRepository<Rule>) => {
  return async (rulesToUpdate: IUpdateRuleInput[]) => {
    const ruleIds = rulesToUpdate.map((rule) => rule.id);
    const rules = await ruleRepository.find({ id: ruleIds });
    for (let i = 0; i < rules.length; i += 1) {
      const updatedRule = rulesToUpdate.find((rule) => rules[i].id === rule.id);
      wrap(rules[i]).assign({ ...updatedRule });
    }
    return ruleIds;
  };
};

export const deleteRules = (ruleRepository: CustomEntityRepository<Rule>) => {
  return async (rulesToDelete: IUpdateRuleInput[]) => {
    const ruleIds = rulesToDelete.map((rule) => rule.id);
    await ruleRepository.softDelete(ruleIds);
    return ruleIds;
  };
};
