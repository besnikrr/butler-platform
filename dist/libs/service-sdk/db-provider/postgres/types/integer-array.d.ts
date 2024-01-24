import { ArrayType } from "@mikro-orm/core";
export declare class IntegerArray extends ArrayType<number> {
    convertToDatabaseValue(value: number[]): any;
    convertToJSValue(value: number[]): number[];
    getColumnType(): string;
}
