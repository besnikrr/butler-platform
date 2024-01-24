import * as _ from "lodash";
import { Pool } from "pg";
import { ActionContext } from "@butlerhospitality/shared";
import { ILog } from "./shared/interfaces";
import { Action } from "./shared/enums";
import { findObjectDifference } from "./util";

export default class Logger {
  private readonly pgPool: Pool;

  constructor(pgPool: Pool) {
    this.pgPool = pgPool;
  }

  logRecord = async (
    id: number,
    table: string,
    service: string,
    topic: string,
    data: any,
    context: ActionContext): Promise<ILog> => {
    const entityData = this.getEntityData(data);
    const records = await this.findRecords(id, table, service);
    const reconstructedObject = records.length > 0 && this.constructLatestRecord(records);

    const who = context?.authorizedUser?.email ?? "audit_log_user";
    const action = this.getAction(data);
    const when = this.getModifiedDate(data);

    const text = `
      INSERT INTO "log" (
        "service", 
        "entity_id", 
        "entity_table", 
        "version", 
        "topic",
        "action",
        "data", 
        "who", 
        "when"
      ) VALUES (
        $1,
        $2,
        $3,
        $4,
        $5,
        $6,
        $7,
        $8,
        $9
      )
    `;

    const values = [
      service,
      id,
      table,
      reconstructedObject ? reconstructedObject.version + 1 : 1,
      topic,
      action,
      reconstructedObject ? findObjectDifference(entityData, reconstructedObject.data) : entityData,
      who,
      when
    ];

    const result = await this.pgPool.query({
      text,
      values
    });

    return result.rows.length > 0 && result.rows[0] as ILog;
  };

  private findRecords = async (id: number, table: string, service: string): Promise<ILog[]> => {
    const query = `
      SELECT * FROM "log" 
      WHERE "service" = $1 
      AND "entity_id" = $2
      AND "entity_table" = $3
    `;

    const result = await this.pgPool.query({
      text: query,
      values: [service, id, table]
    });

    return result.rows as ILog[];
  };

  private findFirstRecord = async (id: number, table: string, service: string): Promise<ILog> => {
    const records = await this.findRecords(id, table, service);

    return records.length > 0 && records.reduce(
      (previous, current) => previous.version < current.version ? previous : current
    );
  };

  private findLatestRecord = async (id: number, table: string, service: string): Promise<ILog> => {
    const records = await this.findRecords(id, table, service);

    return records.length > 0 && records.reduce(
      (previous, current) => previous.version > current.version ? previous : current
    );
  };

  private constructLatestRecord = (records: any[]): ILog => {
    const reconstructedObject = {};
    const orderedRecords = records.sort((a, b) => (a.version > b.version) ? 1 : -1);

    for (const record of orderedRecords) {
      _.merge(reconstructedObject, record);
    }

    return reconstructedObject as ILog;
  };

  private getEntityData = (data: any) => {
    const { source, entity, ...strippedData } = data;

    return strippedData;
  };

  private getModifiedDate = (data: any) => {
    return data.deleted_at ?? data.updated_at ?? data.created_at ?? "now()";
  };

  private getAction = (data: any): Action => {
    const hasAuditFields = !!data.created_at;

    if (hasAuditFields) {
      if (data.deleted_at) {
        return Action.DELETED;
      } else if (data.updated_at) {
        return Action.UPDATED;
      } else {
        return Action.CREATED;
      }
    } else {
      return Action.DELETED;
    }
  };
}
