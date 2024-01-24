declare const GENERAL_ACTION_ERROR: (action: any, entity: any) => {
    status: number;
    message: string;
};
declare const ENTITY_NOT_FOUND_ERROR: (entity: any, id: any) => {
    status: number;
    message: string;
};
export { GENERAL_ACTION_ERROR, ENTITY_NOT_FOUND_ERROR };
