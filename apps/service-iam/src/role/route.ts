
import * as express from "express";
import {
  httpResponse, parsePaginationParam, validateRequest, ActionRequest
} from "@butlerhospitality/service-sdk";
import usecase from "./usecases";
import { CreateRoleInput } from "./usecases/create-role";
import { UpdateRoleInput } from "./usecases/update-role";

const router = express.Router();

router.post(
  "",
  validateRequest(CreateRoleInput),
  async (req: ActionRequest, res: express.Response, next: express.NextFunction) => {
    try {
      const data = await usecase({
        conn: req.conn,
        validate: !req.isValid,
        tenant: req.tenant
      }).createRole(req.body);
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
  "/:id",
  async (req: ActionRequest, res: express.Response, next: express.NextFunction) => {
    try {
      const data = await usecase({
        conn: req.conn,
        validate: !req.isValid,
        tenant: req.tenant
      }).getRole(Number(req.params.id));
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
  "",
  async (req: ActionRequest, res: express.Response, next: express.NextFunction) => {
    try {
      const [data, count] = await usecase({
        conn: req.conn,
        validate: !req.isValid,
        tenant: req.tenant
      }).listRoles({
        ...parsePaginationParam(req.query),
        search: req.query.search?.toString()
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

router.put(
  "/:id",
  validateRequest(UpdateRoleInput),
  async (req: ActionRequest, res: express.Response, next: express.NextFunction) => {
    try {
      const data = await usecase({
        conn: req.conn,
        validate: !req.isValid,
        tenant: req.tenant
      }).updateRole(Number(req.params.id), req.body);
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
        validate: !req.isValid,
        tenant: req.tenant
      }).deleteRole(Number(req.params.id));
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
