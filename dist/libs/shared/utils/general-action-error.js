"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ENTITY_NOT_FOUND_ERROR = exports.GENERAL_ACTION_ERROR = void 0;
const GENERAL_ACTION_ERROR = (action, entity) => {
    return {
        status: 400,
        message: `Cant ${action.toLowerCase()} ${entity}`
    };
};
exports.GENERAL_ACTION_ERROR = GENERAL_ACTION_ERROR;
const ENTITY_NOT_FOUND_ERROR = (entity, id) => {
    return {
        status: 404,
        message: `${entity} with ${id} not found`
    };
};
exports.ENTITY_NOT_FOUND_ERROR = ENTITY_NOT_FOUND_ERROR;
//# sourceMappingURL=general-action-error.js.map