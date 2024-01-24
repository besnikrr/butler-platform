import { logger } from "libs/service-sdk/logger";
import { getSingle } from "../pgutil";

const getUser = async (email: string) => {
  const user = await getSingle({
    text: `
        select u.id, u.name, u.email, json_agg(json_build_object(
            'id', p.id,
            'name', p.name,
            'arn', p.arn
            )) as permissions from iam_user u
        inner join user_role ur on u.id = ur.user_id
        inner join role_permissiongroup rp on rp.role_id = ur.role_id
        inner join permissiongroup_permission pp on pp.permissiongroup_id = rp.permissiongroup_id
        inner join permission p on pp.permission_id = p.id
        where u.email = $1
        group by u.id;
        `,
    values: [email]
  });

  if (!user || Object.keys(user).length == 0) {
    logger.log("inside deny policy - no user");
    throw "User not found";
  }

  if (user.permissions.length === 0) {
    throw "User has no permissions";
  }
  return user;
};

export {
  getUser
};
