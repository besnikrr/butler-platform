INSERT INTO discount (name, code, amount, start_date, end_date, TYPE, USAGE, unlock_limit)
VALUES ('Discount1', 'DC101', 25.00, NOW(), NULL, 'AMOUNT', 'SINGLE_USE', 0.00),
       ('Discount2', 'DC102', 50.00, NOW(), NOW() + interval '1 year', 'AMOUNT', 'MULTIPLE_USE', 0.00),
       ('Discount3', 'DC103', 50.00, NOW(), NOW() + interval '2 years', 'PERCENTAGE', 'MULTIPLE_USE', 0.00),
       ('Discount4', 'DC104', 100.00, NOW(), NOW() + interval '3 years', 'AMOUNT', 'DOLLAR_ALLOTMENT', 50.00);


INSERT INTO hub (id, name, active)
VALUES (1, 'Hub1', TRUE),
       (2, 'Hub2', TRUE),
       (3, 'Hub3', TRUE);


INSERT INTO discount_hub (discount_id, hub_id)
VALUES (1, 1),
       (1, 2),
       (2, 2),
       (2, 3),
       (3, 1),
       (3, 3);

INSERT INTO discount_client (discount_id, amount_used, client_phone_number)
VALUES (1, 10.00, '+11111111'),
       (1, 15.00, '+11111111'),
       (2, 50.00, '+11111111');