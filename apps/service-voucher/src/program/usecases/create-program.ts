
import { eventProvider } from "@butlerhospitality/service-sdk";
import { PROGRAM_EVENT, SNS_TOPIC, ENTITY, VoucherType, AmountType } from "@butlerhospitality/shared";
import {
  IsOptional,
  IsNotEmpty,
  IsNumber,
  IsString,
  IsEnum,
  IsArray,
  ValidateIf,
  ArrayNotEmpty,
  ValidateNested,
  Min,
  Max,
  IsPositive,
  MaxLength
} from "class-validator";
import { Type } from "class-transformer";
import { wrap } from "@mikro-orm/core";
import {
  ProgramStatus, IProgram,
  IProgramPublish
} from "../entities/program";
import { validateAmountType, validateCategories } from "../../utils/validator";
import { IHotelRepository } from "../../hotel/repository";
import { IProgramRepository } from "../repository";
import { ICategoryRepository } from "../../category/repository";

export interface ICreateRuleInput {
  quantity: number;
  max_price: number;
  oms_id?: number;
  categories: number[];
}

export class CreateRuleInput implements ICreateRuleInput {
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

export interface ICreateProgramInput {
  name: string;
  description?: string;
  type: VoucherType;
  status: ProgramStatus;
  payer: string;
  payer_percentage: number;
  amount: number;
  amount_type: AmountType;
  code_limit: number;
  hotel_id: number;
  rules?: ICreateRuleInput[];
}

export class CreateProgramInput implements ICreateProgramInput {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  description?: string;

  @IsEnum(VoucherType)
  @IsNotEmpty()
  type: VoucherType;

  @IsEnum(ProgramStatus)
  @IsNotEmpty()
  status: ProgramStatus;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  payer: string;

  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  @Max(100)
  payer_percentage: number;

  @IsNumber()
  @IsNotEmpty()
  @IsPositive()
  amount: number;

  @IsEnum(AmountType)
  @IsNotEmpty()
  amount_type: AmountType;

  @IsNumber()
  @IsNotEmpty()
  @IsPositive()
  @Max(1000)
  code_limit: number;

  @IsNumber()
  @IsNotEmpty()
  hotel_id: number;

  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => CreateRuleInput)
  @ValidateIf((data) => data.type === VoucherType.PRE_FIXE)
  rules: ICreateRuleInput[];
}

export interface ICreateProgramOutput extends IProgram { }

export interface ICreateProgramDependency {
  hotelRepository: IHotelRepository;
  programRepository: IProgramRepository;
  categoryRepository: ICategoryRepository;
}

export default (dependency: ICreateProgramDependency) => {
  const {
    hotelRepository, programRepository, categoryRepository
  } = dependency;
  return async (data: ICreateProgramInput): Promise<ICreateProgramOutput> => {
    const hotel = await hotelRepository.getOneEntityOrFail(data.hotel_id);
    const { rules, ...programInput } = data;

    const program = programRepository.create({
      ...data,
      amount_type: validateAmountType(programInput.type, programInput.amount_type)
    });

    hotel.programs.add(program);

    wrap(hotel).assign({ updated_at: new Date(Date.now()) });

    if (programInput.type === VoucherType.PRE_FIXE) {
      await validateCategories(categoryRepository)(rules);
      wrap(program).assign({ ...rules });
    }

    await programRepository.persistAndFlush(program);
    await hotelRepository.persistAndFlush(hotel);
    await programRepository.populate(program, ["hotels", "rules.categories"]);
    await eventProvider.client().publish<IProgramPublish>(
      SNS_TOPIC.VOUCHER.PROGRAM, PROGRAM_EVENT.CREATED, null, {
        entity: ENTITY.VOUCHER.PROGRAM,
        ...program
      }
    );
    return program;
  };
};
