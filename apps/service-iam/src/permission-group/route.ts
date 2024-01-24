
import * as express from "express";
import {
  httpResponse, parsePaginationParam, validateRequest, ActionRequest
} from "@butlerhospitality/service-sdk";
import usecase from "./usecases";
import { CreatePermissionGroupInput } from "./usecases/create-permission-group";
import { UpdatePermissionGroupInput } from "./usecases/update-permission-group";

const router = express.Router();

router.post(
  "/",
  validateRequest(CreatePermissionGroupInput),
  async (req: ActionRequest, res: express.Response, next: express.NextFunction) => {
    try {
      const data = await usecase({
        conn: req.conn,
        validate: !req.isValid,
        tenant: req.tenant
      }).createPermissionGroup(req.body);
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
      }).getPermissionGroup(Number(req.params.id));
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

router.get("/", async (req: ActionRequest, res: express.Response, next: express.NextFunction) => {
  try {
    const [data, count] = await usecase({
      conn: req.conn,
      validate: !req.isValid,
      tenant: req.tenant
    }).listPermissionGroups({
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
});

router.put(
  "/:id",
  validateRequest(UpdatePermissionGroupInput),
  async (req: ActionRequest, res: express.Response, next: express.NextFunction) => {
    try {
      const data = await usecase({
        conn: req.conn,
        validate: !req.isValid,
        tenant: req.tenant
      }).updatePermissionGroup(Number(req.params.id), req.body);
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
      }).deletePermissionGroup(Number(req.params.id));
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
