import { OrderStatus } from "../shared/enums";
import { IListOrdersDependency, IListOrdersFilterDependency, IListOrdersOutput } from "./list-orders";

export default (dependency: IListOrdersDependency) =>
  async (filters: IListOrdersFilterDependency): Promise<[IListOrdersOutput[], number]> => {
    const filtersDashboard = {
      ...filters.orderFilters,
      $and: [
        {
          $or: [
            {
              status: OrderStatus.SCHEDULED
            },
            {
              status: {
                $nin: [
                  OrderStatus.SCHEDULED,
                  OrderStatus.CONFIRMATION,
                  OrderStatus.DELIVERED,
                  OrderStatus.CANCELLED,
                  OrderStatus.REJECTED,
                  OrderStatus.MERGED
                ]
              },
              created_at: {
                $gte: new Date(new Date().setUTCHours(0, 0, 0, 0)),
                $lte: new Date(new Date().setUTCHours(23, 59, 59, 999))
              }
            }
          ]
        }
      ]
    };

    if (filters.originalFilters?.search) {
      const search = filters.originalFilters?.search;

      filtersDashboard.$or = [
        {
          client: {
            name: { $ilike: `%${search}%` }
          }
        },
        {
          client: {
            phoneNumber: { $ilike: `%${search}%` }
          }
        },
        {
          meta: {
            roomNumber: { $ilike: `%${search}%` }
          }
        },
        {
          vouchers: {
            code: { $ilike: `%${search}%` }
          }
        }
      ];
    }
    return dependency.orderRepository.getOrdersForDashboard(filtersDashboard);
  };
