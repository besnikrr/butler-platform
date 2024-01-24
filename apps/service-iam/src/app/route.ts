
import * as express from "express";
import { httpResponse, ActionRequest, logger } from "@butlerhospitality/service-sdk";
import usecase from "./usecases";

const router = express.Router();

router.get(
  "",
  async (req: ActionRequest, res: express.Response, next: express.NextFunction) => {
    try {
      logger.log("Inside this");
      const [data] = await usecase({
        conn: req.conn,
        validate: !req.isValid,
        tenant: req.tenant
      }).listApps();
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
  "/apps",
  async (req: ActionRequest, res: express.Response, next: express.NextFunction) => {
    try {
      const data = await usecase({
        conn: req.conn,
        validate: !req.isValid,
        tenant: req.tenant
      }).listAppsWithPermissions();
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
