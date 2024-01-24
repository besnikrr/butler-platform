import { VoucherType } from "@butlerhospitality/shared";

export type FakeProgram = {
  type: VoucherType;
};

export type FakeCode = {
  amount_used: number;
  claimed_date: string;
  program: FakeProgram;
};
