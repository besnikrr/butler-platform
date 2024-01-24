import { eventProvider } from "@butlerhospitality/service-sdk";
import { MODIFIER_EVENT, ENTITY, SNS_TOPIC } from "@butlerhospitality/shared";
import { IProductRepository } from "../../product/repository";
import { ILabel } from "../entities/label";
import { ILabelRepository } from "../repository";

export interface IDeleteLabelDependency {
  labelRepository: ILabelRepository;
  productRepository: IProductRepository
}

export default (dependency: IDeleteLabelDependency) => {
  const { labelRepository, productRepository } = dependency;
  return async (id: number): Promise<ILabel> => {
    const label = await labelRepository.getOneEntityOrFail(id);
    const products = await productRepository.find({ labels: label }, { populate: ["labels"] });
    for (const product of products) {
      product.labels.remove(label);
    }
    await labelRepository.softDelete(id);

    await eventProvider.client().publish<{ id: number; entity: string }>(
      SNS_TOPIC.MENU.MODIFIER, MODIFIER_EVENT.DELETED, null, {
        id,
        entity: ENTITY.MENU.MODIFIER
      }
    );

    return label;
  };
};
