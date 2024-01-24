import { Knex } from "@mikro-orm/knex";

const getCategoryRelationsQuery = (id: number) => {
  return {
    text: `select coalesce(json_agg(distinct jsonb_build_object(
			  'id', p.id,
			  'name', p.name
			  )) filter (where p.id is not null), '[]') as items,
			  coalesce(json_agg(distinct jsonb_build_object(
					  'id', m.id,
					  'name', m.name
			  )) filter (where m.id is not null), '[]') as menus,
			  coalesce(json_agg(distinct jsonb_build_object(
					  'id', c2.id,
					  'name', c2.name
			  )) filter (where c2.id is not null), '[]') as parent_categories,
			  coalesce(json_agg(distinct jsonb_build_object(
					  'id', c3.id,
					  'name', c3.name
			  )) FILTER (WHERE c3.id IS NOT NULL), '[]') as subcategories
		  from category c
		  left join product_category pc on c.id = pc.category_id
		  left join product_menu pm on c.id = pm.category_id
		  left join menu m on m.id = pm.menu_id
		  left join product p on p.id = pc.category_id
		  left join category c2 on c2.id = c.parent_category_id
		  left join category c3 on c3.parent_category_id = c.id
		  where c.id = :id AND c3.deleted_at is null`,
    values: { id }
  };
};

export interface IListCategoryRelationsDependency {
  knex: Knex;
}

export default (dependency: IListCategoryRelationsDependency) => {
  const { knex } = dependency;
  return async (id: number) => {
    const data = getCategoryRelationsQuery(id);
    const { rows } = await knex.raw(data.text, data.values);
    return rows && rows.length > 0 && rows[0];
  };
};
