export interface IAuditBaseEntity {
    created_at: Date;
    updated_at?: Date;
    deleted_at?: Date;
}
export declare abstract class AuditBaseEntity implements IAuditBaseEntity {
    created_at: Date;
    updated_at?: Date;
    deleted_at?: Date;
}
