
import * as express from "express";
import {
  ActionRequest, httpResponse, parsePaginationParam, validateRequest
} from "@butlerhospitality/service-sdk";
import usecase from "./usecases";
import { CreateProgramInput } from "./usecases/create-program";
import { UpdateProgramInput } from "./usecases/update-program";
import { IHotelProgramFilter } from "./usecases/get-programs-by-hotel";
import { ProgramStatus } from "./entities/program";
import { EditStatusInput } from "./usecases/batch-edit-status";
import { VoucherType } from "@butlerhospitality/shared";

const router = express.Router();

router.get(
  "/api/voucher/programs/:id",
  async (req: ActionRequest, res, next: express.NextFunction) => {
    try {
      const data = await usecase({
        conn: req.conn,
        validate: false,
        tenant: req.tenant
      }).getSingle(Number(req.params.id));
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

router.get("/api/voucher/programs/hotel/:id", async (req: ActionRequest, res, next: express.NextFunction) => {
  try {
    let types: string[];
    let statuses: string[];

    if (Array.isArray(req.query.types) && req.query.types.length) {
      types = req.query.types as string[];
    }
    if (Array.isArray(req.query.statuses) && req.query.statuses.length) {
      statuses = req.query.statuses as string[];
    }

    const filters: IHotelProgramFilter = {
      programTypes: types && types.map((type: string) => VoucherType[type]),
      programName: req.query.name as string,
      statuses: statuses && statuses.map((status: string) => ProgramStatus[status]),
      populate: req.query.populate && ([req.query.populate] as string[]),
      ...parsePaginationParam(req.query)
    };

    const [data, count] = await usecase({ conn: req.conn, validate: false, tenant: req.tenant }).getMultipleByHotel(
      filters,
      Number(req.params.id)
    );
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
});

router.post(
  "/api/voucher/programs",
  validateRequest(CreateProgramInput),
  async (req: ActionRequest, res, next: express.NextFunction) => {
    try {
      const data = await usecase({
        conn: req.conn,
        validate: false,
        tenant: req.tenant
      }).create(req.body);
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

router.post(
  "/api/voucher/programs/batch-edit-status",
  validateRequest(EditStatusInput),
  async (req: ActionRequest, res, next: express.NextFunction) => {
    try {
      const data = await usecase({ conn: req.conn, validate: false, tenant: req.tenant }).batchEditStatus(req.body);
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

router.put(
  "/api/voucher/programs/:id",
  validateRequest(UpdateProgramInput),
  async (req: ActionRequest, res, next: express.NextFunction) => {
    try {
      const data = await usecase({
        conn: req.conn,
        validate: false,
        tenant: req.tenant
      }).update(Number(req.params.id), req.body);
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

router.delete(
  "/api/voucher/programs/:id",
  async (req: ActionRequest, res, next: express.NextFunction) => {
    try {
      const data = await usecase({
        conn: req.conn,
        validate: false,
        tenant: req.tenant
      }).deleteProgram(Number(req.params.id));
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
