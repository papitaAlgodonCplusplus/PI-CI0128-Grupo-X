CREATE SCHEMA hotel;
CREATE TABLE hotel.users (
    userid INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
	last_name VARCHAR(50) NOT NULL,
	email VARCHAR(100) UNIQUE NOT NULL,
	password VARCHAR(100) NOT NULL
);

CREATE TABLE hotel.establishment (
	politics VARCHAR(200) DEFAULT '',
    services VARCHAR(100),
	fee FLOAT
);

CREATE TABLE hotel.categories (
	categoryid INT AUTO_INCREMENT PRIMARY KEY,
    class_name VARCHAR(50) NOT NULL UNIQUE,
    rooms_number INT NOT NULL,
    price FLOAT NOT NULL DEFAULT 0
);

CREATE TABLE hotel.payments (
	paymentid INT AUTO_INCREMENT PRIMARY KEY,
    method VARCHAR(50),
	price FLOAT NOT NULL DEFAULT 0
);

CREATE TABLE hotel.reservations (
	reservationid INT PRIMARY KEY AUTO_INCREMENT,
	check_in DATETIME NOT NULL,
    check_out DATETIME NOT NULL,
    user_id INT,
    payment_id INT UNIQUE,
    FOREIGN KEY (user_id) REFERENCES hotel.users(userid),
    FOREIGN KEY (payment_id) REFERENCES hotel.payments(paymentid)
);

CREATE TABLE hotel.rooms (
	roomid INT AUTO_INCREMENT PRIMARY KEY,
    type_of_room INT,
    FOREIGN KEY (type_of_room) REFERENCES hotel.categories(categoryid)
);

CREATE TABLE hotel.administators_permissions (
    adminid INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNIQUE,
    permissions VARCHAR(50),
    FOREIGN KEY (user_id) REFERENCES hotel.users(userid)
);

CREATE VIEW hotel.administrators AS
SELECT *
FROM hotel.users
JOIN hotel.administators_permissions ON hotel.users.userid = hotel.administators_permissions.user_id;

CREATE TABLE hotel.employees_roles (
    empoyeeid INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNIQUE,
    roles VARCHAR(50),
    FOREIGN KEY (user_id) REFERENCES hotel.users(userid)
);

CREATE VIEW hotel.employees AS
SELECT *
FROM hotel.users
JOIN hotel.employees_roles ON hotel.users.userid = hotel.employees_roles.user_id;
CREATE TABLE hotel.client_privileges (
    clientid INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNIQUE,
    client_privileges VARCHAR(50),
    FOREIGN KEY (user_id) REFERENCES hotel.users(userid)
);

CREATE VIEW hotel.clients AS
SELECT *
FROM hotel.users
JOIN hotel.client_privileges ON hotel.users.userid = hotel.client_privileges.user_id;

ALTER TABLE hotel.reservations
ADD COLUMN id_room INT;

ALTER TABLE hotel.reservations
ADD CONSTRAINT reservations_ibfk_3
FOREIGN KEY (id_room)
REFERENCES hotel.rooms(roomid);

ALTER TABLE hotel.reservations
ADD CONSTRAINT check_datetime_order
CHECK (check_in < check_out);

DROP TABLE hotel.administators_permissions;
DROP VIEW hotel.administrators;
DROP TABLE hotel.client_privileges;
DROP VIEW hotel.clients;
DROP TABLE hotel.employees_roles;
DROP VIEW hotel.employees;
DROP TABLE hotel.establishment;

CREATE TABLE hotel.services (
	serviceid INT AUTO_INCREMENT PRIMARY KEY,
    service_name VARCHAR(50) NOT NULL,
    service_price FLOAT NOT NULL DEFAULT 0
);

CREATE TABLE hotel.services_log (
	service_id INT auto_increment primary key not null,
	reservationid int not null,
    FOREIGN KEY (reservationid) REFERENCES hotel.reservations(reservationid),
    FOREIGN KEY (service_id) REFERENCES hotel.services(serviceid)
);

ALTER TABLE hotel.users
ADD COLUMN rol VARCHAR(50);

CREATE TABLE hotel.images (
    imageid INT AUTO_INCREMENT PRIMARY KEY,
    filename VARCHAR(255) NOT NULL,
    filepath VARCHAR(255) NOT NULL,
    description TEXT,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE hotel.rooms
ADD COLUMN image_id INT;

ALTER TABLE hotel.rooms
ADD CONSTRAINT rooms_ibfk_2
FOREIGN KEY (image_id)
REFERENCES hotel.images(imageid);

ALTER TABLE hotel.rooms
ADD COLUMN description TEXT,
ADD COLUMN title VARCHAR(50);

ALTER TABLE hotel.payments
DROP COLUMN method,
ADD COLUMN id_method INT;

CREATE TABLE hotel.cash (
	paymentid INT AUTO_INCREMENT PRIMARY KEY,
    change_amount FLOAT NOT NULL DEFAULT 0
); 

CREATE TABLE hotel.card (
	paymentid INT AUTO_INCREMENT PRIMARY KEY,
    card_type VARCHAR(50) 
); 

CREATE TABLE hotel.transaction (
	paymentid INT AUTO_INCREMENT PRIMARY KEY,
    bank VARCHAR(50) 
); 

ALTER TABLE hotel.rooms
DROP CONSTRAINT rooms_ibfk_1;

ALTER TABLE hotel.rooms
DROP COLUMN type_of_room;

ALTER TABLE hotel.rooms
ADD COLUMN type_of_room INT;

ALTER TABLE hotel.rooms
ADD CONSTRAINT rooms_ibfk_1
FOREIGN KEY (type_of_room)
REFERENCES hotel.categories(categoryid);

ALTER TABLE hotel.categories
DROP COLUMN rooms_number;

ALTER TABLE hotel.services_log
DROP CONSTRAINT services_log_ibfk_1;

ALTER TABLE hotel.services_log
RENAME COLUMN reservationid TO reservation_id;

SELECT * FROM hotel.users;
INSERT INTO hotel.users(name, last_name, email, password, rol) VALUES ('ALEX', 'QUESADA', "alexquesada24@gmail.com", "$2a$10$aa2fg5WyfDgKLvOnWte89OwiImvhiUKxhnGBcZeXNHaGqZK01ijR2", "admin")