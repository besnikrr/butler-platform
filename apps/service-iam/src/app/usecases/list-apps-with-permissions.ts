
import { Knex } from "@mikro-orm/postgresql";
import { NotFoundError } from "@butlerhospitality/service-sdk";
import App from "../entities/app";

class AppsNotFoundError extends NotFoundError {}

const getAppPermissionsQuery = () => {
  return {
    text: `
		SELECT
			a.id,
			a.name,
			json_agg(json_build_object('id', p.id, 'name', p.name)) AS permissions
		FROM permission p
		INNER JOIN app a ON a.id = p.app_id
		WHERE p.deleted_at IS NULL
		GROUP BY a.id;
 `
  };
};

export interface IListAppsWithPermissionsDependency {
  knex: Knex;
}

export default (dependency: IListAppsWithPermissionsDependency) => {
  const { knex } = dependency;
  return async (): Promise<any[]> => {
    const data = { rows: [] };
    try {
      const { rows } = await knex.raw(getAppPermissionsQuery().text);
      data.rows = rows;
    } catch (e) {
      throw new AppsNotFoundError(App.toString(), "Apps not found");
    }
    return data.rows;
  };
};
