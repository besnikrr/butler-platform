import { BigIntType } from "@mikro-orm/core";
export declare class NumericType extends BigIntType {
    convertToJSValue(value: any): any;
}
