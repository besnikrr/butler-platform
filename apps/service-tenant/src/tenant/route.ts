import * as express from "express";
import { ActionRequest, getOrigin } from "@butlerhospitality/service-sdk";
import usecases from "./usecases";

const { getTenant } = usecases();
const router = express.Router();

router.get(
  "/api/tenant/current",
  async (req: ActionRequest, res: express.Response, next: express.NextFunction) => {
    try {
      const tenant = await getTenant(getOrigin(req));
      return res.send({
        result: tenant
      });
    } catch (e) {
      next(e);
    }
  }
);

export default router;
