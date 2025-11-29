DROP DATABASE IF EXISTS pg_booking;
CREATE DATABASE pg_booking;
USE pg_booking;

-- USERS TABLE
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    phone VARCHAR(15) NOT NULL,
    role ENUM('user', 'admin') DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- ROOMS TABLE
CREATE TABLE rooms (
    id INT PRIMARY KEY AUTO_INCREMENT,
    room_number INT UNIQUE NOT NULL,
    room_type VARCHAR(50) NOT NULL,
    beds INT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    available BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- BOOKINGS TABLE (Simple meals = BOOLEAN + meal_price)
CREATE TABLE bookings (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    student_name VARCHAR(100) NOT NULL,
    phone VARCHAR(15) NOT NULL,
    room_id INT NOT NULL,
    meals BOOLEAN DEFAULT FALSE,
    meal_price DECIMAL(10,2) DEFAULT 0,
    total_price DECIMAL(10,2) NOT NULL,
    booking_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('active', 'cancelled', 'completed') DEFAULT 'active',
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- COMPLAINTS TABLE
CREATE TABLE complaints (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    student_name VARCHAR(100) NOT NULL,
    phone VARCHAR(15) NOT NULL,
    complaint_type VARCHAR(50) NOT NULL,
    description TEXT NOT NULL,
    status ENUM('Pending', 'In Progress', 'Resolved', 'Closed') DEFAULT 'Pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- INSERT ROOMS (6 Rooms)
INSERT INTO rooms (room_number, room_type, beds, price) VALUES
(101, 'Single Bed Room', 1, 8000),
(102, 'Single Bed Room', 1, 8000),
(201, 'Double Bed Room', 2, 6000),
(202, 'Double Bed Room', 2, 6000),
(301, 'Double Bed Room AC', 2, 9000),
(302, 'Double Bed Room AC', 2, 9000);

-- ADMIN USER
INSERT INTO users (username, password, full_name, phone, role)
VALUES ('admin', 'admin123', 'Administrator', '9999999999', 'admin');

-- TEST USER
INSERT INTO users (username, password, full_name, phone, role)
VALUES ('test', 'test123', 'Test User', '1234567890', 'user');
