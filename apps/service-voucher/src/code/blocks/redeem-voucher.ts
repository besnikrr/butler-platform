import { VoucherType } from "@butlerhospitality/shared";
import { ICodeRepository } from "../repository";
import { Decimal } from "decimal.js-light";

Decimal.config({ rounding: Decimal.ROUND_HALF_UP });

export interface IRedeemVoucherDependency {
  codeRepository: ICodeRepository;
}

export type RedeemVoucherInput = number | number[];

export default (dependency: IRedeemVoucherDependency) => {
  const { codeRepository } = dependency;

  return async (input: RedeemVoucherInput, amount: number): Promise<void> => {
    const ids = input instanceof Array ? input : [input];
    const codes = await codeRepository.find(ids, ["program"]);

    for (const code of codes) {
      switch (code.program.type) {
      case VoucherType.DISCOUNT:
        code.claimed_date = new Date();
        code.amount_used = Number(new Decimal(amount).toFixed(2));
        break;
      case VoucherType.PER_DIEM:
        code.claimed_date = code.claimed_date ?? new Date();
        code.amount_used = Number(new Decimal(code.amount_used ?? 0).add(new Decimal(amount)).toFixed(2));
        break;
      case VoucherType.PRE_FIXE:
        code.claimed_date = new Date();
        code.amount_used = Number(new Decimal(amount).toFixed(2));
        break;
      default:
        throw new Error("Wrong voucher type");
      }
    }

    await codeRepository.flush();
  };
};
