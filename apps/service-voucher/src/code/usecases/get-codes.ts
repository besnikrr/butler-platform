import { BaseFilter } from "@butlerhospitality/service-sdk";
import { VoucherType } from "@butlerhospitality/shared";
import Code, { CodeStatus } from "../entities/code";
import { ICodeRepository } from "../repository";

export interface ICodeFilter extends BaseFilter {
  programTypes?: VoucherType[];
  name?: string;
  fromDate?: Date;
  toDate?: Date;
  status?: CodeStatus;
}

export interface IGetCodesDependency {
  codeRepository: ICodeRepository;
}

export default (dependency: IGetCodesDependency) => {
  const { codeRepository } = dependency;
  return async (filters: ICodeFilter, hotelId: number): Promise<[Code[], number]> => {
    let options = {};
    const name = filters?.name?.trim();
    if (filters.status || filters.programTypes || filters.name || filters.fromDate || filters.toDate) {
      options = {
        filterCodes: {
          ...(filters.status && { status: filters.status }),
          ...(filters.programTypes && { type: filters.programTypes }),
          ...(name && { name: `%${name}%` }),
          ...(filters.fromDate && { fromDate: filters.fromDate }),
          ...(filters.toDate && { toDate: filters.toDate })
        }
      };
    }

    return codeRepository.findAndCount(
      { hotel: hotelId },
      {
        filters: options,
        ...(filters?.page && { offset: (filters.page - 1) * filters.limit }),
        ...(filters?.limit && { limit: filters.limit }),
        populate: ["program"]
      }
    );
  };
};
