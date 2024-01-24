
import { CustomEntityRepository } from "@butlerhospitality/service-sdk";
import Rule from "./entities/rule";

export interface IRuleRepository extends CustomEntityRepository<Rule> {}
export class RuleRepository extends CustomEntityRepository<Rule> implements IRuleRepository {}
