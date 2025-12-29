-- ============================================
-- Portfolio Database Schema for InfinityFree
-- Database: if0_38807577_curtisworkspace
-- ============================================
-- 
-- INSTRUCTIONS:
-- 1. Log into InfinityFree control panel
-- 2. Go to MySQL Databases > phpMyAdmin
-- 3. Select your database: if0_38807577_curtisworkspace
-- 4. Click "Import" tab at the top
-- 5. Choose this file and click "Go"
-- ============================================

-- Set charset
SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;

-- ============================================
-- CONTACTS TABLE
-- Stores contact form submissions
-- ============================================
CREATE TABLE IF NOT EXISTS `contacts` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(255) NOT NULL,
    `email` VARCHAR(255) NOT NULL,
    `subject` VARCHAR(255) DEFAULT '',
    `message` TEXT NOT NULL,
    `read` TINYINT(1) DEFAULT 0,
    `timestamp` DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- GUESTBOOK TABLE
-- Stores guestbook/testimonial entries
-- ============================================
CREATE TABLE IF NOT EXISTS `guestbook` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(255) NOT NULL,
    `message` TEXT NOT NULL,
    `company` VARCHAR(255) DEFAULT '',
    `role` VARCHAR(255) DEFAULT '',
    `status` VARCHAR(50) DEFAULT 'pending',
    `approved` TINYINT(1) DEFAULT 0,
    `timestamp` DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- BOOKINGS TABLE
-- Stores call booking requests
-- ============================================
CREATE TABLE IF NOT EXISTS `bookings` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(255) NOT NULL,
    `email` VARCHAR(255) NOT NULL,
    `phone` VARCHAR(50) DEFAULT '',
    `preferred_date` VARCHAR(50) DEFAULT '',
    `preferred_time` VARCHAR(50) DEFAULT '',
    `timezone` VARCHAR(100) DEFAULT '',
    `topic` VARCHAR(255) DEFAULT '',
    `message` TEXT DEFAULT NULL,
    `status` VARCHAR(50) DEFAULT 'pending',
    `timestamp` DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- RESUME REQUESTS TABLE
-- Stores resume download requests
-- ============================================
CREATE TABLE IF NOT EXISTS `resume_requests` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(255) NOT NULL,
    `email` VARCHAR(255) NOT NULL,
    `company` VARCHAR(255) DEFAULT '',
    `reason` TEXT DEFAULT NULL,
    `fulfilled` TINYINT(1) DEFAULT 0,
    `timestamp` DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- SUCCESS MESSAGE
-- ============================================
-- All tables created successfully!
-- Tables: contacts, guestbook, bookings, resume_requests
