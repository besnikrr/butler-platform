
import * as express from "express";
import {
  ActionRequest, httpResponse, parsePaginationParam
} from "@butlerhospitality/service-sdk";
import usecase from "./usecases";

const router = express.Router();

router.get(
  "",
  async (req: ActionRequest, res: express.Response, next: express.NextFunction) => {
    try {
      const [data, count] = await usecase({
        conn: req.conn,
        tenant: req.tenant,
        validate: false
      }).listUsers({
        ...parsePaginationParam(req.query),
        id: Number(req.query.id),
        name: req.query.name as string
      });
      return res.send(
        httpResponse({
          payload: data,
          total: count || 0,
          nextPage: req.query.page ? Number(req.query.page) + 1 : 1
        })
      );
    } catch (e) {
      next(e);
    }
  }
);

export default router;
