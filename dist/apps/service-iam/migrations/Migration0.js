"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Migration = require("@mikro-orm/migrations").Migration;

class Migration20220214135442 extends Migration {
  async up() {
    this.addSql(`
      
drop table if exists iam_user cascade;
create table iam_user (
	id serial not null,
	name varchar(100),
	email varchar(100),
	phone_number varchar(100),
	created_at timestamptz not null default now(),
	updated_at timestamptz,
	deleted_at timestamptz,
	primary key (id)
);

create unique index index_iam_user_email_deleted_at_key on
iam_user (email, deleted_at) WHERE deleted_at IS NULL;

drop table if exists role cascade;
create table role (
	id serial not null,
	name varchar(50),
	description varchar(255),
	created_at timestamptz not null default now(),
	updated_at timestamptz,
	deleted_at timestamptz,
	primary key (id)
);

drop table if exists app cascade;
create table app (
	id serial not null,
	name varchar(100) unique,
  description varchar(300),
  dashboard_settings jsonb default '{}',
	primary key (id)
);

drop table if exists permission cascade;
create table permission (
	id serial not null,
	name varchar(100) not null,
	arn varchar(500) not null,
	app_id bigint not null,
	created_at timestamptz not null default now(),
	updated_at timestamptz,
	deleted_at timestamptz,
	primary key (id),
	foreign key (app_id) references app(id)
);

create unique index index_permission_name_arn_deleted_at_key on
permission (name, arn, app_id, deleted_at) WHERE deleted_at IS NULL;

drop table if exists permissiongroup cascade;
create table permissiongroup (
	id serial not null,
	name varchar(50) unique,
	created_at timestamptz not null default now(),
	updated_at timestamptz,
	deleted_at timestamptz,
	primary key (id)
);

drop table if exists permissiongroup_permission cascade;
create table permissiongroup_permission (
	permissiongroup_id bigint,
	permission_id  bigint,
  primary key (permissiongroup_id, permission_id),
	foreign key (permissiongroup_id) references permissiongroup(id) on delete cascade,
	foreign key (permission_id) references permission(id) on delete cascade
);

drop table if exists role_permissiongroup cascade;
create table role_permissiongroup (
	role_id bigint,
	permissiongroup_id bigint,
  primary key (role_id, permissiongroup_id),
	foreign key (role_id) references role(id) on delete cascade,
	foreign key (permissiongroup_id) references permissiongroup(id) on delete cascade
);

drop table if exists user_role cascade;
create table user_role (
	user_id bigint not null,
	role_id bigint not null,
  primary key (user_id, role_id),
	foreign key (user_id) references iam_user(id) on delete cascade,
	foreign key (role_id) references role(id) on delete cascade
);

      `);
  }

  async down() {
    // schema creation...
  }
}
exports.Migration20220214135442 = Migration20220214135442;
