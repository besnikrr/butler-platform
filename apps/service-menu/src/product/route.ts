
import * as express from "express";
import {
  NewUploadService,
  HttpStatusCode,
  ActionRequest,
  httpResponse,
  parsePaginationParam,
  validateRequest,
  BadRequestError,
  lazyValidateRequest
} from "@butlerhospitality/service-sdk";
import usecase from "./usecases";
import { parseCategorizedItems } from "../utils/util";
import { CreateProductInput } from "./usecases/create-product";
import { OutOfStockInput } from "./usecases/take-product-out-of-stock";
import {
  ProductUpdateType,
  UpdateProductCategoriesInput,
  UpdateProductInformationInput,
  UpdateProductLabelsInput,
  UpdateProductModifiersInput
} from "./usecases/update-product";
import { BatchEditProductStatusInput } from "./usecases/batch-edit-status";

const uploader = NewUploadService();
const router = express.Router();

router.get(
  "/api/menu/products/upload/presign-url",
  async (req: any, res, next: express.NextFunction) => {
    try {
      const [url, imagekey] = await uploader.getPresignedURL(process.env.MENU_BUCKET, req.query.imagekey);
      if (url) {
        return res.send({
          url,
          imagekey
        });
      }
      return res.status(HttpStatusCode.CONFLICT).send({
        message: "Could not generate presigned url"
      });
    } catch (e) {
      next(e);
    }
  }
);

router.get(
  "/api/menu/products",
  async (req: ActionRequest, res, next: express.NextFunction) => {
    try {
      const [data, count] = await usecase({
        conn: req.conn,
        tenant: req.tenant,
        validate: !req.isValid
      }).listProducts({
        ...parsePaginationParam(req.query),
        categorized: Boolean(req.query.categorized),
        name: req.query.name?.toString()
      });

      if (req.query.categorized) {
        const parsedData = parseCategorizedItems(data);
        return res.send(
          httpResponse({
            payload: parsedData,
            total: Object.keys(parsedData).length,
            nextPage: req.query.page ? Number(req.query.page) + 1 : 1
          })
        );
      }

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
  "/api/menu/products/:id",
  async (req: ActionRequest, res, next: express.NextFunction) => {
    try {
      const data = await usecase({
        conn: req.conn,
        tenant: req.tenant,
        validate: !req.isValid
      }).getProduct(Number(req.params.id));

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
  "/api/menu/products/:id/relations",
  async (req: ActionRequest, res, next: express.NextFunction) => {
    try {
      const data = await usecase({
        conn: req.conn,
        tenant: req.tenant,
        validate: !req.isValid
      }).listProductRelations(Number(req.params.id));

      res.send(data);
    } catch (e) {
      next(e);
    }
  }
);

router.post(
  "/api/menu/products",
  validateRequest(CreateProductInput),
  async (req: ActionRequest, res, next: express.NextFunction) => {
    try {
      const { image } = req.body;

      if (!image) {
        return res.status(HttpStatusCode.BAD_REQUEST).send({ message: "No image key sent" });
      }

      const uploaded = await uploader.uploadimage(process.env.MENU_BUCKET, image);
      if (!uploaded) {
        return res.status(HttpStatusCode.BAD_REQUEST).send({
          error: true,
          message: "Image upload failed"
        });
      }

      const result = await usecase({
        conn: req.conn,
        tenant: req.tenant,
        validate: !req.isValid
      }).createProduct(req.body);
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

router.put(
  "/api/menu/products/type/:type/:id",
  async (req: ActionRequest, res, next: express.NextFunction) => {
    try {
      switch (req.params.type) {
      case ProductUpdateType.GENERAL_INFORMATION:
        await lazyValidateRequest(UpdateProductInformationInput, req.body);
        break;
      case ProductUpdateType.CATEGORIES:
        await lazyValidateRequest(UpdateProductCategoriesInput, req.body);
        break;
      case ProductUpdateType.MODIFIERS:
        await lazyValidateRequest(UpdateProductModifiersInput, req.body);
        break;
      case ProductUpdateType.LABELS:
        await lazyValidateRequest(UpdateProductLabelsInput, req.body);
        break;
      default:
        next(new BadRequestError(`Wrong product update type provided: ${req.params.type}`));
      }

      const data = await usecase({
        conn: req.conn,
        tenant: req.tenant,
        validate: !req.isValid
      }).updateProduct(Number(req.params.id), req.params.type, req.body);

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
  "/api/menu/products/:id",
  async (req: ActionRequest, res, next: express.NextFunction) => {
    try {
      const data = await usecase({
        conn: req.conn,
        tenant: req.tenant,
        validate: !req.isValid
      }).deleteProduct(Number(req.params.id));
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
  "/api/menu/products/:id/out-of-stock",
  validateRequest(OutOfStockInput),
  async (req: ActionRequest, res, next: express.NextFunction) => {
    try {
      const data = await usecase({
        conn: req.conn,
        tenant: req.tenant,
        validate: !req.isValid
      }).takeProductOutOfStock(Number(req.params.id), req.body);
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
  "/api/menu/products/batch-edit-status",
  validateRequest(BatchEditProductStatusInput),
  async (req: ActionRequest, res, next: express.NextFunction) => {
    try {
      const data = await usecase({
        conn: req.conn,
        validate: !req.isValid,
        tenant: req.tenant
      }).batchEditProductStatus(req.body);
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
