"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Migration = require("@mikro-orm/migrations").Migration;

class Migration0 extends Migration {
  async up() {
    this.addSql("create table \"service_type\" (\"id\" serial primary key, \"created_at\" timestamptz(0) not null default now(), \"updated_at\" timestamptz(0) null, \"deleted_at\" timestamptz(0) null, \"name\" varchar(255) not null);");
    this.addSql("alter table \"service_type\" add constraint \"service_type_name_unique\" unique (\"name\");");

    this.addSql("create table \"service\" (\"id\" serial primary key, \"created_at\" timestamptz(0) not null default now(), \"updated_at\" timestamptz(0) null, \"deleted_at\" timestamptz(0) null, \"service_type_id\" int4 not null, \"name\" varchar(255) not null);");
    this.addSql("alter table \"service\" add constraint \"service_name_unique\" unique (\"name\");");

    this.addSql("create table \"payment_provider\" (\"id\" serial primary key, \"created_at\" timestamptz(0) not null default now(), \"updated_at\" timestamptz(0) null, \"deleted_at\" timestamptz(0) null, \"name\" varchar(255) not null);");

    this.addSql("create table \"service_payment_provider\" (\"service_id\" int4 not null, \"payment_provider_id\" int4 not null);");
    this.addSql("alter table \"service_payment_provider\" add constraint \"service_payment_provider_pkey\" primary key (\"service_id\", \"payment_provider_id\");");

    this.addSql("create table \"order_client\" (\"id\" serial primary key, \"created_at\" timestamptz(0) not null default now(), \"updated_at\" timestamptz(0) null, \"deleted_at\" timestamptz(0) null, \"name\" varchar(255) not null, \"phone_number\" varchar(50) not null, \"email\" varchar(50) null);");

    this.addSql("create table \"iam_user\" (\"id\" serial primary key, \"created_at\" timestamptz(0) not null default now(), \"updated_at\" timestamptz(0) null, \"deleted_at\" timestamptz(0) null, \"user_id\" int4 not null, \"name\" varchar(255) not null, \"email\" varchar(255) not null, \"carrier_status\" text check (\"carrier_status\" in ('ON_SITE', 'RETURNING', 'OUT_FOR_DELIVERY', 'IDLE')) not null, \"role\" text check (\"role\" in ('FOOD_CARRIER', 'DISPATCHER')) null);");
    this.addSql("alter table \"iam_user\" add constraint \"iam_user_email_unique\" unique (\"email\");");

    this.addSql("create table \"order_meta\" (\"id\" serial primary key, \"created_at\" timestamptz(0) not null default now(), \"updated_at\" timestamptz(0) null, \"deleted_at\" timestamptz(0) null, \"hub_id\" int4 null, \"hub_name\" varchar(255) null, \"hub_color\" varchar(50) null, \"hotel_id\" int4 null, \"hotel_name\" varchar(255) null, \"room_number\" varchar(255) null, \"pms_id\" int4 null, \"cutlery\" smallint null, \"food_carrier_id\" int4 null, \"dispatcher_id\" int4 null, \"assign_date\" timestamptz null, \"tax_rate\" bigint null);");

    this.addSql("create table \"orders\" (\"id\" serial primary key, \"created_at\" timestamptz(0) not null default now(), \"updated_at\" timestamptz(0) null, \"deleted_at\" timestamptz(0) null, \"version\" int4 not null default 1, \"service_id\" int4 not null, \"parent_id\" int4 null, \"status\" text check (\"status\" in ('PENDING', 'CONFIRMATION', 'PREPARATION', 'IN_DELIVERY', 'DELIVERED', 'CANCELLED', 'REJECTED', 'MERGED', 'SCHEDULED')) not null, \"meta_id\" int4 not null, \"client_id\" int4 not null, \"number\" int4 not null, \"type\" text check (\"type\" in ('ROOM_SERVICE', 'CATERING', 'AMENITY', 'FAAS')) not null, \"payment_type\" text check (\"payment_type\" in ('CREDIT_CARD', 'CHARGE_TO_ROOM')) not null, \"scheduled_date\" timestamptz null, \"confirmed_date\" timestamptz null, \"kitchen_confirmed_date\" timestamptz null, \"delivery_date\" timestamptz null, \"transaction_id\" varchar(50) null, \"tax\" numeric(19,2) not null, \"tip\" numeric(19,2) not null, \"total_net\" numeric(19,2) not null, \"total_gross\" numeric(19,2) not null, \"grand_total\" numeric(19,2) not null, \"receipt_amount\" numeric(19,2) not null, \"hotel_tax\" numeric(19,2) not null default 0, \"hotel_total_net\" numeric(19,2) not null default 0, \"hotel_total_gross\" numeric(19,2) not null default 0, \"hotel_grand_total\" numeric(19,2) not null default 0, \"total_voucher_price\" numeric(19,2) not null default 0, \"comment\" varchar(500) null, \"reason\" varchar(500) null, \"is_read\" bool not null default false, \"source\" text check (\"source\" in ('WEB', 'PHONE', 'SMS')) not null);");
    this.addSql("alter table \"orders\" add constraint \"orders_meta_id_unique\" unique (\"meta_id\");");
    this.addSql("alter table \"orders\" add constraint \"orders_client_id_unique\" unique (\"client_id\");");
    this.addSql("create index \"orders_number_index\" on \"orders\" (\"number\");");

    this.addSql("create table \"order_product\" (\"id\" serial primary key, \"created_at\" timestamptz(0) not null default now(), \"updated_at\" timestamptz(0) null, \"deleted_at\" timestamptz(0) null, \"order_id\" int4 not null, \"category_id\" int4 not null, \"category_name\" varchar(255) not null, \"product_id\" int4 not null, \"name\" varchar(255) not null, \"original_price\" numeric(19,2) not null, \"price\" numeric(19,2) not null, \"quantity\" smallint not null, \"comment\" varchar(500) null, \"is_prepared\" bool not null default false);");

    this.addSql("create table \"order_product_modifier\" (\"id\" serial primary key, \"created_at\" timestamptz(0) not null default now(), \"updated_at\" timestamptz(0) null, \"deleted_at\" timestamptz(0) null, \"order_product_id\" int4 not null, \"modifier_id\" int4 not null, \"modifier_name\" varchar(255) not null, \"modifier_option_id\" int4 not null, \"modifier_option_name\" varchar(255) not null, \"modifier_option_price\" numeric(19,2) not null, \"quantity\" smallint not null, \"comment\" varchar(500) null);");

    this.addSql("create table \"order_product_voucher\" (\"id\" serial primary key, \"created_at\" timestamptz(0) not null default now(), \"updated_at\" timestamptz(0) null, \"deleted_at\" timestamptz(0) null, \"order_product_id\" int4 not null, \"voucher_code\" varchar(10) not null, \"voucher_code_id\" int4 not null, \"rule_max_item_price\" numeric(19,2) not null, \"rule_id\" int4 not null);");

    this.addSql("create table \"order_product_custom\" (\"id\" serial primary key, \"created_at\" timestamptz(0) not null default now(), \"updated_at\" timestamptz(0) null, \"deleted_at\" timestamptz(0) null, \"order_id\" int4 not null, \"name\" varchar(255) not null, \"price\" numeric(19,2) not null, \"quantity\" smallint not null, \"comment\" varchar(500) null, \"is_prepared\" bool not null default false);");

    this.addSql("create table \"order_snapshot\" (\"id\" serial primary key, \"created_at\" timestamptz(0) not null default now(), \"updated_at\" timestamptz(0) null, \"deleted_at\" timestamptz(0) null, \"order_id\" int4 not null, \"version\" int4 not null, \"snapshot\" jsonb not null);");

    this.addSql("create table \"order_status_change\" (\"id\" serial primary key, \"created_at\" timestamptz(0) not null default now(), \"updated_at\" timestamptz(0) null, \"deleted_at\" timestamptz(0) null, \"order_id\" int4 not null, \"user_id\" int4 null, \"status\" text check (\"status\" in ('PENDING', 'CONFIRMATION', 'PREPARATION', 'IN_DELIVERY', 'DELIVERED', 'CANCELLED', 'REJECTED', 'MERGED', 'SCHEDULED')) not null, \"status_date\" timestamptz(0) not null default now());");

    this.addSql("create table \"order_voucher\" (\"id\" serial primary key, \"created_at\" timestamptz(0) not null default now(), \"updated_at\" timestamptz(0) null, \"deleted_at\" timestamptz(0) null, \"order_id\" int4 not null, \"program_id\" int4 not null, \"type\" text check (\"type\" in ('DISCOUNT', 'PER_DIEM', 'PRE_FIXE')) not null, \"amount\" numeric(19,2) not null, \"code_id\" int4 not null, \"code\" varchar(100) not null, \"service_id\" int4 not null);");

    this.addSql("create table \"order_refund\" (\"id\" serial primary key, \"created_at\" timestamptz(0) not null default now(), \"updated_at\" timestamptz(0) null, \"deleted_at\" timestamptz(0) null, \"order_id\" int4 not null, \"service_id\" int4 not null, \"type\" text check (\"type\" in ('AMOUNT', 'PERCENTAGE')) not null, \"amount\" numeric(19,2) not null, \"reason\" varchar(500) not null, \"grand_total\" numeric(19,2) not null, \"total_voucher_price\" numeric(19,2) not null, \"hotel_grand_total\" numeric(19,2) not null default 0);");

    this.addSql("create table \"order_discount\" (\"id\" serial primary key, \"created_at\" timestamptz(0) not null default now(), \"updated_at\" timestamptz(0) null, \"deleted_at\" timestamptz(0) null, \"discount_code_id\" int4 not null, \"order_id\" int4 not null, \"service_id\" int4 not null, \"code\" varchar(100) not null, \"type\" text check (\"type\" in ('AMOUNT', 'PERCENTAGE')) not null, \"amount\" numeric(19,2) not null, \"amount_used\" numeric(19,2) not null);");

    this.addSql("create table \"payment\" (\"id\" serial primary key, \"created_at\" timestamptz(0) not null default now(), \"updated_at\" timestamptz(0) null, \"deleted_at\" timestamptz(0) null, \"order_id\" int4 not null, \"service_id\" int4 not null, \"payment_type\" text check (\"payment_type\" in ('CREDIT_CARD', 'CHARGE_TO_ROOM')) not null, \"status\" text check (\"status\" in ('SUCCESS', 'FAILURE')) not null, \"transaction_id\" varchar(255) null, \"tip\" numeric(19,2) not null, \"tax\" numeric(19,2) not null, \"total_net\" numeric(19,2) not null, \"total_gross\" numeric(19,2) not null, \"grand_total\" numeric(19,2) not null, \"hotel_tax\" numeric(19,2) not null, \"hotel_total_net\" numeric(19,2) not null, \"hotel_total_gross\" numeric(19,2) not null, \"hotel_grand_total\" numeric(19,2) not null, \"receipt_amount\" numeric(19,2) not null);");

    this.addSql("create table \"order_transaction_log\" (\"id\" serial primary key, \"created_at\" timestamptz(0) not null default now(), \"updated_at\" timestamptz(0) null, \"deleted_at\" timestamptz(0) null, \"order_id\" int4 not null, \"service_id\" int4 not null, \"type\" text check (\"type\" in ('CREDIT_CARD', 'CHARGE_TO_ROOM', 'VOUCHER', 'REFUND')) not null, \"currency\" text check (\"currency\" in ('USD', 'EUR')) not null default 'USD', \"transaction_id\" varchar(255) null, \"amount\" numeric(19,2) not null);");
    this.addSql("create index \"order_transaction_log_type_index\" on \"order_transaction_log\" (\"type\");");

    this.addSql("alter table \"service\" add constraint \"service_service_type_id_foreign\" foreign key (\"service_type_id\") references \"service_type\" (\"id\") on update cascade;");

    this.addSql("alter table \"service_payment_provider\" add constraint \"service_payment_provider_service_id_foreign\" foreign key (\"service_id\") references \"service\" (\"id\") on update cascade on delete cascade;");
    this.addSql("alter table \"service_payment_provider\" add constraint \"service_payment_provider_payment_provider_id_foreign\" foreign key (\"payment_provider_id\") references \"payment_provider\" (\"id\") on update cascade on delete cascade;");

    this.addSql("alter table \"order_meta\" add constraint \"order_meta_food_carrier_id_foreign\" foreign key (\"food_carrier_id\") references \"iam_user\" (\"id\") on update cascade on delete set null;");
    this.addSql("alter table \"order_meta\" add constraint \"order_meta_dispatcher_id_foreign\" foreign key (\"dispatcher_id\") references \"iam_user\" (\"id\") on update cascade on delete set null;");

    this.addSql("alter table \"orders\" add constraint \"orders_service_id_foreign\" foreign key (\"service_id\") references \"service\" (\"id\") on update cascade;");
    this.addSql("alter table \"orders\" add constraint \"orders_parent_id_foreign\" foreign key (\"parent_id\") references \"orders\" (\"id\") on update cascade on delete set null;");
    this.addSql("alter table \"orders\" add constraint \"orders_meta_id_foreign\" foreign key (\"meta_id\") references \"order_meta\" (\"id\") on update cascade;");
    this.addSql("alter table \"orders\" add constraint \"orders_client_id_foreign\" foreign key (\"client_id\") references \"order_client\" (\"id\") on update cascade;");

    this.addSql("alter table \"order_product\" add constraint \"order_product_order_id_foreign\" foreign key (\"order_id\") references \"orders\" (\"id\") on update cascade;");

    this.addSql("alter table \"order_product_modifier\" add constraint \"order_product_modifier_order_product_id_foreign\" foreign key (\"order_product_id\") references \"order_product\" (\"id\") on update cascade;");

    this.addSql("alter table \"order_product_voucher\" add constraint \"order_product_voucher_order_product_id_foreign\" foreign key (\"order_product_id\") references \"order_product\" (\"id\") on update cascade;");

    this.addSql("alter table \"order_product_custom\" add constraint \"order_product_custom_order_id_foreign\" foreign key (\"order_id\") references \"orders\" (\"id\") on update cascade;");

    this.addSql("alter table \"order_snapshot\" add constraint \"order_snapshot_order_id_foreign\" foreign key (\"order_id\") references \"orders\" (\"id\") on update cascade;");

    this.addSql("alter table \"order_status_change\" add constraint \"order_status_change_order_id_foreign\" foreign key (\"order_id\") references \"orders\" (\"id\") on update cascade;");

    this.addSql("alter table \"order_voucher\" add constraint \"order_voucher_order_id_foreign\" foreign key (\"order_id\") references \"orders\" (\"id\") on update cascade;");
    this.addSql("alter table \"order_voucher\" add constraint \"order_voucher_service_id_foreign\" foreign key (\"service_id\") references \"service\" (\"id\") on update cascade;");

    this.addSql("alter table \"order_refund\" add constraint \"order_refund_order_id_foreign\" foreign key (\"order_id\") references \"orders\" (\"id\") on update cascade;");
    this.addSql("alter table \"order_refund\" add constraint \"order_refund_service_id_foreign\" foreign key (\"service_id\") references \"service\" (\"id\") on update cascade;");

    this.addSql("alter table \"order_discount\" add constraint \"order_discount_order_id_foreign\" foreign key (\"order_id\") references \"orders\" (\"id\") on update cascade;");
    this.addSql("alter table \"order_discount\" add constraint \"order_discount_service_id_foreign\" foreign key (\"service_id\") references \"service\" (\"id\") on update cascade;");

    this.addSql("alter table \"payment\" add constraint \"payment_order_id_foreign\" foreign key (\"order_id\") references \"orders\" (\"id\") on update cascade;");
    this.addSql("alter table \"payment\" add constraint \"payment_service_id_foreign\" foreign key (\"service_id\") references \"service\" (\"id\") on update cascade;");

    this.addSql("alter table \"order_transaction_log\" add constraint \"order_transaction_log_order_id_foreign\" foreign key (\"order_id\") references \"orders\" (\"id\") on update cascade;");
    this.addSql("alter table \"order_transaction_log\" add constraint \"order_transaction_log_service_id_foreign\" foreign key (\"service_id\") references \"service\" (\"id\") on update cascade;");
  }
}
exports.Migration0 = Migration0;
