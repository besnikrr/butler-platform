
import * as express from "express";
import {
  ActionRequest, BadRequestError, httpResponse,
  parsePaginationParam, validateRequest
} from "@butlerhospitality/service-sdk";
import usecase from "./usecases";
import { CreateCategoryInput } from "./usecases/create-category";
import { UpdateCategoryInput } from "./usecases/update-category";
import { CategoryType } from "./usecases/list-categories";

const router = express.Router();

const validateCategoryTypeAndReturn = (type) => {
  if (type.length > 2) {
    throw new BadRequestError("Type can not contain more than two elements");
  }
  type.forEach((t: CategoryType) => {
    if (!CategoryType[t]) {
      throw new BadRequestError("Invalid type. Valid types are category and subcategory");
    }
  });
  return { type };
};

router.get(
  "/api/menu/categories",
  async (req: ActionRequest, res: express.Response, next: express.NextFunction) => {
    try {
      const [data, count] = await usecase({
        conn: req.conn,
        tenant: req.tenant,
        validate: !req.isValid
      }).listCategories({
        ...parsePaginationParam(req.query),
        grouped: Boolean(req.query.grouped),
        name: req.query.name?.toString(),
        ...(req.query?.type &&
          Array.isArray(req.query.type) && validateCategoryTypeAndReturn(req.query?.type))
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
  "/api/menu/categories/:id",
  async (req: ActionRequest, res: express.Response, next: express.NextFunction) => {
    try {
      const data = await usecase({
        conn: req.conn,
        tenant: req.tenant,
        validate: !req.isValid
      }).getCategory(Number(req.params.id));

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
  "/api/menu/categories/:id/relations",
  async (req: ActionRequest, res: express.Response, next: express.NextFunction) => {
    try {
      const data = await usecase({
        conn: req.conn,
        tenant: req.tenant,
        validate: !req.isValid
      }).getCategoryRelations(Number(req.params.id));

      return res.send(data);
    } catch (e) {
      next(e);
    }
  }
);

router.post(
  "/api/menu/categories",
  validateRequest(CreateCategoryInput),
  async (req: ActionRequest, res: express.Response, next: express.NextFunction) => {
    try {
      const data = await usecase({
        conn: req.conn,
        tenant: req.tenant,
        validate: !req.isValid
      }).createCategory(req.body);
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
  "/api/menu/categories/:id",
  validateRequest(UpdateCategoryInput),
  async (req: ActionRequest, res: express.Response, next: express.NextFunction) => {
    try {
      const data = await usecase({
        conn: req.conn,
        tenant: req.tenant,
        validate: !req.isValid
      }).updateCategory(Number(req.params.id), req.body);
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
  "/api/menu/categories/:id",
  async (req: ActionRequest, res: express.Response, next: express.NextFunction) => {
    try {
      const data = await usecase({
        conn: req.conn,
        tenant: req.tenant,
        validate: !req.isValid
      }).deleteCategory(Number(req.params.id));
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
