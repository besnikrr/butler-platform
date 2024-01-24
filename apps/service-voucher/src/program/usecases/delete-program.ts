import { eventProvider } from "@butlerhospitality/service-sdk";
import { PROGRAM_EVENT, SNS_TOPIC, ENTITY } from "@butlerhospitality/shared";
import { IProgramPublish } from "../entities/program";
import { IProgramRepository } from "../repository";

export interface IDeleteProgramDependency {
  programRepository: IProgramRepository;
}

export default (dependency: IDeleteProgramDependency) => {
  const { programRepository } = dependency;
  return async (id: number) => {
    const program = await programRepository.getOneEntityOrFail(id);
    await programRepository.softDelete(program.id);
    await eventProvider.client().publish<IProgramPublish>(
      SNS_TOPIC.VOUCHER.PROGRAM, PROGRAM_EVENT.DELETED, null, {
        entity: ENTITY.VOUCHER.PROGRAM,
        ...program
      }
    );
    return program;
  };
};
