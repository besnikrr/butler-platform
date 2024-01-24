import { BadRequestError } from "@butlerhospitality/service-sdk";
import { VoucherType } from "@butlerhospitality/shared";
import { MikroORM } from "@mikro-orm/core";
import Code from "../../code/entities/code";
import { ICodeRepository } from "../../code/repository";
import { ProgramStatus } from "../../program/entities/program";
export interface IValidateVouchersDependency {
  connection: MikroORM;
}

export interface IVoucher {
  id: number;
  code: string;
}

export interface IValidateVoucherDependenciesInput {
  vouchers: IVoucher | IVoucher[];
}

const oneDayInMilliseconds = 24 * 60 * 60 * 1000;

export default (
  dependency: IValidateVouchersDependency
) => {
  return async (input: IValidateVoucherDependenciesInput): Promise<void> => {
    const vouchers = input.vouchers instanceof Array ? input.vouchers : [input.vouchers];

    const codeRepository = dependency.connection.em.getRepository(Code) as ICodeRepository;
    const codeIds = vouchers.map((a) => a.id);
    const codes = await codeRepository.getEntitiesOrFailIfNotFound(codeIds, ["program"]);

    for (const code of codes) {
      const inputCode = vouchers.find((a) => a.id === code.id);

      if (code.code !== inputCode.code) {
        throw new BadRequestError(`Voucher code '${inputCode.code}' is invalid`);
      }

      if (code.program.status !== ProgramStatus.ACTIVE) {
        throw new BadRequestError(`Program for voucher code '${inputCode.code}' is not active.`);
      }

      if (code.claimed_date && code.program.type === VoucherType.PER_DIEM) {
        const msBetweenDates = Math.abs(new Date(code.claimed_date).getTime() - new Date().getTime());
        if (msBetweenDates > oneDayInMilliseconds) {
          throw new BadRequestError(`Voucher code '${inputCode.code}' has expired`);
        }
      }
    }
  };
};
