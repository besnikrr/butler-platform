import * as express from "express";
import {
  httpResponse, parsePaginationParam, validateRequest, ActionRequest
} from "@butlerhospitality/service-sdk";
import usecase from "./usecases";
import { CreateModifierInput } from "./usecases/create-modifier";
import { UpdateModifierInput } from "./usecases/update-modifier";

const router = express.Router();

router.get(
  "/api/menu/modifiers",
  async (req: ActionRequest, res: express.Response, next: express.NextFunction) => {
    try {
      const [data, count] = await usecase({
        conn: req.conn,
        tenant: req.tenant,
        validate: !req.isValid
      }).listModifiers({
        ...parsePaginationParam(req.query),
        name: req.query.name?.toString()
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
  "/api/menu/modifiers/:id",
  async (req: ActionRequest, res: express.Response, next: express.NextFunction) => {
    try {
      const data = await usecase({
        conn: req.conn,
        tenant: req.tenant,
        validate: !req.isValid
      }).getModifier(Number(req.params.id));
      res.send(
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
  "/api/menu/modifiers",
  validateRequest(CreateModifierInput),
  async (req: ActionRequest, res: express.Response, next: express.NextFunction) => {
    try {
      const data = await usecase({
        conn: req.conn,
        tenant: req.tenant,
        validate: !req.isValid
      }).createModifier(req.body);
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
  "/api/menu/modifiers/:id",
  validateRequest(UpdateModifierInput),
  async (req: ActionRequest, res: express.Response, next: express.NextFunction) => {
    try {
      const data = await usecase({
        conn: req.conn,
        tenant: req.tenant,
        validate: !req.isValid
      }).updateModifier(Number(req.params.id), req.body);
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
  "/api/menu/modifiers/:id",
  async (req: ActionRequest, res: express.Response, next: express.NextFunction) => {
    try {
      const result = await usecase({
        conn: req.conn,
        tenant: req.tenant,
        validate: !req.isValid
      }).deleteModifier(Number(req.params.id));

      return res.send({ result });
    } catch (e) {
      next(e);
    }
  }
);

export default router;
