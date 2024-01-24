import { MikroORM } from "@mikro-orm/core";
import { EntityManager } from "@mikro-orm/postgresql";
import { Order } from "../entity";
import { OrderStatus } from "../shared/enums";

export interface IListHubsWithOrderCountDependency {
  conn: MikroORM;
}

export interface IListHubsWithOrderCountInput {
  hubIds?: string[];
}

interface IHubWithOrderCount {
  hubId: number,
  hubName: string,
  count: number
}

interface IStatusWithOrderCount {
  status: OrderStatus,
  count: number
}

export interface IListHubsWithOrderCountOutput {
  hubs: IHubWithOrderCount[]
  statuses: IStatusWithOrderCount[]
}

interface IHubsWithOrdersCountByStatusInterface {
  status: OrderStatus,
  hub_id: number,
  hub_name: string,
  count: string,
  status_count: string
}

const formatResponse = (hubsWithOrdersCountByStatus: IHubsWithOrdersCountByStatusInterface[]) => {
  const hubs: IHubWithOrderCount[] = [];
  const statusKeys = Object.keys(OrderStatus);
  const statuses: IStatusWithOrderCount[] = statusKeys.map((key) => ({
    status: OrderStatus[key],
    count: 0
  }));

  hubsWithOrdersCountByStatus.forEach((hub) => {
    const foundHubIndex = hubs.findIndex((h) => h.hubId === hub.hub_id);
    const foundStatusIndex = statuses.findIndex((s) => s.status === hub.status);
    if (foundHubIndex === -1) {
      hubs.push({ hubId: hub.hub_id, hubName: hub.hub_name, count: parseInt(hub.count) });
    } else {
      hubs[foundHubIndex].count = hubs[foundHubIndex].count + parseInt(hub.count);
    }

    if (foundStatusIndex !== -1) {
      statuses[foundStatusIndex].count =
        statuses[foundStatusIndex].count + parseInt(hub.status_count);
    }
  });

  return {
    hubs,
    statuses
  };
};

export default (dependency: IListHubsWithOrderCountDependency) =>
  async (input: IListHubsWithOrderCountInput): Promise<IListHubsWithOrderCountOutput> => {
    const hubsWithOrdersCountByStatus = await (dependency.conn.em as EntityManager).createQueryBuilder(Order, "o")
      .select(["m.hub_id", "m.hub_name", "o.status", "COUNT(m.hub_id)", "COUNT(o.status) as status_count"])
      .where({
        ...(input.hubIds && {
          "m.hub_id": {
            $in: input.hubIds
          }
        })
      })
      .andWhere({
        "o.status": OrderStatus.SCHEDULED
      })
      .orWhere({
        ...(input.hubIds && {
          "m.hub_id": {
            $in: input.hubIds
          }
        }),
        "o.status": {
          $nin: [
            OrderStatus.SCHEDULED,
            OrderStatus.CONFIRMATION,
            OrderStatus.DELIVERED,
            OrderStatus.CANCELLED,
            OrderStatus.REJECTED,
            OrderStatus.MERGED
          ]
        },
        "created_at": {
          $gte: new Date(new Date().setUTCHours(0, 0, 0, 0)),
          $lte: new Date(new Date().setUTCHours(23, 59, 59, 999))
        }
      })
      .join("meta", "m")
      .groupBy(["m.hub_id", "m.hub_name", "o.status"])
      .execute();

    return formatResponse(hubsWithOrdersCountByStatus);
  };
