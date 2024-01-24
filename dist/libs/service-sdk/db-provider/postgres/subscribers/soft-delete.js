"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SoftDeleteSubscriber = void 0;
const tslib_1 = require("tslib");
const service_sdk_1 = require("@butlerhospitality/service-sdk");
const core_1 = require("@mikro-orm/core");
class SoftDeleteSubscriber {
    onFlush(args) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const changeSets = args.uow.getChangeSets();
            const toRemove = changeSets.filter((cs) => cs.entity instanceof service_sdk_1.BaseEntity && cs.type === core_1.ChangeSetType.DELETE);
            for (const changeSet of toRemove) {
                changeSet.type = core_1.ChangeSetType.UPDATE;
                changeSet.entity.deleted_at = new Date();
                changeSet.payload.deleted_at = new Date();
                args.uow.recomputeSingleChangeSet(changeSet.entity);
            }
        });
    }
}
exports.SoftDeleteSubscriber = SoftDeleteSubscriber;
//# sourceMappingURL=soft-delete.js.map