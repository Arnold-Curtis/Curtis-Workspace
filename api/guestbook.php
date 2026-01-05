<?php
/**
 * Guestbook API Endpoint
 * Handles guestbook entries
 */

require_once 'config.php';

$method = $_SERVER['REQUEST_METHOD'];
$id = $_GET['id'] ?? null;
$action = $_GET['action'] ?? null;
$approved = $_GET['approved'] ?? null;

try {
    switch ($method) {
        case 'GET':
            if ($approved === 'true') {
                // Get only approved entries (public) - using status for compatibility
                $stmt = $pdo->query("SELECT * FROM guestbook WHERE status = 'approved' ORDER BY timestamp DESC");
            } else {
                // Get all entries (admin)
                $stmt = $pdo->query("SELECT * FROM guestbook ORDER BY timestamp DESC");
            }
            $entries = $stmt->fetchAll();
            sendResponse($entries);
            break;

        case 'POST':
            // Create new entry
            $data = getJsonInput();

            if (empty($data['name']) || empty($data['message'])) {
                sendResponse(['error' => 'Name and message are required'], 400);
            }

            $stmt = $pdo->prepare("
                INSERT INTO guestbook (name, message, company, role, status) 
                VALUES (:name, :message, :company, :role, 'pending')
            ");
            $stmt->execute([
                'name' => $data['name'],
                'message' => $data['message'],
                'company' => $data['company'] ?? '',
                'role' => $data['role'] ?? ''
            ]);

            $insertId = $pdo->lastInsertId();


            // PostHog: Track guestbook_signed event with identity handover
            $distinctId = $data['ph_distinct_id'] ?? null;
            if ($distinctId) {
                require_once 'PostHogClient.php';
                $posthog = new PostHogClient();

                // Track the event
                $posthog->capture($distinctId, 'guestbook_signed', [
                    'name' => $data['name'],
                    'company' => $data['company'] ?? null,
                    'role' => $data['role'] ?? null,
                    'guestbook_id' => $insertId
                ]);

                // Identify the user with their info
                $posthog->identify($distinctId, [
                    'name' => $data['name'],
                    'company' => $data['company'] ?? null,
                    'role' => $data['role'] ?? null,
                    'last_action' => 'guestbook_signed'
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
                        'name' => $data['name'] ?? '',
                        'email' => ''
                    ]);
                } catch (PDOException $e) {
                    error_log("Failed to save user to local DB: " . $e->getMessage());
                }
            }


            sendResponse([
                'success' => true,
                'id' => $insertId,
                'message' => 'Guestbook entry submitted successfully'
            ], 201);
            break;

        case 'PATCH':
            // Approve entry
            if ($id && $action === 'approve') {
                $stmt = $pdo->prepare("UPDATE guestbook SET status = 'approved' WHERE id = :id");
                $stmt->execute(['id' => $id]);
                sendResponse(['success' => true]);
            } else {
                sendResponse(['error' => 'Invalid request'], 400);
            }
            break;

        case 'DELETE':
            if ($id) {
                $stmt = $pdo->prepare("DELETE FROM guestbook WHERE id = :id");
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