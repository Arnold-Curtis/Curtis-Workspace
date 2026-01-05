<?php
/**
 * PostHog Analytics Sync - HTTP Cron Endpoint
 * 
 * Triggered via: GET /api/cron-sync.php?secret_key=YOUR_SECRET
 * 
 * This endpoint syncs user metrics from PostHog API to local MySQL database.
 * Designed for InfinityFree (no CLI cron access).
 * 
 * Trigger externally using:
 * - cron-job.org (free)
 * - UptimeRobot (free tier)
 * - External server cron
 */

require_once 'config.php';
require_once 'PostHogClient.php';

// Load PostHog configuration
$posthogConfig = file_exists(__DIR__ . '/posthog-config.php')
    ? include __DIR__ . '/posthog-config.php'
    : [];

// ============ SECURITY CHECK ============
$providedKey = $_GET['secret_key'] ?? '';
$expectedKey = $posthogConfig['cron_secret_key'] ?? '';

if (empty($expectedKey) || $providedKey !== $expectedKey) {
    http_response_code(403);
    echo json_encode(['error' => 'Forbidden: Invalid or missing secret key']);
    exit;
}

// ============ EXECUTION TIME TRACKING ============
$startTime = microtime(true);
$maxExecutionTime = 25; // seconds (leave buffer for 30s limit)
$syncedCount = 0;
$errors = [];

