"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NumericType = void 0;
const core_1 = require("@mikro-orm/core");
class NumericType extends core_1.BigIntType {
    convertToJSValue(value) {
        if (!value) {
            return value;
        }
        else {
            return +value;
        }
    }
}
exports.NumericType = NumericType;
//# sourceMappingURL=numeric.js.map