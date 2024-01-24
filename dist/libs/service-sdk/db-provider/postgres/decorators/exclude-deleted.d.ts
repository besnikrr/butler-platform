export declare type ExcludeDeletedOptions = {
    enabled?: boolean;
    defaultIsDeleted?: boolean;
    field?: string;
};
export declare const ExcludeDeleted: (options?: ExcludeDeletedOptions) => ClassDecorator;
