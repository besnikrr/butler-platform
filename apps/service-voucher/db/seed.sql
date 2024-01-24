-- Insert Hubs
INSERT INTO hub (id, name, active)
VALUES (1, 'New York Hub', true),
       (2, 'Los Angeles Hub', true),
       (3, 'Washington Hub', true),
       (4, 'Tampa Hub Hub', true);

-- Insert Hotels
INSERT INTO hotel (id, name, active, hub_id, deleted_at)
VALUES (1, 'Millennium Downtown New York City', true, 1, null),
       (2, 'Millennium Downtown LA', true, 2, null),
       (3, 'China Town', true, 3, now()),
       (4, 'Old Highway', true, 1, now());

-- Insert categories
INSERT INTO category (id, name, parent_category_id, start_date, end_date)
VALUES (1, 'Breakfast', null, '2000-01-01', '2020-01-01'),
       (2, 'Lunch & Dinner', null, null, null);

-- Insert subcategories
INSERT INTO category (id, name, parent_category_id, start_date, end_date)
VALUES (3, 'Omelette', 1, null, null),
       (4, 'Sandwich', 1, null, null),
       (5, 'Burger', 1, null, null),
       (6, 'Pizza', 2, null, null),
       (7, 'Alcohol', 2, null, null),
       (8, 'Beverages', 2, null, null);

-- Insert Program
INSERT INTO program  (name, description, type, status, payer, payer_percentage, amount, amount_type, code_limit) VALUES
('Test Program 1', 'Some notes for 1', 'DISCOUNT', 'ACTIVE', 'BUTLER', 100, 30, 'PERCENTAGE', 100),
('Test Program 2', 'Some notes for 2', 'PRE_FIXE', 'ACTIVE', 'BUTLER', 100, 30, 'PERCENTAGE', 100),
('Test Program 3', 'Some notes for 3', 'PRE_FIXE', 'ACTIVE', 'BUTLER', 100, 30, 'PERCENTAGE', 100),
('Test Program 4', 'Some notes for 4', 'PER_DIEM', 'ACTIVE', 'BUTLER', 100, 30, 'FIXED', 100),
('Test Program 5', 'Some notes for 5', 'PER_DIEM', 'ACTIVE', 'BUTLER', 100, 30, 'FIXED', 100),
('Test Program 1', 'Some notes for 1', 'DISCOUNT', 'ACTIVE', 'BUTLER', 100, 30, 'PERCENTAGE', 100),
('Test Program 2', 'Some notes for 2', 'PRE_FIXE', 'ACTIVE', 'BUTLER', 100, 30, 'PERCENTAGE', 100),
('Test Program 3', 'Some notes for 3', 'PRE_FIXE', 'ACTIVE', 'BUTLER', 100, 30, 'PERCENTAGE', 100),
('Test Program 4', 'Some notes for 4', 'PER_DIEM', 'ACTIVE', 'BUTLER', 100, 30, 'FIXED', 100),
('Test Program 5', 'Some notes for 5', 'DISCOUNT', 'INACTIVE', 'BUTLER', 100, 30, 'FIXED', 100),
('Test Program 6', 'Some notes for 5', 'DISCOUNT', 'INACTIVE', 'BUTLER', 100, 30, 'FIXED', 100);


-- Insert program hotel
INSERT INTO program_hotel (program_id, hotel_id)
VALUES (1, 1),
       (2, 1),
       (3, 1),
       (4, 2),
       (5, 2),
       (10, 1);

-- Insert Rules
INSERT INTO rule (program_id, quantity, max_price)
VALUES (2, 5, 10),
       (2, 10, 15.5),
       (3, 100, 110),
       (3, 50, 10.65);

-- Insert Rule category
INSERT INTO rule_category (rule_id, category_id)
VALUES (1, 3),
       (1, 4),
       (2, 3),
       (3, 5),
       (3, 6),
       (4, 7);

-- Insert Code
INSERT INTO code (id, code, program_id, order_id, hotel_id, claimed_date) VALUES
(1, 'XYXY1', 1, null, 1, current_date),
(2, 'XYXY2', 1, null, 1, NULL),
(3, 'XYXY3', 1, null, 1, null),
(4, 'XYXY4', 2, null, 1, null),
(5, 'XYXY5', 2, null, 1, null),
(6, 'XYXY6', 5, null, 2, null),
(7, 'XYXY7', 5, null, 2, null),
(8, 'XYXY8', 5, null, 2, null),
(9, 'XYXY9', 4, null, 1, current_date - 3),
(10, 'XYXY10', 11, null, 1, null);

