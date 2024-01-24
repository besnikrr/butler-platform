import { getOrderConnection } from "../../utils/util";
import { Order } from "../entity";
import { OrderStatus } from "../shared/enums";

const tenant = process.env.DEFAULT_TENANT;

export const processScheduledOrders = async (): Promise<void> => {
  const connection = await getOrderConnection(tenant);

  const minute = 60000;
  const fortyFiveMinutes = 45 * minute;
  const currentTime = new Date().getTime();
  const orders = await connection.conn.em.find(Order, {
    scheduledDate: {
      $gte: new Date(currentTime - fortyFiveMinutes - minute),
      $lte: new Date(currentTime - fortyFiveMinutes + minute)
    },
    status: OrderStatus.SCHEDULED
  });

  if (!orders.length) {
    return;
  }

  orders.forEach((order) => {
    order.status = OrderStatus.PENDING;
  });

  await connection.conn.em.flush();
};
