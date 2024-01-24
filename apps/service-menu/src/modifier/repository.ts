/* eslint-disable max-len */

import { CustomEntityRepository } from "@butlerhospitality/service-sdk";
import Modifier from "./entities/modifier";
import ModifierOption from "./entities/modifier-option";

export interface IModifierRepository extends CustomEntityRepository<Modifier> {}
export class ModifierRepository extends CustomEntityRepository<Modifier> implements IModifierRepository {}

export interface IModifierOptionRepository extends CustomEntityRepository<ModifierOption> {}
export class ModifierOptionRepository extends CustomEntityRepository<ModifierOption> implements IModifierOptionRepository {}
