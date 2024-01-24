"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IntegerArray = void 0;
const core_1 = require("@mikro-orm/core");
class IntegerArray extends core_1.ArrayType {
    convertToDatabaseValue(value) {
        if (!value || value.length === 0) {
            return "{}";
        }
        else {
            return "{" + value.join(", ") + "}";
        }
    }
    convertToJSValue(value) {
        return value;
    }
    getColumnType() {
        return "json[]";
    }
}
exports.IntegerArray = IntegerArray;
//# sourceMappingURL=integer-array.js.map