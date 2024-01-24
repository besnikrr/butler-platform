
import * as express from "express";
import {
  httpResponse, parsePaginationParam, validateRequest, ActionRequest
} from "@butlerhospitality/service-sdk";
import usecase from "./usecases";
import { ChangePasswordInput } from "./usecases/change-password";
import { CreateUserInput } from "./usecases/create-user";
import { UpdateUserInput } from "./usecases/update-user";
import { ResetPasswordInput } from "./usecases/reset-password";

const router = express.Router();

router.post(
  "/",
  validateRequest(CreateUserInput),
  async (req: ActionRequest, res: express.Response, next: express.NextFunction) => {
    try {
      const data = await usecase({
        conn: req.conn,
        validate: !req.isValid,
        tenant: req.tenant
      }).createUser(req.body, req?.actionContext?.tenant);
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
      }).getUser(Number(req.params.id));
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
  "/",
  async (req: ActionRequest, res: express.Response, next: express.NextFunction) => {
    try {
      const [data, count] = await usecase({
        conn: req.conn,
        validate: !req.isValid,
        tenant: req.tenant
      }).listUsers({
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
  validateRequest(UpdateUserInput),
  async (req: ActionRequest, res: express.Response, next: express.NextFunction) => {
    try {
      const data = await usecase({
        conn: req.conn,
        validate: !req.isValid,
        tenant: req.tenant
      }).updateUser(Number(req.params.id), req.body);
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
      }).deleteUser(Number(req.params.id), req?.actionContext?.tenant);
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
  "/reset/password",
  validateRequest(ResetPasswordInput),
  async (req: ActionRequest, res: express.Response, next: express.NextFunction) => {
    try {
      const resetPasswordResponse = await usecase({
        conn: req.conn,
        validate: !req.isValid,
        tenant: req.tenant
      }).resetPassword(req?.body, req?.actionContext?.tenant);
      return res.send(
        httpResponse({
          payload: resetPasswordResponse
        })
      );
    } catch (e) {
      next(e);
    }
  }
);

router.post(
  "/init/reset/password",
  async (req: ActionRequest, res: express.Response, next: express.NextFunction) => {
    try {
      const forgotPasswordResponse = await usecase({
        conn: req.conn,
        validate: !req.isValid,
        tenant: req.tenant
      }).forgotPassword(req?.body);
      return res.send(
        httpResponse({
          payload: forgotPasswordResponse
        })
      );
    } catch (e) {
      next(e);
    }
  }
);

router.post(
  "/change/password",
  validateRequest(ChangePasswordInput),
  async (req: ActionRequest, res: express.Response, next: express.NextFunction) => {
    try {
      const data = {
        AccessToken: req?.headers?.authorization,
        PreviousPassword: req?.body?.temporaryPassword,
        ProposedPassword: req?.body?.password
      };

      const changePasswordResponse = await usecase({
        conn: req.conn,
        validate: !req.isValid,
        tenant: req.tenant
      }).changePassword(data, req?.actionContext?.tenant);
      return res.send(
        httpResponse({
          payload: changePasswordResponse
        })
      );
    } catch (e) {
      next(e);
    }
  }
);

router.get(
  "/auth/me",
  async (req: ActionRequest, res: express.Response, next: express.NextFunction) => {
    try {
      return res.send(
        httpResponse({
          payload: req.actionContext.authorizedUser
        })
      );
    } catch (e) {
      next(e);
    }
  }
);

router.post(
  "/add-to-cognito",
  async (req: ActionRequest, res: express.Response, next: express.NextFunction) => {
    try {
      const result = await usecase({
        conn: req.conn,
        validate: !req.isValid,
        tenant: req.tenant
      }).addUsersToCognito({
        ids: req?.body?.ids as number[]
      });

      return res.send(
        httpResponse({
          payload: result
        })
      );
    } catch (e) {
      next(e);
    }
  }
);

export default router;
