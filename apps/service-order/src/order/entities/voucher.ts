import { BaseEntity, NumericType } from "@butlerhospitality/service-sdk";
import { VoucherType } from "@butlerhospitality/shared";
import {
  Entity, Enum, ManyToOne, Property
} from "@mikro-orm/core";
import { Service } from "../../service/entity";
import { Order } from "./order";
import { OrderVoucherRepository } from "../repositories/voucher";

@Entity({
  customRepository: () => OrderVoucherRepository
})
export class OrderVoucher extends BaseEntity {
  @ManyToOne(() => Order)
  order!: Order;

  @Property()
  programId!: number;

  @Enum(() => VoucherType)
  type!: VoucherType;

  @Property({ columnType: "numeric(19,2)", type: NumericType })
  amount!: number;

  @Property()
  codeId!: number;

  @Property({ length: 100 })
  code!: string;

  @ManyToOne({ entity: () => Service })
  service!: Service;
}
