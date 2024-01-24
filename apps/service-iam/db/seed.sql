insert into app (name) values
('IAM');

insert into permission (name, arn, app_id, created_at) values
('TEST_PERM', '/arn/test/perm', 1, 'now()');

insert into permissiongroup (name, created_at) values
('Test permission group', 'now()');

insert into permissiongroup_permission (permissiongroup_id, permission_id) values
(1, 1);

insert into role (name, description) values
('superadmin', 'Superadmin role');

insert into role_permissiongroup (role_id, permissiongroup_id) values
(1, 1);

insert into iam_user (name, email, phone_number) values
('John Doe', 'endrit@butlerhospitality.com', '+1234567890');

insert into user_role (user_id, role_id) values (1, 1);