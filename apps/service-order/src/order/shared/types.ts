import { ICreateOrderInput } from "../usecases/create-order";
import { IUpdateOrderInput } from "../usecases/update-order";

export type OrderInput = ICreateOrderInput | IUpdateOrderInput;
