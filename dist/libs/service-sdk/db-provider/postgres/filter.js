"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPaginationParams = void 0;
const getPaginationParams = (filter) => {
    return {
        offset: !filter.paginate ? (filter.page - 1) * filter.limit : null,
        limit: !filter.paginate ? filter.limit : null
    };
};
exports.getPaginationParams = getPaginationParams;
//# sourceMappingURL=filter.js.map