import { wrap } from "@mikro-orm/core";
import { BadRequestError, eventProvider } from "@butlerhospitality/service-sdk";
import { PROGRAM_EVENT, SNS_TOPIC, ENTITY, VoucherType, AmountType } from "@butlerhospitality/shared";
import {
  IsOptional,
  IsNotEmpty,
  IsNumber,
  IsString,
  IsEnum,
  IsArray,
  ArrayNotEmpty,
  ValidateNested,
  ValidateIf,
  IsPositive,
  Min,
  Max,
  MaxLength
} from "class-validator";
import { Type } from "class-transformer";
import {
  IProgram, ProgramStatus, IProgramPublish
} from "../entities/program";
import { ICreateRuleInput } from "./create-program";
import { validateAmountType, validateCategories } from "../../utils/validator";
import { deleteRules, updateRules } from "../../utils/utils";
import { IProgramRepository } from "../repository";
import { IRuleRepository } from "../../rule/repository";
import { ICategoryRepository } from "../../category/repository";

export interface IUpdateRuleInput extends ICreateRuleInput {
  id?: number;
}
export class UpdateRuleInput implements IUpdateRuleInput {
  @IsNumber()
  @IsOptional()
  @IsPositive()
  id: number;

  @IsNumber()
  @IsNotEmpty()
  @IsPositive()
  quantity: number;

  @IsNumber()
  @IsNotEmpty()
  @IsPositive()
  max_price: number;

  @IsNumber()
  @IsOptional()
  oms_id?: number;

  @IsArray()
  @ArrayNotEmpty()
  categories: number[];
}

export interface IUpdateProgramInput {
  name: string;
  description?: string;
  type?: VoucherType;
  status?: ProgramStatus;
  payer?: string;
  payer_percentage?: number;
  amount?: number;
  amount_type?: AmountType;
  code_limit?: number;
  rules?: IUpdateRuleInput[];
}

export class UpdateProgramInput implements IUpdateProgramInput {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  description?: string;

  @IsEnum(VoucherType)
  @IsOptional()
  type: VoucherType;

  @IsEnum(ProgramStatus)
  @IsOptional()
  status: ProgramStatus;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  payer: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(100)
  payer_percentage: number;

  @IsNumber()
  @IsOptional()
  @IsPositive()
  amount: number;

  @IsEnum(AmountType)
  @IsOptional()
  amount_type: AmountType;

  @IsNumber()
  @IsOptional()
  @IsPositive()
  @Max(1000)
  code_limit: number;

  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => UpdateRuleInput)
  @ValidateIf((data) => data.type === VoucherType.PRE_FIXE)
  rules: IUpdateRuleInput[];
}

export interface IUpdateProgramOutput extends IProgram { }

export interface IUpdateProgramDependency {
  programRepository: IProgramRepository;
  ruleRepository: IRuleRepository;
  categoryRepository: ICategoryRepository;
}

export default (dependency: IUpdateProgramDependency) => {
  const { programRepository, ruleRepository, categoryRepository } = dependency;
  return async (programId: number, data: IUpdateProgramInput): Promise<IUpdateProgramOutput> => {
    const program = await programRepository.getOneEntityOrFail({ id: programId }, ["rules.categories"]);
    if (data.type && program.type !== data.type) {
      throw new BadRequestError("You can not update program type!");
    }

    const { rules, ...programInput } = data;

    if (program.type === VoucherType.PRE_FIXE) {
      await validateCategories(categoryRepository)(data.rules);
      const rulesToUpdate = rules.filter((rule) => rule.id);
      const updatedIds = await updateRules(ruleRepository)(rulesToUpdate);
      const rulesToDelete = program.rules.toArray().filter((rule: IUpdateRuleInput) => {
        return !updatedIds.includes(rule.id);
      }) as IUpdateRuleInput[];
      if (rulesToDelete.length) {
        await deleteRules(ruleRepository)(rulesToDelete);
      }
      const rulesToCreate = rules.filter((rule) => !rule.id);
      wrap(program).assign({ rules: [...program.rules, ...rulesToCreate] });
    }

    wrap(program).assign({
      ...programInput,
      amount_type: validateAmountType(program.type, data.amount_type)
    });

    await programRepository.flush();
    await eventProvider.client().publish<IProgramPublish>(
      SNS_TOPIC.VOUCHER.PROGRAM, PROGRAM_EVENT.UPDATED, null, {
        entity: ENTITY.VOUCHER.PROGRAM,
        ...program
      }
    );
    await program.rules.init();
    return programRepository.populate(program, ["rules.categories"]);
  };
};
