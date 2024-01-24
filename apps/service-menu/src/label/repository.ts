import { CustomEntityRepository } from "@butlerhospitality/service-sdk";
import Label from "./entities/label";

export interface ILabelRepository extends CustomEntityRepository<Label> { }
export class LabelRepository extends CustomEntityRepository<Label> implements ILabelRepository { }
