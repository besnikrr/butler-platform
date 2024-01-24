import { AuditBaseEntity, BaseEntity } from "@butlerhospitality/service-sdk";
import { Discount, DiscountClient } from "../discount/entity";
import { Hub } from "../hub/entity";

export default [
  AuditBaseEntity,
  BaseEntity,
  Hub,
  Discount,
  DiscountClient
];
