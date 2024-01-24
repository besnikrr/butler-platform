import { BigIntType } from "@mikro-orm/core";

export class NumericType extends BigIntType {
  convertToJSValue(value: any): any {
    if (!value) {
      return value;
    } else {
      return +value;
    }
  }
}
