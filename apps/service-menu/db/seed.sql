-- insert categories
insert into category (name, start_date, end_date)
values ('Breakfast', '2000-01-01', '2020-01-01'),
('Lunch & Dinner', null, null);
-- insert subcategories
insert into category (name, parent_category_id)
values
('Omelette', 1),
('Sandwich', 1),
('Burger', 1),
('Pizza', 2),
('Alcohol', 2),
('Beverages', 2);

--insert modifiers
insert into modifier (name, multiselect)
values ('Modifier1', false),
('Modifier2', false),
('Modifier3', true);

insert into modifier_option (name, price, modifier_id)
values ('Mod1Opt1', 1, 1),
('Mod1Opt2', 1, 1),
('Mod1Opt3', 2, 1),
('Mod2Opt1', 2, 2),
('Mod2Opt2', 4, 2),
('Mod2Opt3', 1, 2),
('Mod3Opt1', 5, 3);

insert into label (name)
values ('Label1'),
('Label2'),
('Label3');

--insert products
insert into product (name, price, image, image_base_url)
values('Product1', 5, 'N/A', 'N/A');
insert into product_category (product_id, category_id)
values(1, 3); --one omelette
insert into product_category (product_id, category_id)
values(1, 4); --one omelette
insert into product_labels (product_id, label_id)
values(1,1);
insert into product_labels (product_id, label_id)
values(1,3);

insert into product (name, price, image, image_base_url)
values('Product2', 5, 'N/A', 'N/A');
insert into product_category (product_id, category_id)
values(2, 3); -- one sandwich
insert into product_labels (product_id, label_id)
values(2,1);
insert into product_labels (product_id, label_id)
values(2,2);

insert into product (name, price, image, image_base_url)
values('Product3', 5, 'N/A', 'N/A');
insert into product_category (product_id, category_id)
values(3, 3); -- one burger
insert into product_modifier (product_id, modifier_id)
values(3, 3);
insert into product_modifier (product_id, modifier_id)
values(3, 2);
insert into product_modifier (product_id, modifier_id)
values(3, 1);
insert into product_labels (product_id, label_id)
values(3,1);
insert into product_labels (product_id, label_id)
values(3,2);
insert into product_labels (product_id, label_id)
values(3,3);

insert into product (name, price, image, image_base_url)
values('Product4', 5, 'N/A', 'N/A');
insert into product_category (product_id, category_id)
values(4, 4); --one pizza
insert into product_modifier (product_id, modifier_id)
values(4, 2);

insert into product (name, price, image, image_base_url)
values('Product5', 5, 'N/A', 'N/A');
insert into product_category (product_id, category_id)
values(5, 5); --one alcohol


insert into product (name, price, image, image_base_url)
values('Product6', 5, 'N/A', 'N/A');
insert into product_category (product_id, category_id)
values(6, 6); -- one beverage
insert into product_modifier (product_id, modifier_id)
values(6, 3);

insert into product (name, price, image, image_base_url)
values('Product7', 5, 'N/A', 'N/A');
insert into product_category (product_id, category_id)
values(7, 5); -- one beverage
insert into product_modifier (product_id, modifier_id)
values(7, 1);

insert into product (name, price, image, image_base_url)
values('Product8', 5, 'N/A', 'N/A');
insert into product_category (product_id, category_id)
values(8, 4); --one pizza
insert into product_modifier (product_id, modifier_id)
values(8, 2);
insert into product_modifier (product_id, modifier_id)
values(8, 3);

insert into product (name, price, image, image_base_url)
values('Product9', 5, 'N/A', 'N/A');
insert into product_category (product_id, category_id)
values(9, 3); --one omelette
insert into product_modifier (product_id, modifier_id)
values(9, 1);

insert into product (name, price, image, image_base_url)
values('Product10', 5, 'N/A', 'N/A');
insert into product_category (product_id, category_id)
values(10, 4); --one sandwich
insert into product_modifier (product_id, modifier_id)
values(10, 1);
insert into product_modifier (product_id, modifier_id)
values(10, 2);


insert into hub (id, name)
values(1, 'Hub1');
insert into hub (id, name)
values(2, 'Hub2');
insert into hub (id, name)
values(3, 'Hub3');

insert into hotel (id, name, hub_id)
values(1, 'Hotel1', 1);
insert into hotel (id, name, hub_id)
values(2, 'Hotel2', 1);
insert into hotel (id, name, hub_id)
values(3, 'Hotel3', 2);
insert into hotel (id, name, hub_id)
values(4, 'Hotel4', 3);

insert into menu (name, status)
values ('Menu1', 'ACTIVE'),
('Menu2', 'INACTIVE'),
('Menu3', 'INACTIVE');

-- insert for menu1
insert into product_menu (product_id, menu_id, category_id, price)
values(1, 1, 3, null),
(2, 1, 3, null),
(3, 1, 4, null),
(4, 1, 4, 5),
(5, 1, 5, null),
(6, 1, 5, null),
(7, 1, 6, null),
(8, 1, 6, null),
(9, 1, 7, null),
(10, 1, 7, null),
-- insert for menu2
(1, 2, 3, null),
(2, 2, 3, null),
(3, 2, 3, null),
(4, 2, 4, null),
(5, 2, 5, null),
(6, 2, 4, null),
(7, 2, 6, null),
(8, 2, 7, null),
(9, 2, 8, null),
(10, 2, 8, null),
-- insert for menu3
(1, 3, 4, null),
(2, 3, 4, null),
(3, 3, 4, null),
(4, 3, 4, null),
(5, 3, 5, null),
(6, 3, 6, null),
(7, 3, 8, null),
(8, 3, 8, null),
(9, 3, 8, null),
(10, 3, 5, null);


insert into menu_hotel (hotel_id, menu_id)
values(1, 1),
(2, 1),
(3, 2);


insert into out_of_stock (product_id, hub_id, available_at)
values (1, 1, now() + '4 hours'),
(1, 2, now() + '4 hours'),
(1, 3, now() + '4 hours'),
(2, 1, now() + '4 hours'),
(3, 1, now() + '4 hours');
