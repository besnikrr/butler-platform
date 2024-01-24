
import * as express from "express";
import {
  ActionRequest, validateRequest, httpResponse, parsePaginationParam
} from "@butlerhospitality/service-sdk";
import usecase from "./usecases";
import { CreateHotelInput } from "./usecases/create-hotel";
import { UpdateHotelInput } from "./usecases/update-hotel";

const router = express.Router();

router.get(
  "",
  async (req: ActionRequest, res: express.Response, next: express.NextFunction) => {
    try {
      const [data, count] = await usecase({
        conn: req.conn,
        tenant: req.tenant,
        validate: false
      }).listHotels({
        ...parsePaginationParam(req.query),
        account_manager: Number(req.query.account_manager),
        name: req.query.name as string,
        hub_ids: req.query.hub_ids as string[],
        statuses: req.query.statuses as string[],
        web_code: req.query.web_code as string
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

router.get(
  "/:id",
  async (req: ActionRequest, res: express.Response, next: express.NextFunction) => {
    try {
      const data = await usecase({
        conn: req.conn,
        tenant: req.tenant,
        validate: false
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

router.post(
  "",
  validateRequest(CreateHotelInput),
  async (req: ActionRequest, res: express.Response, next: express.NextFunction) => {
    try {
      const data = await usecase({
        conn: req.conn,
        tenant: req.tenant,
        validate: !req.isValid
      }).createHotel(req.body);
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

router.patch(
  "/:id",
  validateRequest(UpdateHotelInput),
  async (req: ActionRequest, res: express.Response, next: express.NextFunction) => {
    try {
      const { body } = req;
      const { id } = req.params;
      const data = await usecase({
        conn: req.conn,
        tenant: req.tenant,
        validate: !req.isValid
      }).updateHotel(Number(id), body);
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
  "/:id",
  async (req: ActionRequest, res: express.Response, next: express.NextFunction) => {
    try {
      const data = await usecase({
        conn: req.conn,
        tenant: req.tenant,
        validate: false
      }).deleteHotel(Number(req.params.id));
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

router.patch(
  "/status/:id",
  async (req: ActionRequest, res: express.Response, next: express.NextFunction) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const data = await usecase({
        conn: req.conn,
        tenant: req.tenant,
        validate: !req.isValid
      }).changeStatusHotel(Number(id), status);
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
