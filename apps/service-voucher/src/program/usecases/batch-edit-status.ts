
import { eventProvider } from "@butlerhospitality/service-sdk";
import { SNS_TOPIC, PROGRAM_EVENT, ENTITY } from "@butlerhospitality/shared";
import {
  ArrayNotEmpty, IsArray, IsBoolean, IsNotEmpty, IsPositive
} from "class-validator";
import Program, { IProgramPublish, ProgramStatus } from "../entities/program";
import { IProgramRepository } from "../repository";

export interface IEditStatusInput {
  ids: number[];
  activate: boolean;
}

export class EditStatusInput implements IEditStatusInput {
  @IsArray()
  @ArrayNotEmpty()
  @IsPositive({ each: true })
  ids: number[];

  @IsBoolean()
  @IsNotEmpty()
  activate: boolean;
}

export interface IBatchEditProgramDependency {
  programRepository: IProgramRepository;
}

export default (dependency: IBatchEditProgramDependency) => {
  const { programRepository } = dependency;
  return async (data: IEditStatusInput): Promise<Program[]> => {
    const programs = await programRepository.find({
      id: {
        $in: data.ids
      }
    }, {
      populate: ["hotels", "rules.categories.parent_category"]
    });
    const eventData = [];
    programs.forEach((program) => {
      program.status = data.activate ? ProgramStatus.ACTIVE : ProgramStatus.INACTIVE;
      eventData.push({
        entity: ENTITY.VOUCHER.PROGRAM,
        ...program
      });
    });
    await programRepository.flush();

    await eventProvider.client().publish<IProgramPublish[]>(
      SNS_TOPIC.VOUCHER.PROGRAM, PROGRAM_EVENT.STATUS_CHANGED, null, eventData);
    return programs;
  };
};
