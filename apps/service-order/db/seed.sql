INSERT INTO service_type (name)
VALUES ('ORDER');


INSERT INTO service (service_type_id, name)
VALUES (1, 'Room Service');


INSERT INTO iam_user (user_id, name, email, carrier_status, ROLE)
VALUES (1, 'Butler One', 'butlerone@butler.com', 'OUT_FOR_DELIVERY', 'FOOD_CARRIER'),
       (2, 'Butler Two', 'butlertwo@butler.com', 'OUT_FOR_DELIVERY', 'DISPATCHER'),
       (3, 'Butler Three', 'butlerthree@butler.com', 'OUT_FOR_DELIVERY', 'FOOD_CARRIER'),
       (4, 'Butler Four', 'butlerfour@butler.com', 'ON_SITE', 'FOOD_CARRIER'),
       (5, 'Butler Five', 'butlerfive@butler.com', 'ON_SITE', 'FOOD_CARRIER');


INSERT INTO order_meta (hub_id, hub_name, hub_color, hotel_id, hotel_name, room_number, cutlery, food_carrier_id, pms_id)
VALUES (1, 'Hub1', '#e26969', 1, 'Hotel1', '102A', 1, 1, null),
       (1, 'Hub1', '#e26969', 1, 'Hotel1', '102B', 1, 2, null),
       (1, 'Hub1', '#e26969', 1, 'Hotel1', '102C', 1, 1, null),
       (1, 'Hub1', '#e26969', 1, 'Hotel1', '102D', 1, 1, 1),
       (1, 'Hub1', '#e26969', 1, 'Hotel1', '102A', 1, null, null),
       (1, 'Hub1', '#e26969', 1, 'Hotel1', '102A', 1, 5, null);



INSERT INTO order_client (name, phone_number, email)
VALUES ('Client1', '+111111111', 'dummyclient1@butlerhospitality.com'),
       ('Client2', '+111111112', 'dummyclient2@butlerhospitality.com'),
       ('Client3', '+111111113', 'dummyclient3@butlerhospitality.com'),
       ('Client4', '+111111114', 'dummyclient4@butlerhospitality.com'),
       ('Client5', '+111111115', 'dummyclient5@butlerhospitality.com'),
       ('Client6', '+111111116', 'dummyclient6@butlerhospitality.com');


INSERT INTO
  orders (
    service_id,
    number,
    TYPE,
    STATUS,
    payment_type,
    meta_id,
    client_id,
    tax,
    tip,
    total_gross,
    total_net,
    grand_total,
    receipt_amount,
    confirmed_date,
    source,
    transaction_id,
    scheduled_date
  )
VALUES
  (
    1,
    1,
    'ROOM_SERVICE',
    'PENDING',
    'CHARGE_TO_ROOM',
    1,
    1,
    1.80,
    2.00,
    11.80,
    10.00,
    13.80,
    10.00,
    NOW(),
    'WEB',
    'zBaZp5snY04D4kSf5GvbgOzTA2WJZY',
    null
  ),
  (
    1,
    2,
    'ROOM_SERVICE',
    'PREPARATION',
    'CHARGE_TO_ROOM',
    2,
    2,
    1.80,
    2.00,
    11.80,
    10.00,
    13.80,
    10.00,
    NOW(),
    'WEB',
    'zBaZp5snY04D4kSf5GvbgOzTNACRY',
    null
  ),
  (
    1,
    3,
    'ROOM_SERVICE',
    'IN_DELIVERY',
    'CHARGE_TO_ROOM',
    3,
    3,
    1.80,
    2.00,
    11.80,
    10.00,
    13.80,
    10.00,
    NOW(),
    'WEB',
    'zBaZp5snY04D4kSf5GvbgOzTNACRY',
    null
  ),
  (
    1,
    4,
    'ROOM_SERVICE',
    'IN_DELIVERY',
    'CHARGE_TO_ROOM',
    4,
    4,
    1.80,
    0.00,
    11.80,
    10.00,
    13.80,
    10.00,
    NOW(),
    'WEB',
    'zBaZp5snY04D4kSf5GvbgOzT2G3RY',
    null
  ),
    (1, 4, 'ROOM_SERVICE', 'PREPARATION', 'CHARGE_TO_ROOM', 5, 5, 1.80, 3.00, 16.80, 15.00, 13.80, 10.00, NOW(), 'WEB', null, null),
    (1, 6, 'ROOM_SERVICE', 'SCHEDULED', 'CHARGE_TO_ROOM', 6, 6, 1.80, 3.00, 16.80, 15.00, 13.80, 10.00, NOW(), 'WEB', null, '2022-05-11T11:45:00.000Z');

INSERT INTO payment (order_id, service_id, payment_type, status, transaction_id, tip, tax, total_net, total_gross, grand_total, hotel_tax, hotel_total_net, hotel_total_gross, hotel_grand_total, receipt_amount)
VALUES (1, 1, 'CREDIT_CARD', 'SUCCESS', 'awfs112dfs-w343fsdf-233', 15.8, 25.2, 52.6, 85.5, 100.2, 25.0, 14.0, 16.2, 64, 100);



INSERT INTO order_status_change (order_id, user_id, STATUS)
VALUES (1, 1, 'PENDING');


INSERT INTO order_product (order_id, category_id, category_name, product_id, name, original_price, price, quantity)
VALUES (1, 1, 'Category1', 1, 'Product1', 5.00, 5.00, 1),
       (1, 1, 'Category1', 2, 'Product2', 10.00, 10.00, 2),
       (1, 2, 'Category2', 3, 'Product3', 7.00, 0.00, 1);

INSERT INTO order_product_custom (order_id, name, price, quantity)
VALUES (1, 'CustomProduct1', 5.00, 1),
       (1, 'CustomProduct2', 10.00, 2),
       (1, 'CustomProduct3', 14.00, 1);
       
       

INSERT INTO order_product_voucher (order_product_id, voucher_code, voucher_code_id, rule_max_item_price, rule_id)
VALUES (3, 'A100', 1, 10.00, 1);


INSERT INTO order_product_modifier (order_product_id, modifier_id, modifier_name, modifier_option_id, modifier_option_name, modifier_option_price, quantity)
VALUES (1, 1, 'Modifier1', 1, 'Modifier1Option1', 5.00, 1),
       (1, 1, 'Modifier1', 1, 'Modifier1Option2', 3.00, 2);


INSERT INTO order_voucher (id, program_id, order_id, TYPE, amount, code_id, service_id, code)
VALUES (1, 1, 1, 'DISCOUNT', 30, 1, 1, 'XYXY1'),
       (3, 5, 3, 'PER_DIEM', 90, 7, 1, 'XYXY7');
