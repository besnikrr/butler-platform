
import * as express from "express";
import { ActionRequest, httpResponse } from "@butlerhospitality/service-sdk";
import usecase from "./usecases";

const router = express.Router();

router.get(
  "/api/voucher/categories",
  async (req: ActionRequest, res, next: express.NextFunction) => {
    try {
      const [data, count] = await usecase({ conn: req.conn, validate: false, tenant: req.tenant }).listCategories();

      return res.send(
        httpResponse({
          payload: data,
          total: count
        })
      );
    } catch (e) {
      next(e);
    }
  }
);

export default router;
