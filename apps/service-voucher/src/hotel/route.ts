
import * as express from "express";
import { ActionRequest, httpResponse, parsePaginationParam } from "@butlerhospitality/service-sdk";
import usecase from "./usecases";
import { IProgramFilter } from "./usecases/get-program-hotels";
import { VoucherType } from "@butlerhospitality/shared";

const router = express.Router();

router.get(
  "/api/voucher/program-hotels",
  async (req: ActionRequest, res, next: express.NextFunction) => {
    try {
      let type: string[];

      if (Array.isArray(req.query.type) && req.query.type.length) {
        type = req.query.type as string[];
      }

      const filters: IProgramFilter = {
        programType: type && type.map((filterType: string) => VoucherType[filterType]),
        hotelName: req.query.name as string,
        ...parsePaginationParam(req.query)
      };

      const [data, count] = await usecase({
        conn: req.conn,
        validate: !req.isValid,
        tenant: req.tenant
      }).getProgramHotels(filters);
      return res.send(
        httpResponse({
          payload: data,
          nextPage: req.query.page ? Number(req.query.page) + 1 : 0,
          total: count || 0
        })
      );
    } catch (e) {
      next(e);
    }
  }
);

router.get(
  "/api/voucher/hotels/:id",
  async (req: ActionRequest, res, next: express.NextFunction) => {
    try {
      const data = await usecase({
        conn: req.conn,
        validate: !req.isValid,
        tenant: req.tenant
      }).getHotel(Number(req.params.id));
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
  "/api/voucher/hotels",
  async (req: ActionRequest, res, next: express.NextFunction) => {
    try {
      const [data, count] = await usecase({
        conn: req.conn,
        validate: !req.isValid,
        tenant: req.tenant
      }).getHotels({
        ...parsePaginationParam(req.query),
        name: req.query.search as string
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
