insert into iam_user (id, name, email, created_at) values
(2, 'John Doe', 'john.doe@test.com', 'now()'),
(3, 'Mike King', 'mike.king@test.com', 'now()');

insert into city (name, state, time_zone, created_at) values
('New York', 'New York - NY', 'America/New_York', now()),
('Los Angeles', 'Los Angeles - LA', 'America/Los_Angeles', now()),
('Massachusetts', 'Massachusetts', 'America/Massachusetts', now());

insert into hub (name, color, city_id, active, contact_email, contact_phone, address_town, address_street, address_number, address_zip_code, address_coordinates, tax_rate, created_at) values
('New York Hub', '#e26969', 1, true, 'test@butlerhospitality.com', '+1123456', 'New York', 'New York street', 100, '10001', '1, 1', 20, now()),
('Los Angeles Hub', '#b869e2', 1, true, 'test@butlerhospitality.com', '+1123457', 'Los Angeles', 'Los Angeles street', 100, '10001', '1, 1', 20, now()),
('Washington Hub', '#3b6287', 1, true, 'test@butlerhospitality.com', '+1123457', 'Los Angeles', 'Los Angeles street', 100, '10001', '1, 1', 20, now()),
('Tampa Hub', '#9b9712', 1, true, 'test@butlerhospitality.com', '+1123457', 'Florida', 'Tampa street', 100, '10001', '1, 1', 20, now());

insert into hotel(name, code, formal_name, address_town, address_street, address_number, web_code, account_manager_id, contact_person, web_phone, contact_email, web_url_id, delivery_instructions, address_coordinates, hub_id, active, room_count, room_numbers, address_zip_code, allow_payment_credit_card, phone_number, created_at, deleted_at) values
('Millennium Downtown New York City', '1', 'Millennium Downtown', 'New York City', 'Church St', '47', '1', 2, 'John Doe', '+11234567', 'test@butlerhospitality.com', 'millennium', 'Millennium Downtown New York City', '40.711115, -74.0108802', 1, true, 200, '["A-839"]', '10001', true, '+38345479940', now(), null),
('Millennium Downtown LA', '2', 'Millennium Downtown', 'New York City', 'Church St', '47', '2', 2, 'John Doe', '+11234567', 'test@butlerhospitality.com', 'millenniumLA', 'Millennium Downtown New York City', '40.711115, -74.0108802', 2, true, 200, '["A-839", "A-2"]', '10001', false, '+38345479940', now(), null),
('China Town', '4', 'China Town', 'New York City', 'Church St', '47', '4', 2, 'John Doe', '+11234567', 'test@butlerhospitality.com', 'millenniumtest2', 'Millennium Downtown New York City', '40.711115, -74.0108802', 3, true, 200, '["A-839"]', '10001', false, '+38345479940', now(), now()),
('Old Highway', '5', 'Old Highway', 'New York City', 'Church St', '47', '5', 2, 'John Doe', '+11234567', 'test@butlerhospitality.com', 'millenniumtest3', 'Millennium Downtown New York City', '40.711115, -74.0108802', 1, true, 200, '["A-839"]', '10001', false, '+38345479940', now(), now());



