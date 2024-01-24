import * as express from "express";
import {
  ActionRequest,
  httpResponse,
  parsePaginationParam,
  validate,
  validateRequest
} from "@butlerhospitality/service-sdk";
import usecase from "./usecases";
import { parseOrderFilters } from "../utils/util";
import { CreateOrderInput } from "./usecases/create-order";
import { RejectOrderInput } from "./usecases/reject-order";
import { ConfirmOrderInput } from "./usecases/confirm-order";
import { IOrderFilter, ListOrderFilterValidation } from "./usecases/list-orders";
import { UpdateOrderInput } from "./usecases/update-order";
import { CancelOrderInput } from "./usecases/cancel-order";
import { DeliverOrderInput } from "./usecases/deliver-order";
import { PickupOrderInput } from "./usecases/pickup-order";
import { RefundOrderInput } from "@services/service-order/src/order/usecases/refund-order";
import { AssignOrderToFoodCarrierInput } from "./usecases/assign-food-carrier";
import { RemoveFoodCarrierInput } from "./usecases/remove-food-carrier";
import { SetKitchenConfirmedDate } from "./usecases/set-kitchen-confirmed-date";
import { AssignOrderInput } from "./usecases/assign-order-to-me";

const router = express.Router();

router.get(
  "/api/order",
  async (req: ActionRequest, res: express.Response, next: express.NextFunction) => {
    try {
      await validate(ListOrderFilterValidation, req.query);
      const [data, count] = await usecase({
        conn: req.conn,
        validate: !req.isValid,
        tenant: req.tenant
      }).listOrders({
        paginationFilters: parsePaginationParam(req.query),
        orderFilters: parseOrderFilters(req.query as unknown as IOrderFilter),
        originalFilters: req.query as unknown as IOrderFilter
      });

      res.send(
        httpResponse({
          payload: data,
          total: count
        })
      );
    } catch (e) {
      next(e);
    }
  }
);

router.get(
  "/api/order/dashboard",
  async (req: ActionRequest, res: express.Response, next: express.NextFunction) => {
    try {
      await validate(ListOrderFilterValidation, req.query);
      const [data, count] = await usecase({
        conn: req.conn,
        validate: !req.isValid,
        tenant: req.tenant
      }).listOrdersForDashboard({
        paginationFilters: parsePaginationParam(req.query),
        orderFilters: parseOrderFilters(req.query as unknown as IOrderFilter),
        originalFilters: req.query as unknown as IOrderFilter
      });

      res.send(
        httpResponse({
          payload: data,
          total: count
        })
      );
    } catch (e) {
      next(e);
    }
  }
);

