/* eslint-disable @typescript-eslint/no-explicit-any */
import { Pool } from "pg";
import { logger } from "../logger";

export const pool = new Pool({
  user: process.env.POSTGRES_USER || "platform",
  host: process.env.POSTGRES_HOST || "0.0.0.0",
  database: "service_iam",
  password: process.env.POSTGRES_PASSWORD || "platform",
  port: 5432
});

export interface QueryPGObject {
	text: string;
	values?: any[];
}

export const queryexec = async (input: QueryPGObject) => {
  const start = Date.now();
  try {
    const res = await pool.query(input);
    const duration = Date.now() - start;
    logger.log("executed query", { input, duration, rows: res.rowCount });
    return res;
  } catch (e) {
    logger.log("exec query error: ", e);
  }

  return { command: "", rows: [], rowCount: 0 };
};

export const getSingle = async (input: QueryPGObject) => {
  const res = await queryexec(input);
  return res.command == "SELECT" && res.rows && res.rows.length ? res.rows[0] : {};
};
