
import { Knex } from "@mikro-orm/postgresql";

const getProductMenusQuery = (id: number) => {
  return {
    text: `
      SELECT p.id,
      p.name,
      COALESCE((json_agg(json_build_object('id', m.id, 'name', m.name))), '[]') AS menus
      FROM menu m
      INNER JOIN product_menu pm ON m.id = pm.menu_id
      INNER JOIN product p ON pm.product_id = p.id
      AND p.deleted_at IS NULL
      WHERE p.id = :id
      AND m.deleted_at IS NULL
      GROUP BY p.id
		`,
    values: { id }
  };
};

export interface IListProductRelationsDependency {
  knex: Knex;
}

export default (dependency: IListProductRelationsDependency) => {
  const { knex } = dependency;
  return async (id: number): Promise<any> => {
    const data = getProductMenusQuery(id);
    const { rows } = await knex.raw(data.text, data.values);
    return rows && rows.length > 0 && rows[0];
  };
};
