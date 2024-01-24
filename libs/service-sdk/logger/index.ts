/* eslint-disable @typescript-eslint/no-explicit-any */
export interface ILogger {
  log(msg: any, ...args: any[]): void;
  debug(msg: any, ...args: any[]): void;
  warn(msg: any, ...args: any[]): void;
  error(msg: any, ...args: any[]): void;
}

export const logger: ILogger = {
  log: (msg?: any, ...args: any[]) => {
    console.log(msg, ...args);
  },
  warn: (msg: any, ...args: any[]) => {
    console.warn(msg, ...args);
  },
  debug: (msg: any, ...args: any[]) => {
    console.debug(msg, ...args);
  },
  error: (msg: any, ...args: any[]) => {
    console.error(msg, ...args);
  }
};