router.get(
  "/api/order/:id(\\d+)",
  async (req: ActionRequest, res: express.Response, next: express.NextFunction) => {
    try {
      const data = await usecase({
        conn: req.conn,
        validate: !req.isValid,
        tenant: req.tenant
      }).getOrder(Number(req.params.id));

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
  "/api/order/list-by-hubs",
  async (req: ActionRequest, res: express.Response, next: express.NextFunction) => {
    try {
      const data = await usecase({
        conn: req.conn,
        validate: !req.isValid,
        tenant: req.tenant
      }).listHubsWithOrderCount({
        hubIds: req.query.hubIds as string[]
      });

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
  "/api/order",
  validateRequest(CreateOrderInput),
  async (req: ActionRequest, res: express.Response, next: express.NextFunction) => {
    try {
      const data = await usecase({
        conn: req.conn,
        validate: !req.isValid,
        tenant: req.tenant
      }).createOrder(req.body);

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
  "/api/order/:id",
  validateRequest(UpdateOrderInput),
  async (req: ActionRequest, res: express.Response, next: express.NextFunction) => {
    try {
      const data = await usecase({
        conn: req.conn,
        validate: !req.isValid,
        tenant: req.tenant
      }).updateOrder(Number(req.params.id), req.body);

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

router.patch(
  "/api/order/:id/confirm",
  validateRequest(ConfirmOrderInput),
  async (req: ActionRequest, res: express.Response, next: express.NextFunction) => {
    try {
      const data = await usecase({
        conn: req.conn,
        validate: !req.isValid,
        tenant: req.tenant,
        user: req.actionContext.authorizedUser
      }).confirmOrder(parseInt(req.params.id), req.body);

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

router.patch(
  "/api/order/:id/cancel",
  validateRequest(CancelOrderInput),
  async (req: ActionRequest, res: express.Response, next: express.NextFunction) => {
    try {
      const data = await usecase({
        conn: req.conn,
        validate: !req.isValid,
        tenant: req.tenant
      }).cancelOrder(parseInt(req.params.id), req.body);
      res.send(
        httpResponse({ payload: data })
      );
    } catch (error) {
      next(error);
    }
  }
);

router.patch(
  "/api/order/:id/reject",
  validateRequest(RejectOrderInput),
  async (req: ActionRequest, res: express.Response, next: express.NextFunction) => {
    try {
      const data = await usecase({
        conn: req.conn,
        validate: !req.isValid,
        tenant: req.tenant
      }).rejectOrder(parseInt(req.params.id), req.body);
      res.send(
        httpResponse({ payload: data })
      );
    } catch (error) {
      next(error);
    }
  }
);

router.patch(
  "/api/order/:id/pickup",
  validateRequest(PickupOrderInput),
  async (req: ActionRequest, res: express.Response, next: express.NextFunction) => {
    try {
      const data = await usecase({
        conn: req.conn,
        validate: !req.isValid,
        tenant: req.tenant
      }).pickupOrder(Number(req.params?.id), req.body);

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

router.patch(
  "/api/order/:id/deliver",
  validateRequest(DeliverOrderInput),
  async (req: ActionRequest, res: express.Response, next: express.NextFunction) => {
    try {
      const data = await usecase({
        conn: req.conn,
        validate: !req.isValid,
        tenant: req.tenant
      }).deliverOrder(Number(req.params.id), req.body);

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

router.patch(
  "/api/order/:id/assign-food-carrier",
  validateRequest(AssignOrderToFoodCarrierInput),
  async (req: ActionRequest, res: express.Response, next: express.NextFunction) => {
    try {
      const data = await usecase({
        conn: req.conn,
        validate: !req.isValid,
        tenant: req.tenant
      }).assignFoodCarrierToOrder(Number(req.params?.id), req.body);

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

router.patch(
  "/api/order/:id/refund",
  validateRequest(RefundOrderInput),
  async (req: ActionRequest, res: express.Response, next: express.NextFunction) => {
    try {
      const data = await usecase({
        conn: req.conn,
        validate: !req.isValid,
        tenant: req.tenant
      }).refundOrder(Number(req.params?.id), req.body);

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

router.patch(
  "/api/order/:id/remove-food-carrier",
  validateRequest(RemoveFoodCarrierInput),
  async (req: ActionRequest, res: express.Response, next: express.NextFunction) => {
    try {
      const data = await usecase({
        conn: req.conn,
        validate: !req.isValid,
        tenant: req.tenant
      }).removeFoodCarrier(Number(req.params?.id), req.body);

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

router.patch(
  "/api/order/:id/set-kitchen-confirm-date",
  validateRequest(SetKitchenConfirmedDate),
  async (req: ActionRequest, res: express.Response, next: express.NextFunction) => {
    try {
      const data = await usecase({
        conn: req.conn,
        validate: !req.isValid,
        tenant: req.tenant
      }).setKitchenConfirmedDate(Number(req.params?.id), req.body);

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

router.patch(
  "/api/order/:id/assign-order-to-me",
  validateRequest(AssignOrderInput),
  async (req: ActionRequest, res: express.Response, next: express.NextFunction) => {
    try {
      const data = await usecase({
        conn: req.conn,
        validate: !req.isValid,
        tenant: req.tenant,
        user: req.actionContext.authorizedUser
      }).assignOrderToMe(Number(req.params?.id), req.body);
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

export default router;
