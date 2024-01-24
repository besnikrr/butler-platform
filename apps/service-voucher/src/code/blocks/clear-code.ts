import { Decimal } from "decimal.js-light";
import { CodeRepository } from "../repository";

Decimal.config({ rounding: Decimal.ROUND_HALF_UP });

interface IGetCodeDependency {
  codeRepository: CodeRepository;
}

export interface IClearCodeInput {
  codeIds: number[];
  amount?: number;
}

export default ({ codeRepository }: IGetCodeDependency) => {
  return async (input: IClearCodeInput) => {
    const codes = await codeRepository.find(input.codeIds, ["program"]);

    for (const code of codes) {
      if (input.amount) {
        const amount = new Decimal(input.amount);
        const amountUsed = new Decimal(code.amount_used ?? 0);

        code.amount_used = amountUsed.sub(amount).lessThanOrEqualTo(0) ? 0 : amountUsed.sub(amount).toNumber();
        code.claimed_date = new Decimal(code.amount_used).lessThanOrEqualTo(0) ? null : code.claimed_date;
      } else {
        code.amount_used = 0.00;
        code.claimed_date = null;
      }
    }

    await codeRepository.flush();
  };
};
