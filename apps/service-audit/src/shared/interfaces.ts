import { ActionContext } from "@butlerhospitality/shared";

export interface ILog {
  service: string;
  entity_id: number;
  entity_table: string;
  version: number;
  topic: string;
  data: any;
  who: string;
  when: string;
  timestamp: string;
}

export interface ISNSMessage {
  data: any;
  context: ActionContext,
  topic: string;
  service: string;
}

