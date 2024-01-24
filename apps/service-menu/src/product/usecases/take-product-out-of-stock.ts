/* eslint-disable max-classes-per-file */
import { IsArray, IsInt, IsNotEmpty, IsNumber, IsOptional, Min, ValidateIf, ValidateNested } from "class-validator";
import { Type } from "class-transformer";
import { PRODUCT_EVENT } from "@butlerhospitality/shared";
import { eventProvider } from "@butlerhospitality/service-sdk";
import { ENTITY, SNS_TOPIC } from "@butlerhospitality/shared";
import { IOutOfStockRepository } from "../repository";
import OutOfStock, { IOutOfStockPublish } from "../entities/out-of-stock";
import { IHubRepository } from "../../hub/repository";

interface IOutOfStockHubInput {
  hub_id: number;
  days?: number;
  hours?: number;
}

export class OutOfStockHubInput implements IOutOfStockHubInput {
  @IsNumber()
  @IsNotEmpty()
  hub_id: number;

  @IsNumber()
  @ValidateIf((o) => !o.hours || o.days)
  @IsOptional()
  @Min(0)
  days?: number;

  @IsInt()
  @ValidateIf((o) => !o.days || o.hours)
  @IsOptional()
  @Min(0)
  hours?: number;
}

export interface IOutOfStockInput {
  hubs: IOutOfStockHubInput[];
}
export class OutOfStockInput implements IOutOfStockInput {
  @IsArray()
  @IsNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => OutOfStockHubInput)
  hubs: IOutOfStockHubInput[];
}

export interface ITakeProductOutOfStockDependency {
  outOfStockRepository: IOutOfStockRepository;
  hubRepository: IHubRepository;
}

export default (dependency: ITakeProductOutOfStockDependency) => {
  const { outOfStockRepository, hubRepository } = dependency;
  return async (id: number, { hubs }: IOutOfStockInput): Promise<OutOfStock[]> => {
    await hubRepository.getEntitiesOrFailIfNotFound(hubs.map((item) => item.hub_id));

    const itemsToInsert = hubs.map((item) => {
      const availableAt = new Date();
      availableAt.setDate(availableAt.getDate() + (item.days || 0));
      availableAt.setHours(availableAt.getHours() + (item.hours || 0));

      return outOfStockRepository.create({
        product_id: id,
        hub_id: item.hub_id,
        available_at: availableAt
      });
    });

    const previousRecords = await outOfStockRepository.find({
      product: id
    });

    await outOfStockRepository.softDelete(previousRecords.map((a) => a.id));
    await outOfStockRepository.persistAndFlush(itemsToInsert);

    const eventData = previousRecords
      .map((element) => {
        return {
          id: element.id,
          entity: ENTITY.MENU.OUT_OF_STOCK
        };
      })
      .concat(
        itemsToInsert.map((element) => {
          return {
            id: element.id,
            entity: ENTITY.MENU.OUT_OF_STOCK
          };
        })
      );

    await eventProvider.client()
      .publish<IOutOfStockPublish[]>(SNS_TOPIC.MENU.PRODUCT, PRODUCT_EVENT.OUT_OF_STOCK, null, eventData);

    return outOfStockRepository.populate(itemsToInsert, ["hub", "product"]);
  };
};
