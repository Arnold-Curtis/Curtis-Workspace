<?php
/**
 * Resume Requests API Endpoint
 * Handles resume download requests
 */

require_once 'config.php';

$method = $_SERVER['REQUEST_METHOD'];
$id = $_GET['id'] ?? null;
$action = $_GET['action'] ?? null;

try {
    switch ($method) {
        case 'GET':
            // Get all resume requests
            $stmt = $pdo->query("SELECT * FROM resume_requests ORDER BY timestamp DESC");
            $requests = $stmt->fetchAll();
            sendResponse($requests);
            break;

        case 'POST':
            // Create new request
            $data = getJsonInput();

            if (empty($data['name']) || empty($data['email'])) {
                sendResponse(['error' => 'Name and email are required'], 400);
            }

            $stmt = $pdo->prepare("
                INSERT INTO resume_requests (name, email, company, reason) 
                VALUES (:name, :email, :company, :reason)
            ");
            $stmt->execute([
                'name' => $data['name'],
                'email' => $data['email'],
                'company' => $data['company'] ?? '',
                'reason' => $data['reason'] ?? ''
            ]);

            $insertId = $pdo->lastInsertId();

            // PostHog: Track resume_requested event with identity handover
            $distinctId = $data['ph_distinct_id'] ?? null;
            if ($distinctId) {
                require_once 'PostHogClient.php';
                $posthog = new PostHogClient();

                // Track the event
                $posthog->capture($distinctId, 'resume_requested', [
                    'company' => $data['company'] ?? null,
                    'resume_request_id' => $insertId
                ]);

                // Identify the user with their info
                $posthog->identify($distinctId, [
                    'email' => $data['email'],
                    'name' => $data['name'],
                    'company' => $data['company'] ?? null,
                    'last_action' => 'resume_requested'
                ]);

                // ALSO save to local database for dual tracking
                try {
                    // Check if user exists
                    $stmt = $pdo->prepare("SELECT id FROM users WHERE posthog_distinct_id = :id");
                    $stmt->execute(['id' => $distinctId]);
                    $existing = $stmt->fetch();

                    if ($existing) {
                        // Update existing user
                        $stmt = $pdo->prepare("
                            UPDATE users SET 
                                name = COALESCE(:name, name),
                                email = COALESCE(:email, email),
                                last_seen = NOW()
                            WHERE posthog_distinct_id = :id
                        ");
                    } else {
                        // Insert new user
                        $stmt = $pdo->prepare("
                            INSERT INTO users (posthog_distinct_id, name, email, first_seen, last_seen)
                            VALUES (:id, :name, :email, NOW(), NOW())
                        ");
                    }

                    $stmt->execute([
                        'id' => $distinctId,
                        'name' => $data['name'],
                        'email' => $data['email']
                    ]);
                } catch (PDOException $e) {
                    error_log("Failed to save user to local DB: " . $e->getMessage());
                }
            }

            sendResponse([
                'success' => true,
                'id' => $insertId,
                'message' => 'Resume request submitted successfully'
            ], 201);
            break;

        case 'PATCH':
            // Mark as fulfilled
            if ($id && $action === 'fulfill') {
                $stmt = $pdo->prepare("UPDATE resume_requests SET fulfilled = 1 WHERE id = :id");
                $stmt->execute(['id' => $id]);
                sendResponse(['success' => true]);
            } else {
                sendResponse(['error' => 'Invalid request'], 400);
            }
            break;

        case 'DELETE':
            if ($id) {
                $stmt = $pdo->prepare("DELETE FROM resume_requests WHERE id = :id");
                $stmt->execute(['id' => $id]);
                sendResponse(['success' => true]);
            } else {
                sendResponse(['error' => 'ID required'], 400);
            }
            break;

        default:
            sendResponse(['error' => 'Method not allowed'], 405);
    }
} catch (PDOException $e) {
    sendResponse(['error' => 'Database error', 'details' => $e->getMessage()], 500);
}
?>