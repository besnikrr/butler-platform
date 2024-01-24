import { BaseFilter } from "@butlerhospitality/service-sdk";
import { VoucherType } from "@butlerhospitality/shared";
import { ProgramStatus } from "../entities/program";
import { IProgramRepository } from "../repository";

export interface IHotelProgramFilter extends BaseFilter {
  programTypes?: VoucherType[];
  programName?: string;
  statuses?: ProgramStatus[];
  populate?: string[];
}
export interface IGetProgramsDependency {
  programRepository: IProgramRepository;
}

export default (dependency: IGetProgramsDependency) => {
  const { programRepository } = dependency;
  return async (filters: IHotelProgramFilter, hotelId: number) => {
    let options = {};
    const programName = filters?.programName?.trim();
    if (filters.statuses || filters.programTypes || filters.programName) {
      options = {
        programs: {
          ...(filters.statuses && { status: filters.statuses }),
          ...(filters.programTypes && { type: filters.programTypes }),
          ...(programName && { name: `%${programName}%` })
        }
      };
    }
    return programRepository.findAndCount(
      {
        hotels: {
          id: hotelId
        }
      },
      {
        filters: options, limit: filters.limit, offset: (filters.page - 1) * filters.limit, populate: filters.populate
      }
    );
  };
};
