"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExcludeDeleted = void 0;
const core_1 = require("@mikro-orm/core");
const defaultOptions = { enabled: true, defaultIsDeleted: false, field: "deleted_at" };
const ExcludeDeleted = (options = {}) => {
    const { enabled, defaultIsDeleted, field } = Object.assign(Object.assign({}, defaultOptions), options);
    return core_1.Filter({
        name: "excludeDeleted",
        cond: ({ isDeleted = defaultIsDeleted } = {}) => isDeleted ? { [field]: { $ne: null } } : isDeleted === false ? { [field]: null } : {},
        args: false,
        default: enabled
    });
};
exports.ExcludeDeleted = ExcludeDeleted;
//# sourceMappingURL=exclude-deleted.js.map