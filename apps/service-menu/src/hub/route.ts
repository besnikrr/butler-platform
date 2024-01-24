import * as express from "express";
import {
  ActionRequest, httpResponse, parsePaginationParam
} from "@butlerhospitality/service-sdk";
import usecase from "./usecases";

const router = express.Router();

router.get(
  "/api/menu/external/relation/hubs",
  async (req: ActionRequest, res: express.Response, next: express.NextFunction) => {
    try {
      const [data, count] = await usecase(req.conn).listHubs({
        ...parsePaginationParam(req.query),
        name: req.query.name?.toString()
      });

      res.send(
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
