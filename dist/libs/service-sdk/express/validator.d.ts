import { NextFunction, Response } from "express";
import { ActionRequest } from "../authorizer";
export declare const validateRequest: (validationClass: any) => (req: ActionRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const validate: (validationClass: any, payload: any, exec?: boolean) => Promise<void>;
export declare const lazyValidateRequest: (validationClass: any, data: any) => Promise<void>;
