import { ArrayType } from "@mikro-orm/core";

export class IntegerArray extends ArrayType<number> {
  convertToDatabaseValue(value: number[]): any {
    if (!value || value.length === 0) {
      return "{}";
    } else {
      return "{" + value.join(", ") + "}";
    }
  }

  convertToJSValue(value: number[]) {
    return value;
  }

  getColumnType() {
    return "json[]";
  }
}
