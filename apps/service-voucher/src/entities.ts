
import { BaseEntity, AuditBaseEntity } from "@butlerhospitality/service-sdk";
import VoucherProgram from "./program/entities/program";
import VoucherCode from "./code/entities/code";
import VoucherRule from "./rule/entities/rule";
import VoucherHotel from "./hotel/entities/hotel";
import VoucherHub from "./hub/entities/hub";
import VoucherCategory from "./category/entities/category";

export const VoucherEntitiesObject = {
  BaseEntity,
  AuditBaseEntity,
  VoucherCategory,
  VoucherHub,
  VoucherProgram,
  VoucherHotel,
  VoucherCode,
  VoucherRule
};

export const VoucherEntities = {
  asArray: () => {
    return Object.values(VoucherEntitiesObject);
  },
  asObject: () => {
    return VoucherEntitiesObject;
  }
};
