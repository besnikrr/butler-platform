export interface ILogger {
    log(msg: any, ...args: any[]): void;
    debug(msg: any, ...args: any[]): void;
    warn(msg: any, ...args: any[]): void;
    error(msg: any, ...args: any[]): void;
}
export declare const logger: ILogger;
