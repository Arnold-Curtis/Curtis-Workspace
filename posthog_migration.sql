-- ============================================
-- PostHog Analytics Migration
-- Run this script on InfinityFree MySQL to add analytics tables
-- ============================================

-- ============================================
-- USERS TABLE (PostHog Identity Tracking)
-- Links PostHog distinct_id to user actions
-- ============================================
CREATE TABLE IF NOT EXISTS `users` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `posthog_distinct_id` VARCHAR(255) UNIQUE,
    `name` VARCHAR(255) DEFAULT '',
    `email` VARCHAR(255) DEFAULT '',
    `first_seen` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `last_seen` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_posthog_id (`posthog_distinct_id`),
    INDEX idx_email (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- ANALYTICS METRICS TABLE (PostHog Aggregated Data)
-- Stores synced metrics from PostHog API
-- ============================================
CREATE TABLE IF NOT EXISTS `analytics_metrics` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `user_id` INT,
    `total_visits` INT DEFAULT 0,
    `total_pageviews` INT DEFAULT 0,
    `session_count` INT DEFAULT 0,
    `avg_session_duration` INT DEFAULT 0,
    `engagement_score` DECIMAL(5,2) DEFAULT 0.00,
    `last_session_replay_url` VARCHAR(512) DEFAULT NULL,
    `last_activity` DATETIME DEFAULT NULL,
    `synced_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
    INDEX idx_user_id (`user_id`),
    INDEX idx_last_activity (`last_activity`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- SUCCESS!
-- Tables added: users, analytics_metrics
-- ============================================
