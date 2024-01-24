import * as express from "express";
import {
  httpResponse, ActionRequest, parsePaginationParam, validateRequest
} from "@butlerhospitality/service-sdk";
import usecase from "./usecases";
import { UpdateLabelInput } from "./usecases/update-label";
import { CreateLabelInput } from "./usecases/create-label";

const router = express.Router();

router.post(
  "/api/menu/labels",
  validateRequest(CreateLabelInput),
  async (req: ActionRequest, res: express.Response, next: express.NextFunction) => {
    try {
      const data = await usecase({
        conn: req.conn,
        tenant: req.tenant,
        validate: !req.isValid
      }).createLabel(req.body);

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
  "/api/menu/labels",
  async (req: ActionRequest, res: express.Response, next: express.NextFunction) => {
    try {
      const [data, count] = await usecase({
        conn: req.conn,
        tenant: req.tenant,
        validate: !req.isValid
      }).listLabels({ ...parsePaginationParam(req.query), name: req.query.name?.toString() });

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
  "/api/menu/labels/:id",
  async (req: ActionRequest, res: express.Response, next: express.NextFunction) => {
    try {
      const data = await usecase({
        conn: req.conn,
        tenant: req.tenant,
        validate: !req.isValid
      }).getLabel(Number(req.params.id));

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
  "/api/menu/labels/:id",
  validateRequest(UpdateLabelInput),
  async (req: ActionRequest, res: express.Response, next: express.NextFunction) => {
    try {
      const data = await usecase({
        conn: req.conn,
        tenant: req.tenant,
        validate: !req.isValid
      }).updateLabel(Number(req.params.id), req.body);
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
  "/api/menu/labels/:id",
  async (req: ActionRequest, res: express.Response, next: express.NextFunction) => {
    try {
      const result = await usecase({
        conn: req.conn,
        tenant: req.tenant,
        validate: !req.isValid
      }).deleteLabel(Number(req.params.id));

      return res.send({ result });
    } catch (e) {
      next(e);
    }
  }
);

export default router;
