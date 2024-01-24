
import * as express from "express";
import {
  ActionRequest,
  httpResponse
} from "@butlerhospitality/service-sdk";
import usecase from "./usecases";

const router = express.Router();

router.get(
  "/api/discount/discount/:code",
  async (
    req: ActionRequest,
    res: express.Response,
    next: express.NextFunction
  ) => {
    try {
      const data = await usecase({
        conn: req.conn,
        validate: false,
        tenant: req.tenant
      }).getByCode(req.params.code);

      return res.send(
        httpResponse({
          payload: data
        })
      );
    } catch (e) {
      next(e);
    }
  }
);

router.get(
  "/api/discount/discount/:code/:phoneNumber",
  async (
    req: ActionRequest,
    res: express.Response,
    next: express.NextFunction
  ) => {
    try {
      const data = await usecase({
        conn: req.conn,
        validate: false,
        tenant: req.tenant
      }).getByCodeAndPhoneNumber(req.params.code, req.params.phoneNumber);

      return res.send(
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
