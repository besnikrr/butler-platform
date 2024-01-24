
import {
  ActionRequest, httpResponse, parsePaginationParam, validateRequest
} from "@butlerhospitality/service-sdk";
import * as express from "express";

import usecase from "./usecases";
import { AssignMenuHotelsInput } from "./usecases/assign-menu-hotels";
import { BatchUpdateMenuInput } from "./usecases/batch-update-menus";
import { CreateMenuInput } from "./usecases/create-menu";
import { UpdateMenuInput } from "./usecases/update-menu";

const router = express.Router();

router.get(
  "/api/menu",
  async (req: ActionRequest, res: express.Response, next: express.NextFunction) => {
    try {
      const name = req.query.name as string;
      const hotelIds = req.query.hotelIds as string[];

      const [data, count] = await usecase({
        conn: req.conn,
        tenant: req.tenant,
        validate: !req.isValid
      }).listMenu({
        ...parsePaginationParam(req.query),
        name,
        hotelIds: hotelIds ? hotelIds.map((a) => +a) : []
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
  "/api/menu/:id",
  async (req: ActionRequest, res: express.Response, next: express.NextFunction) => {
    try {
      const data = await usecase({
        conn: req.conn,
        tenant: req.tenant,
        validate: !req.isValid
      }).getMenu(Number(req.params.id), !!req.query.formatted);

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

router.get(
  "/api/menu/:id/hotels",
  async (req: ActionRequest, res: express.Response, next: express.NextFunction) => {
    try {
      const data = await usecase({
        conn: req.conn,
        tenant: req.tenant,
        validate: !req.isValid
      }).listMenuHotels(Number(req.params.id));

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
  "/api/menu/hotel/:id",
  async (req: ActionRequest, res: express.Response, next: express.NextFunction) => {
    try {
      const data = await usecase({
        conn: req.conn,
        tenant: req.tenant,
        validate: !req.isValid
      }).getHotelMenu(Number(req.params.id), !!req.query.formatted);

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
  "/api/menu",
  validateRequest(CreateMenuInput),
  async (req: ActionRequest, res: express.Response, next: express.NextFunction) => {
    try {
      const data = await usecase({
        conn: req.conn,
        tenant: req.tenant,
        validate: !req.isValid
      }).createMenu(req.body);

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

router.put(
  "/api/menu/:id",
  validateRequest(UpdateMenuInput),
  async (req: ActionRequest, res: express.Response, next: express.NextFunction) => {
    try {
      const data = await usecase({
        conn: req.conn,
        tenant: req.tenant,
        validate: !req.isValid
      }).updateMenu(Number(req.params.id), req.body);

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
  "/api/menu/:id/hotels",
  validateRequest(AssignMenuHotelsInput),
  async (req: ActionRequest, res: express.Response, next: express.NextFunction) => {
    try {
      const data = await usecase({
        conn: req.conn,
        tenant: req.tenant,
        validate: !req.isValid
      }).assignMenuHotels(Number(req.params.id), req.body);

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
  "/api/menu/duplicate/:id",
  async (req: ActionRequest, res: express.Response, next: express.NextFunction) => {
    try {
      const data = await usecase({
        conn: req.conn,
        tenant: req.tenant,
        validate: !req.isValid
      }).duplicateMenu(Number(req.params.id));

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
  "/api/menu/batch-edit",
  validateRequest(BatchUpdateMenuInput),
  async (req: ActionRequest, res: express.Response, next: express.NextFunction) => {
    try {
      const data = await usecase({
        conn: req.conn,
        tenant: req.tenant,
        validate: !req.isValid
      }).batchUpdateMenus(req.body);

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
  "/api/menu/:id/push-production",
  async (req: ActionRequest, res: express.Response, next: express.NextFunction) => {
    try {
      const data = await usecase({
        conn: req.conn,
        tenant: req.tenant,
        validate: !req.isValid
      }).pushMenuToProduction(Number(req.params.id));

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

router.delete(
  "/api/menu/:id",
  async (req: ActionRequest, res: express.Response, next: express.NextFunction) => {
    try {
      const result = await usecase({
        conn: req.conn,
        tenant: req.tenant,
        validate: !req.isValid
      }).deleteMenu(Number(req.params.id));

      return res.send({ result });
    } catch (e) {
      next(e);
    }
  }
);

export default router;
