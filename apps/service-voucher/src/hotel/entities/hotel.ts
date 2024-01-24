import {
  Entity, Property, Collection, Unique, ManyToMany, ManyToOne
} from "@mikro-orm/core";
import { BaseEntity } from "@butlerhospitality/service-sdk";
import Program from "../../program/entities/program";
import Hub from "../../hub/entities/hub";
import { HotelRepository } from "../repository";
import { VoucherType } from "@butlerhospitality/shared";

@Entity({ tableName: "hotel", customRepository: () => HotelRepository })
export default class Hotel extends BaseEntity {
  @Property({ primary: true })
  id!: number;

  @Property({ length: 500 })
  name!: string;

  @ManyToOne({
    entity: () => Hub
  })
  hub!: Hub;

  @Property({ default: true })
  active: boolean = true;

  @Property({ nullable: true })
  @Unique()
  oms_id?: number;

  @Property({ nullable: true })
  menu_id?: number;

  @ManyToMany({
    entity: () => Program,
    owner: true,
    pivotTable: "program_hotel"
  })
  programs: Collection<Program> = new Collection<Program>(this);

  @Property({ persist: false })
  program_types: VoucherType[];

  getProgramTypes(): VoucherType[] {
    const types = new Set<VoucherType>();
    for (const program of this.programs) {
      types.add(program.type);
    }
    return [...types];
  }
}
