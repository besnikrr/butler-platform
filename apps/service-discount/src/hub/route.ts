
import * as express from "express";
import {
  ActionRequest
} from "@butlerhospitality/service-sdk";

const router = express.Router();

router.get("/api/discount/hub/:id", async (req: ActionRequest, res, next: express.NextFunction) => {

});

export default router;
