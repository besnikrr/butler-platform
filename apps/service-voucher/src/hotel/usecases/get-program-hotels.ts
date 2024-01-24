import { Knex } from "@mikro-orm/postgresql";
import { BaseFilter } from "@butlerhospitality/service-sdk";
import Hotel from "../entities/hotel";
import { VoucherType } from "@butlerhospitality/shared";

export interface IProgramFilter extends BaseFilter {
  programType?: VoucherType[];
  hotelName?: string;
}
export interface IGetProgramHotelsDependency {
  knex: Knex;
}
const getHotelsWithProgramsQuery = (filter: IProgramFilter) => {
  const typeCondition = filter.programType ?
    ` and p.type in (${filter.programType.map((type) => `'${type.replace(/'+/g, "''").replace("?", "")}'`).join(",")})` : "";
  const nameCondition = filter.hotelName ? `and h.name ilike '%${filter.hotelName.trim().replace(/'+/g, "''").replace("?", "")}%'` : "";

  return {
    text: `
    select h.*,
    count(h.id) OVER() AS count,
    count(p.id) as programs,
    json_agg(
      distinct p.type
    ) as program_types
    from hotel h
    inner join program_hotel ph
      on ph.hotel_id = h.id
    inner join program p
      on p.id = ph.program_id
      where h.deleted_at is null AND p.deleted_at is null
      ${typeCondition}
      ${nameCondition}
      group by h.id
      order by h.updated_at DESC
      limit :limit
      offset :page
    `,
    values: { limit: filter.limit, page: (filter.page - 1) * filter.limit }
  };
};

export default (dependency: IGetProgramHotelsDependency) => {
  const { knex } = dependency;
  return async (req: BaseFilter): Promise<[Hotel[], number]> => {
    const { text, values } = getHotelsWithProgramsQuery(req);
    const { rows } = await knex.raw(text, values);
    return [rows as Hotel[], rows.length !== 0 ? +rows[0].count : 0];
  };
};
