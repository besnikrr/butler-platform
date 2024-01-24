export interface BaseFilter {
    page: number;
    limit: number;
    paginate?: boolean;
    search?: string;
}
export declare const getPaginationParams: (filter: BaseFilter) => {
    [key: string]: any;
};
