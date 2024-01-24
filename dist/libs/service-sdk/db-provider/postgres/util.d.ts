import { Pool } from "pg";
export declare namespace PG {
    const pool: Pool;
    const queryexec: (input: QueryPGObject) => Promise<import("pg").QueryResult<any>>;
    const getMultiple: (input: QueryPGObject) => Promise<any[]>;
    const getSingle: (input: QueryPGObject) => Promise<any>;
    const insertquery: (table: string, input: {
        [key: string]: any;
    } | {
        [key: string]: any;
    }[], onConstraintQuery?: string) => {
        text: string;
        values: any[];
    };
    const insert: (table: string, input: {
        [key: string]: any;
    } | {
        [key: string]: any;
    }[], onConstraintQuery?: string) => Promise<any>;
    const updatequery: (table: string, id: number, input: {
        [key: string]: any;
    }) => {
        text: string;
        values: string[];
    };
    const update: (table: string, id: number, input: {
        [key: string]: any;
    }) => Promise<any>;
    const softdeletequery: (table: string, id: number | number[]) => {
        text: string;
        values: string[];
    };
    const deletequery: (table: string, id: number | number[]) => {
        text: string;
    };
    const softdel: (table: string, id: number | number[]) => Promise<any>;
    const del: (table: string, id: number | number[]) => Promise<number | number[]>;
    interface PaginationFilters {
        page: number;
        limit: number;
    }
    interface QueryPGObject {
        text: string;
        values?: any[];
    }
    const TABLE: {
        MODIFIER: string;
        MODIFIER_OPTION: string;
        CATEGORY: string;
        PRODUCT: string;
        PRODUCT_CATEGORY: string;
        PRODUCT_MODIFIER: string;
        MENU: string;
        PRODUCT_MENU: string;
        OUT_OF_STOCK: string;
        MENU_HOTEL: string;
    };
    const getPaginationString: (page: number, limit?: number) => string;
    const getOrderByClause: (attr: string, sort?: string) => string;
    const addTotalCountQueryString: () => string;
    const getClient: () => Promise<any>;
}
