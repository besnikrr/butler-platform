import { IDefaultUsecaseDependency } from "@butlerhospitality/shared";
import createLabel, { ICreateLabelInput } from "./create-label";
import getLabel from "./get-label";
import Label, { ILabel } from "../entities/label";
import { ILabelRepository } from "../repository";
import listLabels, { LabelFilter } from "./list-labels";
import updateLabel, { IUpdateLabelInput } from "./update-label";
import deleteLabel from "./delete-label";
import Product from "../../product/entities/product";
import { IProductRepository } from "../../product/repository";

export interface LabelUsecases {
  createLabel(data: ICreateLabelInput): Promise<ILabel>;
  getLabel(id: number): Promise<ILabel>,
  listLabels(filters: LabelFilter): Promise<[ILabel[], number]>
  updateLabel(id: number, data: IUpdateLabelInput): Promise<ILabel>
  deleteLabel(id: number): Promise<ILabel>
}

export default (dependency: IDefaultUsecaseDependency): LabelUsecases => {
  const { conn } = dependency;
  const labelRepository = conn.em.getRepository(Label) as ILabelRepository;
  const productRepository = conn.em.getRepository(Product) as IProductRepository;
  return {
    createLabel: createLabel({ labelRepository }),
    getLabel: getLabel({ labelRepository }),
    listLabels: listLabels({ labelRepository }),
    updateLabel: updateLabel({ labelRepository }),
    deleteLabel: deleteLabel({ labelRepository, productRepository })
  };
};
