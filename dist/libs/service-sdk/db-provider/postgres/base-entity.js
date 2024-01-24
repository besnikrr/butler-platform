"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmptyBaseEntity = exports.PureBaseEntity = exports.BaseEntity = void 0;
const tslib_1 = require("tslib");
const core_1 = require("@mikro-orm/core");
const audit_base_entity_1 = require("./audit-base-entity");
const exclude_deleted_1 = require("./decorators/exclude-deleted");
let BaseEntity = class BaseEntity extends audit_base_entity_1.AuditBaseEntity {
};
tslib_1.__decorate([
    core_1.PrimaryKey(),
    tslib_1.__metadata("design:type", Number)
], BaseEntity.prototype, "id", void 0);
BaseEntity = tslib_1.__decorate([
    exclude_deleted_1.ExcludeDeleted()
], BaseEntity);
exports.BaseEntity = BaseEntity;
class PureBaseEntity {
}
tslib_1.__decorate([
    core_1.PrimaryKey(),
    tslib_1.__metadata("design:type", Number)
], PureBaseEntity.prototype, "id", void 0);
exports.PureBaseEntity = PureBaseEntity;
class EmptyBaseEntity {
}
exports.EmptyBaseEntity = EmptyBaseEntity;
//# sourceMappingURL=base-entity.js.map