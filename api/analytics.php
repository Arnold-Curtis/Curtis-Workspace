<?php
/**
 * Analytics API Endpoint
 * Provides aggregated analytics data for the Admin Dashboard
 */

require_once 'config.php';
require_once 'db-helpers.php';

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? 'dashboard';

// Load PostHog configuration
$posthogConfig = file_exists(__DIR__ . '/posthog-config.php')
    ? include __DIR__ . '/posthog-config.php'
    : [];

try {
    switch ($action) {
        case 'dashboard':
            // Get dashboard overview metrics
            $stats = [];

            // Total users tracked
            $stmt = $pdo->query("SELECT COUNT(*) as total FROM users");
            $stats['total_users'] = $stmt->fetch()['total'];

            // Users with analytics data
            $stmt = $pdo->query("SELECT COUNT(*) as total FROM analytics_metrics");
            $stats['users_with_metrics'] = $stmt->fetch()['total'];

            // Average engagement score
            $stmt = $pdo->query("SELECT AVG(engagement_score) as avg_score FROM analytics_metrics");
            $stats['avg_engagement'] = round($stmt->fetch()['avg_score'] ?? 0, 2);

            // Total sessions tracked
            $stmt = $pdo->query("SELECT SUM(session_count) as total FROM analytics_metrics");
            $stats['total_sessions'] = $stmt->fetch()['total'] ?? 0;

            // Recent activity (last 7 days)
            $dateSubtract = getDateSubtract('7 days');
            $stmt = $pdo->query("
                SELECT COUNT(*) as active_users 
                FROM analytics_metrics 
                WHERE last_activity >= $dateSubtract
            ");
            $stats['active_users_7d'] = $stmt->fetch()['active_users'];

            // Conversion metrics from existing tables
            $stmt = $pdo->query("SELECT COUNT(*) as total FROM contacts");
            $stats['total_contacts'] = $stmt->fetch()['total'];

            $stmt = $pdo->query("SELECT COUNT(*) as total FROM guestbook");
            $stats['total_guestbook'] = $stmt->fetch()['total'];

            $stmt = $pdo->query("SELECT COUNT(*) as total FROM bookings");
            $stats['total_bookings'] = $stmt->fetch()['total'];

            $stmt = $pdo->query("SELECT COUNT(*) as total FROM resume_requests");
            $stats['total_resume_requests'] = $stmt->fetch()['total'];

            // Last sync time
            $stmt = $pdo->query("SELECT MAX(synced_at) as last_sync FROM analytics_metrics");
            $stats['last_sync'] = $stmt->fetch()['last_sync'];

            sendResponse($stats);
            break;

        case 'users':
            // Get user list with engagement metrics
            $stmt = $pdo->query("
                SELECT 
                    u.id,
                    u.posthog_distinct_id,
                    u.name,
                    u.email,
                    u.first_seen,
                    u.last_seen,
                    am.total_visits,
                    am.total_pageviews,
                    am.session_count,
                    am.avg_session_duration,
                    am.engagement_score,
                    am.last_session_replay_url,
                    am.last_activity
                FROM users u
                LEFT JOIN analytics_metrics am ON u.id = am.user_id
                ORDER BY am.last_activity DESC, u.last_seen DESC
                LIMIT 100
            ");
            $users = $stmt->fetchAll();
            sendResponse($users);
            break;

        case 'activity':
            // Get daily activity for charts (last 30 days)
            $dateSubtract = getDateSubtract('30 days');
            $dateCol = getDateColumn('last_activity');
            $stmt = $pdo->query("
                SELECT 
                    $dateCol as date,
                    COUNT(DISTINCT user_id) as active_users,
                    SUM(total_pageviews) as pageviews
                FROM analytics_metrics
                WHERE last_activity >= $dateSubtract
                GROUP BY $dateCol
                ORDER BY date ASC
            ");
            $activity = $stmt->fetchAll();
            sendResponse($activity);
            break;

        case 'conversions':
            // Get conversion funnel data
            $conversions = [];

            // Page visitors (from PostHog - approximated from users table)
            $stmt = $pdo->query("SELECT COUNT(*) as total FROM users");
            $conversions['visitors'] = $stmt->fetch()['total'];

            // Contact form submissions  
            $dateSubtract = getDateSubtract('30 days');
            $stmt = $pdo->query("SELECT COUNT(*) as total FROM contacts WHERE timestamp >= $dateSubtract");
            $conversions['contacts_30d'] = $stmt->fetch()['total'];

            // Guestbook entries
            $stmt = $pdo->query("SELECT COUNT(*) as total FROM guestbook WHERE timestamp >= $dateSubtract");
            $conversions['guestbook_30d'] = $stmt->fetch()['total'];

            // Bookings
            $stmt = $pdo->query("SELECT COUNT(*) as total FROM bookings WHERE timestamp >= $dateSubtract");
            $conversions['bookings_30d'] = $stmt->fetch()['total'];

            // Resume requests
            $stmt = $pdo->query("SELECT COUNT(*) as total FROM resume_requests WHERE timestamp >= $dateSubtract");
            $conversions['resume_requests_30d'] = $stmt->fetch()['total'];

            sendResponse($conversions);
            break;

        case 'top-pages':
            // This would typically come from PostHog API
            // For now, return placeholder until PostHog insights are integrated
            $topPages = [
                ['path' => '/', 'name' => 'Home', 'views' => 0],
                ['path' => '/about', 'name' => 'About', 'views' => 0],
                ['path' => '/projects', 'name' => 'Projects', 'views' => 0],
                ['path' => '/skills', 'name' => 'Skills', 'views' => 0],
                ['path' => '/contact', 'name' => 'Contact', 'views' => 0]
            ];
            sendResponse(['note' => 'Connect PostHog insights API for real data', 'data' => $topPages]);
            break;

        case 'sync':
            // Trigger manual sync (redirect to cron-sync endpoint)
            if ($method !== 'POST') {
                sendResponse(['error' => 'Use POST to trigger sync'], 405);
            }

            $data = getJsonInput();
            $secretKey = $data['secret_key'] ?? '';

            // Validate secret key
            $expectedKey = $posthogConfig['cron_secret_key'] ?? '';
            if (empty($expectedKey) || $secretKey !== $expectedKey) {
                sendResponse(['error' => 'Invalid secret key'], 403);
            }

            // Include and run sync
            // Note: In production, you might want to run this asynchronously
            header('Location: cron-sync.php?secret_key=' . urlencode($secretKey));
            exit;

        default:
            sendResponse(['error' => 'Unknown action'], 400);
    }
} catch (PDOException $e) {
    sendResponse(['error' => 'Database error', 'details' => $e->getMessage()], 500);
} catch (Exception $e) {
    sendResponse(['error' => 'Error', 'details' => $e->getMessage()], 500);
}
?>