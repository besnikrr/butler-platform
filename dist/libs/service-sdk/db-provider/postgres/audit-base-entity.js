"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditBaseEntity = void 0;
const tslib_1 = require("tslib");
const core_1 = require("@mikro-orm/core");
class AuditBaseEntity {
}
tslib_1.__decorate([
    core_1.Property({ defaultRaw: `now()`, onCreate: () => new Date() }),
    tslib_1.__metadata("design:type", Date)
], AuditBaseEntity.prototype, "created_at", void 0);
tslib_1.__decorate([
    core_1.Property({ onCreate: () => null, onUpdate: () => new Date(), nullable: true }),
    tslib_1.__metadata("design:type", Date)
], AuditBaseEntity.prototype, "updated_at", void 0);
tslib_1.__decorate([
    core_1.Property({ onCreate: () => null, nullable: true }),
    tslib_1.__metadata("design:type", Date)
], AuditBaseEntity.prototype, "deleted_at", void 0);
exports.AuditBaseEntity = AuditBaseEntity;
//# sourceMappingURL=audit-base-entity.js.map