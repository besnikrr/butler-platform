import { generalError } from "libs/service-sdk/errors";
import { logger } from "libs/service-sdk/logger";
import { Pool } from "pg";

export namespace PG {
  export const pool = new Pool({
    user: "admin",
    host: "0.0.0.0",
    database: "mikroorm_menu",
    password: "admin",
    port: 5432
  });

  export const queryexec = async (input: QueryPGObject) => {
    const start = Date.now();
    const res = await pool.query(input);
    const duration = Date.now() - start;
    logger.log("executed query", { input, duration, rows: res.rowCount });
    return res;
  };

  export const getMultiple = async (input: QueryPGObject) => {
    const res = await queryexec(input);
    return res.command == "SELECT" && res.rows && res.rows.length ? res.rows : [];
  };

  export const getSingle = async (input: QueryPGObject) => {
    const res = await queryexec(input);
    return res.command == "SELECT" && res.rows && res.rows.length ? res.rows[0] : {};
  };

  export const insertquery = (
    table: string,
    input: { [key: string]: any } | { [key: string]: any }[],
    onConstraintQuery = ""
  ) => {
    const params: string[] = [];
    const values: string[] = [];
    const paramvalues: string[] = [];
    const bulk = input.length > 0;

    if (bulk) {
      let i: number = 0;
      let idx: number = 0;
      input.forEach((ob: { [key: string]: any }) => {
        const keys = [];
        Object.keys(ob).forEach((key: string) => {
          if (i === 0) {
            params.push(key);
          }
          values.push(`$${idx + 1}`);
          keys.push(`$${idx + 1}`);
          idx++;
        });
        i++;
        paramvalues.push(`(${keys.concat("now()").toString()})`);
      });
    } else {
      Object.keys(input).forEach((key: string, idx: number) => {
        params.push(key);
        values.push(`$${idx + 1}`);
      });
      paramvalues.push(`(${values.concat("now()").toString()})`).toString();
    }

    let inputvals = [];
    if (bulk) {
      const collectedValues = input.map((ob) => Object.values(ob).map((e: any) => (!e ? null : e)));
      inputvals = [].concat.apply([], collectedValues); // .toString().split(',')
      logger.log("bulk-input: ", input);
      logger.log("bulk-inputvals: ", inputvals);
    } else {
      inputvals = Object.values(input);
      logger.log("input: ", input);
      logger.log("inputvals: ", inputvals);
    }

    const txt = `insert into ${table} (${params.concat(["created_at"]).toString()}) values ${paramvalues} ${onConstraintQuery} returning *`;
    return {
      text: txt,
      values: inputvals
    };
  };

  export const insert = async (
    table: string, input: { [key: string]: any } | { [key: string]: any }[], onConstraintQuery = ""
  ) => {
    const queryinput = insertquery(table, input, onConstraintQuery);
    const output = await queryexec(queryinput);

    if (output && output.rows && output.rows.length) {
      return output.rows[0];
    }

    throw generalError("0", "INSERT failure");
  };

  export const updatequery = (table: string, id: number, input: { [key: string]: any }) => {
    const params: string[] = ["updated_at = $1"];
    Object.keys(input).forEach((key: string, idx: number) => {
      params.push(`${key} = $${idx + 2}`);
    });

    return {
      text: `update ${table} set ${params.toString()} where id = $${Object.keys(input).length + 2} returning *`,
      values: ["now()"].concat(Object.values(input)).concat([id.toString()])
    };
  };

  export const update = async (table: string, id: number, input: { [key: string]: any }) => {
    const queryinput = updatequery(table, id, input);
    const output = await queryexec(queryinput);

    if (output && output.rows && output.rows.length) {
      return output.rows[0];
    }

    throw generalError("0", "UPDATE failure");
  };

  export const softdeletequery = (table: string, id: number | number[]) => {
    const params: string[] = ["deleted_at = $1"];

    return {
      text: `update ${table} set ${params.toString()} where id in (${Array.isArray(id) ? id.toString() : id}) returning *`,
      values: ["now()"]
    };
  };

  export const deletequery = (table: string, id: number | number[]) => {
    return {
      text: `delete from ${table} where id in (${Array.isArray(id) ? id.toString() : id})`
    };
  };

  export const softdel = async (table: string, id: number | number[]) => {
    const queryinput = softdeletequery(table, id);
    const output = await queryexec(queryinput);

    if (output && output.rows && output.rows.length) {
      return output.rows[0];
    }

    throw generalError("0", "DELETE failure");
  };

  export const del = async (table: string, id: number | number[]) => {
    const queryinput = deletequery(table, id);
    const output = await queryexec(queryinput);

    if (output && output.rowCount) {
      return id;
    }

    throw generalError("0", "DELETE failure");
  };

  export interface PaginationFilters {
    page: number;
    limit: number;
  }

  export interface QueryPGObject {
    text: string;
    values?: any[];
  }

  export const TABLE = {
    MODIFIER: process.env.MODIFIER_TABLE || "modifier",
    MODIFIER_OPTION: process.env.MODIFIER_OPTION_TABLE || "modifier_option",
    CATEGORY: process.env.CATEGORY_TABLE || "category",
    PRODUCT: process.env.PRODUCT_TABLE || "product",
    PRODUCT_CATEGORY: process.env.PRODUCT_CATEGORY_TABLE || "product_category",
    PRODUCT_MODIFIER: process.env.PRODUCT_MODIFIER_TABLE || "product_modifier",
    MENU: process.env.MENU_TABLE || "menu",
    PRODUCT_MENU: process.env.PRODUCT_MENU_TABLE || "product_menu",
    OUT_OF_STOCK: process.env.OUT_OF_STOCK_TABLE || "out_of_stock",
    MENU_HOTEL: process.env.MENU_HOTEL_TABLE || "menu_hotel"
  };

  export const getPaginationString = (page: number, limit: number = 20) => {
    const offset = page > 0 ? (page - 1) * limit + 1 : 0;
    return `offset ${offset} limit ${limit}`;
  };

  export const getOrderByClause = (attr: string, sort = "asc") => {
    return `order by ${attr} ${sort}`;
  };

  export const addTotalCountQueryString = () => {
    return `count(*) OVER() AS total_count`;
  };

  export const getClient = async () => {
    const client: any = await pool.connect();
    const { query } = client;
    const { release } = client;
    // set a timeout of 5 seconds, after which we will log this client's last query
    const timeout = setTimeout(() => {
      console.error("A client has been checked out for more than 5 seconds!");
      console.error(`The last executed query on this client was: ${client.lastQuery}`);
    }, 5000);
    // monkey patch the query method to keep track of the last query executed
    client.query = (...args) => {
      client.lastQuery = args;
      return query.apply(client, args);
    };
    client.release = () => {
      // clear our timeout
      clearTimeout(timeout);
      // set the methods back to their old un-monkey-patched version
      client.query = query;
      client.release = release;
      return release.apply(client);
    };
    return client;
  };

}
