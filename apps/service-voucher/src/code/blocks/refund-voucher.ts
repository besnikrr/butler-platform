import { ICodeRepository } from "@services/service-voucher/src/code/repository";

export const action = "REFUND_VOUCHER";

interface IRefundVoucherDependency {
  codeRepository: ICodeRepository;
}

const checkIfDateIsWithin24Hours = (claimedDate: Date) => {
  const diff = Math.abs(new Date(claimedDate).getTime() - new Date().getTime());
  return diff / (60 * 60 * 1000) < 24;
};

export default (dependency: IRefundVoucherDependency) => {
  return async (orderId: number) => {
    const voucher = await dependency.codeRepository.findOne({ order_id: orderId }, ["program"]);

    if (!voucher?.id) {
      return response({ message: `No voucher found with orderId: ${orderId}` });
    }

    if (voucher?.program?.type !== "PER_DIEM") {
      return response({ payload: voucher, message: `Cannot refund voucher with type: ${voucher.program.type}` });
    }

    if (!voucher.claimed_date) {
      return response({ payload: voucher, message: `Cannot refund voucher without claimed date` });
    }

    if (!checkIfDateIsWithin24Hours(voucher.claimed_date)) {
      return response({
        payload: voucher,
        message: `Cannot refund voucher with claimed date: ${voucher.claimed_date}`
      });
    }

    voucher.order_id = null;
    voucher.amount_used = null;
    voucher.claimed_date = null;
    await dependency.codeRepository.flush();

    return response({ success: true, payload: voucher, message: `Refunded voucher with id: ${voucher.id}` });
  };
};

type Response = {
  entity?: string;
  action?: string;
  success?: boolean;
  payload?: any;
  message?: string;
};

const response = (args: Response): Response => {
  return {
    action,
    entity: "Code",
    success: false,
    payload: null,
    ...args
  };
};
