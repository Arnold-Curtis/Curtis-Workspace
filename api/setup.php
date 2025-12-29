<?php
/**
 * Database Setup Script
 * Run this ONCE to create all required tables
 * Access via: https://yourdomain.com/api/setup.php
 * DELETE THIS FILE after setup for security!
 */

require_once 'config.php';

try {
    // Detect database type from config
    global $DB_TYPE;
    $isPostgres = ($DB_TYPE === 'pgsql');
    
    if ($isPostgres) {
        // PostgreSQL syntax
        $pdo->exec("
            CREATE TABLE IF NOT EXISTS contacts (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                email VARCHAR(255) NOT NULL,
                subject VARCHAR(255) DEFAULT '',
                message TEXT NOT NULL,
                read BOOLEAN DEFAULT FALSE,
                timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ");
        
        $pdo->exec("
            CREATE TABLE IF NOT EXISTS guestbook (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                message TEXT NOT NULL,
                company VARCHAR(255) DEFAULT '',
                role VARCHAR(255) DEFAULT '',
                status VARCHAR(50) DEFAULT 'pending',
                approved BOOLEAN DEFAULT FALSE,
                timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ");
        
        $pdo->exec("
            CREATE TABLE IF NOT EXISTS bookings (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                email VARCHAR(255) NOT NULL,
                phone VARCHAR(50) DEFAULT '',
                preferred_date VARCHAR(50) DEFAULT '',
                preferred_time VARCHAR(50) DEFAULT '',
                timezone VARCHAR(100) DEFAULT '',
                topic VARCHAR(255) DEFAULT '',
                message TEXT DEFAULT '',
                status VARCHAR(50) DEFAULT 'pending',
                timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ");
        
        $pdo->exec("
            CREATE TABLE IF NOT EXISTS resume_requests (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                email VARCHAR(255) NOT NULL,
                company VARCHAR(255) DEFAULT '',
                reason TEXT DEFAULT '',
                fulfilled BOOLEAN DEFAULT FALSE,
                timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ");
    } else {
        // MySQL syntax
        $pdo->exec("
            CREATE TABLE IF NOT EXISTS contacts (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                email VARCHAR(255) NOT NULL,
                subject VARCHAR(255) DEFAULT '',
                message TEXT NOT NULL,
                `read` TINYINT(1) DEFAULT 0,
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
        ");
        
        $pdo->exec("
            CREATE TABLE IF NOT EXISTS guestbook (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                message TEXT NOT NULL,
                company VARCHAR(255) DEFAULT '',
                role VARCHAR(255) DEFAULT '',
                status VARCHAR(50) DEFAULT 'pending',
                approved TINYINT(1) DEFAULT 0,
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
        ");
        
        $pdo->exec("
            CREATE TABLE IF NOT EXISTS bookings (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                email VARCHAR(255) NOT NULL,
                phone VARCHAR(50) DEFAULT '',
                preferred_date VARCHAR(50) DEFAULT '',
                preferred_time VARCHAR(50) DEFAULT '',
                timezone VARCHAR(100) DEFAULT '',
                topic VARCHAR(255) DEFAULT '',
                message TEXT DEFAULT '',
                status VARCHAR(50) DEFAULT 'pending',
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
        ");
        
        $pdo->exec("
            CREATE TABLE IF NOT EXISTS resume_requests (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                email VARCHAR(255) NOT NULL,
                company VARCHAR(255) DEFAULT '',
                reason TEXT DEFAULT '',
                fulfilled TINYINT(1) DEFAULT 0,
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
        ");
    }
    
    sendResponse([
        'success' => true,
        'message' => 'All database tables created successfully!',
        'database_type' => $isPostgres ? 'PostgreSQL' : 'MySQL',
        'tables' => ['contacts', 'guestbook', 'bookings', 'resume_requests'],
        'warning' => 'DELETE THIS FILE (setup.php) for security!'
    ]);
    
} catch(PDOException $e) {
    sendResponse([
        'success' => false,
        'error' => 'Failed to create tables',
        'details' => $e->getMessage()
    ], 500);
}
?>
