import { Pool } from "pg";
export declare const pool: Pool;
export interface QueryPGObject {
    text: string;
    values?: any[];
}
export declare const queryexec: (input: QueryPGObject) => Promise<import("pg").QueryResult<any> | {
    command: string;
    rows: any[];
    rowCount: number;
}>;
export declare const getSingle: (input: QueryPGObject) => Promise<any>;