try {
    // Initialize PostHog client with personal API key for data fetching
    $personalApiKey = $posthogConfig['personal_api_key'] ?? null;
    $projectId = $posthogConfig['project_id'] ?? null;
    $host = $posthogConfig['host'] ?? 'https://us.i.posthog.com';

    if (empty($personalApiKey) || empty($projectId)) {
        throw new Exception('PostHog personal_api_key and project_id are required for sync');
    }

    // ============ FETCH PERSONS FROM POSTHOG ============
    $personsUrl = "$host/api/projects/$projectId/persons/?limit=50";

    $ch = curl_init();
    curl_setopt_array($ch, [
        CURLOPT_URL => $personsUrl,
        CURLOPT_HTTPHEADER => [
            "Authorization: Bearer $personalApiKey",
            'Content-Type: application/json'
        ],
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT => 20,
        // Disable SSL verification for local development
        CURLOPT_SSL_VERIFYPEER => false,
        CURLOPT_SSL_VERIFYHOST => false
    ]);

    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    if ($httpCode !== 200) {
        throw new Exception("PostHog API error: HTTP $httpCode");
    }

    $personsData = json_decode($response, true);
    $persons = $personsData['results'] ?? [];

    // ============ PROCESS EACH PERSON ============
    foreach ($persons as $person) {
        // Check execution time
        if ((microtime(true) - $startTime) > $maxExecutionTime) {
            $errors[] = 'Execution time limit approaching, stopping sync';
            break;
        }

        $distinctId = $person['distinct_ids'][0] ?? null;
        if (!$distinctId)
            continue;

        $properties = $person['properties'] ?? [];
        $name = $properties['name'] ?? $properties['$name'] ?? '';
        $email = $properties['email'] ?? $properties['$email'] ?? '';

        // ============ UPSERT USER ============
        // Check if user exists
        $stmt = $pdo->prepare("SELECT id FROM users WHERE posthog_distinct_id = :distinct_id");
        $stmt->execute(['distinct_id' => $distinctId]);
        $userExists = $stmt->fetch();

        if ($userExists) {
            // Update existing user
            $stmt = $pdo->prepare("
                UPDATE users SET
                    name = COALESCE(:name, name),
                    email = COALESCE(:email, email),
                    last_seen = NOW()
                WHERE posthog_distinct_id = :distinct_id
            ");
            $stmt->execute([
                'distinct_id' => $distinctId,
                'name' => $name,
                'email' => $email
            ]);
        } else {
            // Insert new user
            $stmt = $pdo->prepare("
                INSERT INTO users (posthog_distinct_id, name, email, first_seen, last_seen)
                VALUES (:distinct_id, :name, :email, NOW(), NOW())
            ");
            $stmt->execute([
                'distinct_id' => $distinctId,
                'name' => $name,
                'email' => $email
            ]);
        }

        // Get user ID
        $stmt = $pdo->prepare("SELECT id FROM users WHERE posthog_distinct_id = :distinct_id");
        $stmt->execute(['distinct_id' => $distinctId]);
        $user = $stmt->fetch();

        if (!$user)
            continue;
        $userId = $user['id'];

        // ============ FETCH SESSION RECORDINGS ============
        $sessionReplayUrl = null;
        $recordingsUrl = "$host/api/projects/$projectId/session_recordings/?person_uuid={$person['uuid']}&limit=1";

        $ch = curl_init();
        curl_setopt_array($ch, [
            CURLOPT_URL => $recordingsUrl,
            CURLOPT_HTTPHEADER => [
                "Authorization: Bearer $personalApiKey",
                'Content-Type: application/json'
            ],
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_TIMEOUT => 10,
            // Disable SSL verification for local development
            CURLOPT_SSL_VERIFYPEER => false,
            CURLOPT_SSL_VERIFYHOST => false
        ]);

        $recordingsResponse = curl_exec($ch);
        $recordingsHttpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        if ($recordingsHttpCode === 200) {
            $recordingsData = json_decode($recordingsResponse, true);
            $recordings = $recordingsData['results'] ?? [];
            if (!empty($recordings)) {
                $latestRecording = $recordings[0];
                $recordingId = $latestRecording['id'] ?? null;
                if ($recordingId) {
                    $sessionReplayUrl = "$host/project/$projectId/replay/$recordingId";
                }
            }
        }

        // ============ CALCULATE METRICS ============
        // Count events for this person (simplified - PostHog API would provide more detail)
        $totalVisits = count($person['distinct_ids'] ?? []);
        $sessionCount = $properties['$session_count'] ?? 1;
        $lastActivity = $person['created_at'] ?? date('Y-m-d H:i:s');

        // Simplified engagement score calculation
        $engagementScore = min(100, ($sessionCount * 10) + ($totalVisits * 5));

        // ============ UPSERT ANALYTICS METRICS ============
        // Check if record exists first (PostgreSQL doesn't support ON DUPLICATE for non-unique keys)
        $stmt = $pdo->prepare("SELECT id FROM analytics_metrics WHERE user_id = :user_id");
        $stmt->execute(['user_id' => $userId]);
        $existing = $stmt->fetch();

        if ($existing) {
            // UPDATE existing record
            $stmt = $pdo->prepare("
                UPDATE analytics_metrics SET
                    total_visits = :total_visits,
                    session_count = :session_count,
                    engagement_score = :engagement_score,
                    last_session_replay_url = COALESCE(:replay_url, last_session_replay_url),
                    last_activity = :last_activity,
                    synced_at = NOW()
                WHERE user_id = :user_id
            ");
            $stmt->execute([
                'user_id' => $userId,
                'total_visits' => $totalVisits,
                'session_count' => $sessionCount,
                'engagement_score' => $engagementScore,
                'replay_url' => $sessionReplayUrl,
                'last_activity' => $lastActivity
            ]);
        } else {
            // INSERT new record
            $stmt = $pdo->prepare("
                INSERT INTO analytics_metrics (
                    user_id, total_visits, session_count, engagement_score,
                    last_session_replay_url, last_activity, synced_at
                )
                VALUES (
                    :user_id, :total_visits, :session_count, :engagement_score,
                    :replay_url, :last_activity, NOW()
                )
            ");
            $stmt->execute([
                'user_id' => $userId,
                'total_visits' => $totalVisits,
                'session_count' => $sessionCount,
                'engagement_score' => $engagementScore,
                'replay_url' => $sessionReplayUrl,
                'last_activity' => $lastActivity
            ]);
        }

        $syncedCount++;
    }

    // ============ SUCCESS RESPONSE ============
    $executionTime = round(microtime(true) - $startTime, 2);

    sendResponse([
        'success' => true,
        'synced_users' => $syncedCount,
        'total_persons' => count($persons),
        'execution_time_seconds' => $executionTime,
        'errors' => $errors,
        'synced_at' => date('c')
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'error' => 'Sync failed',
        'message' => $e->getMessage(),
        'synced_before_error' => $syncedCount
    ]);
}
?>