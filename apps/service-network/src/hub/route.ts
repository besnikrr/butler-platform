
import * as express from "express";
import {
  ActionRequest, httpResponse, parsePaginationParam, validateRequest
} from "@butlerhospitality/service-sdk";
import usecase from "./usecases";
import { CreateHubInput } from "./usecases/create-hub";
import { UpdateHubInput } from "./usecases/update-hub";

const router = express.Router();

router.get(
  "",
  async (req: ActionRequest, res: express.Response, next: express.NextFunction) => {
    try {
      const [data, count] = await usecase({
        conn: req.conn,
        tenant: req.tenant,
        validate: !req.isValid
      }).listHubs({
        ...parsePaginationParam(req.query),
        name: req.query.name as string,
        city_ids: req.query.city_ids as string[],
        statuses: req.query.statuses as string[]
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
        validate: !req.isValid
      }).getHub(Number(req.params.id));
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
  validateRequest(CreateHubInput),
  async (req: ActionRequest, res: express.Response, next: express.NextFunction) => {
    try {
      const { body } = req;
      const data = await usecase({
        conn: req.conn,
        tenant: req.tenant,
        validate: !req.isValid
      }).createHub(body);
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
  validateRequest(UpdateHubInput),
  async (req: ActionRequest, res: express.Response, next: express.NextFunction) => {
    try {
      const { body } = req;
      const { id } = req.params;
      const data = await usecase({
        conn: req.conn,
        tenant: req.tenant,
        validate: !req.isValid
      }).updateHub(Number(id), body);
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
        validate: !req.isValid
      }).deleteHub(Number(req.params.id));
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
      }).changeStatusHub(Number(id), status);
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
  "/reassign-hotels/:id",
  async (req: ActionRequest, res: express.Response, next: express.NextFunction) => {
    try {
      const { id } = req.params;
      const payload = await usecase({
        conn: req.conn,
        tenant: req.tenant,
        validate: !req.isValid
      }).reassignHubHotels(req.body, Number(id));
      return res.send(
        httpResponse({
          payload
        })
      );
    } catch (e) {
      next(e);
    }
  }
);

export default router;
