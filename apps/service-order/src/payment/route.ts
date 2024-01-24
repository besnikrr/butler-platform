import { ActionRequest, httpResponse, validateRequest } from "@butlerhospitality/service-sdk";
import * as express from "express";
import usecase from "./usecases";
import { UpdatePaymentInput } from "./usecases/update-payment";

const router = express.Router();

router.put(
  "/api/payment/:id",
  validateRequest(UpdatePaymentInput),
  async (req: ActionRequest, res: express.Response, next: express.NextFunction) => {
    try {
      const data = await usecase(req.conn).updatePayment(Number(req.params.id), req.body);

      res.send(
        httpResponse({
          payload: data
        })
      );
    } catch (e) {
      next(e);
    }
  }
);

export default router;
