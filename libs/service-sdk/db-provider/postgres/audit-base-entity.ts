import { Property } from "@mikro-orm/core";

export interface IAuditBaseEntity {
  created_at: Date;
  updated_at?: Date;
  deleted_at?: Date;
}

export abstract class AuditBaseEntity implements IAuditBaseEntity {
  @Property({ defaultRaw: `now()`, onCreate: () => new Date() })
  created_at!: Date;

  @Property({ onCreate: () => null, onUpdate: () => new Date(), nullable: true })
  updated_at?: Date;

  @Property({ onCreate: () => null, nullable: true })
  deleted_at?: Date;
}
