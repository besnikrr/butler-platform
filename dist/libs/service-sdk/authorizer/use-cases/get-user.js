"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUser = void 0;
const tslib_1 = require("tslib");
const logger_1 = require("libs/service-sdk/logger");
const pgutil_1 = require("../pgutil");
const getUser = (email) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    const user = yield pgutil_1.getSingle({
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
        logger_1.logger.log("inside deny policy - no user");
        throw "User not found";
    }
    if (user.permissions.length === 0) {
        throw "User has no permissions";
    }
    return user;
});
exports.getUser = getUser;
//# sourceMappingURL=get-user.js.map