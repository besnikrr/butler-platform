
import * as express from "express";
import {
  httpResponse, parsePaginationParam, ActionRequest, BadRequestError
} from "@butlerhospitality/service-sdk";
import usecase from "./usecases";
import { ICodeFilter } from "./usecases/get-codes";
import { CodeStatus } from "./entities/code";
import { VoucherType } from "@butlerhospitality/shared";

const router = express.Router();

router.get("/codes/:hotelId", async (req: ActionRequest, res, next: express.NextFunction) => {
  try {
    let types: string[];
    let fromDate: Date;
    let toDate: Date;

    if (Array.isArray(req.query.types) && req.query.types.length) {
      types = req.query.types as string[];
    }

    if (req.query?.fromDate) {
      fromDate = new Date(req.query.fromDate as string);
    }
    if (req.query?.toDate) {
      toDate = new Date(req.query.toDate as string);
    }

    if ((fromDate && fromDate.toString() === "Invalid Date") || (toDate && toDate.toString() === "Invalid Date")) {
      throw new BadRequestError("Invalid dates provided");
    }

    const filters: ICodeFilter = {
      programTypes: types && types.map((type: string) => VoucherType[type]),
      name: req.query.name as string,
      fromDate,
      toDate,
      status: CodeStatus[req.query.status as string],
      ...parsePaginationParam(req.query)
    };
    const [data, count] = await usecase({ conn: req.conn, validate: false, tenant: req.tenant }).getCodes(
      filters,
      Number(req.params.hotelId)
    );

    return res.send(
      httpResponse({
        payload: data,
        nextPage: req.query.page ? Number(req.query.page) + 1 : 1,
        total: count
      })
    );
  } catch (e) {
    next(e);
  }
});

router.get("/code/:code", async (req: ActionRequest, res, next: express.NextFunction) => {
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
});

export default router;
