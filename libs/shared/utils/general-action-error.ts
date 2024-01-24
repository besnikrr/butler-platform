const GENERAL_ACTION_ERROR = (action: any, entity: any) => {
  return {
    status: 400,
    message: `Cant ${action.toLowerCase()} ${entity}`
  };
};

const ENTITY_NOT_FOUND_ERROR = (entity: any, id: any) => {
  return {
    status: 404,
    message: `${entity} with ${id} not found`
  };
};

export { GENERAL_ACTION_ERROR, ENTITY_NOT_FOUND_ERROR };
