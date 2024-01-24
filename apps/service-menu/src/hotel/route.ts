
import {
  ActionRequest, httpResponse, parsePaginationParam
} from "@butlerhospitality/service-sdk";
import * as express from "express";
import usecase from "./usecases";

const router = express.Router();

router.get(
  "/api/menu/external/relation/hotels",
  async (req: ActionRequest, res: express.Response, next: express.NextFunction) => {
    try {
      const name = req.query.name as string;
      const menuIds = req.query.menuIds as string[];

      const [data, count] = await usecase({
        conn: req.conn,
        tenant: req.tenant,
        validate: !req.isValid
      }).listHotels({
        ...parsePaginationParam(req.query),
        name,
        menuIds: menuIds ? menuIds.map((a) => +a) : []
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
