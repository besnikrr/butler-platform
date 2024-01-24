import { IServiceFee } from "../hotel/entity";

export const orderServiceFee = (service_fee: IServiceFee[]) => {
  return service_fee.map((s) => {
    return { ...s, fee_values: s.fee_values.sort((a, b) => Number(a.order) > Number(b.order) ? 1 : -1) };
  });
};
