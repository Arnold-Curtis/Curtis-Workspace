<?php
/**
 * Contacts API Endpoint
 * Handles contact form submissions
 */

require_once 'config.php';

$method = $_SERVER['REQUEST_METHOD'];
$id = $_GET['id'] ?? null;
$action = $_GET['action'] ?? null;

// Handle 'read' column name (reserved word in MySQL)
global $DB_TYPE;
$readCol = ($DB_TYPE === 'pgsql') ? 'read' : '`read`';

try {
    switch ($method) {
        case 'GET':
            // Get all contacts
            $stmt = $pdo->query("SELECT * FROM contacts ORDER BY timestamp DESC");
            $contacts = $stmt->fetchAll();
            sendResponse($contacts);
            break;

        case 'POST':
            // Create new contact
            $data = getJsonInput();

            if (empty($data['name']) || empty($data['email']) || empty($data['message'])) {
                sendResponse(['error' => 'Name, email, and message are required'], 400);
            }

            $stmt = $pdo->prepare("
                INSERT INTO contacts (name, email, subject, message) 
                VALUES (:name, :email, :subject, :message)
            ");
            $stmt->execute([
                'name' => $data['name'],
                'email' => $data['email'],
                'subject' => $data['subject'] ?? '',
                'message' => $data['message']
            ]);

            $insertId = $pdo->lastInsertId();

            // PostHog: Track contact_form_submitted event with identity handover
            $distinctId = $data['ph_distinct_id'] ?? null;
            if ($distinctId) {
                require_once 'PostHogClient.php';
                $posthog = new PostHogClient();

                // Track the event
                $posthog->capture($distinctId, 'contact_form_submitted', [
                    'subject' => $data['subject'] ?? 'No subject',
                    'contact_id' => $insertId
                ]);

                // Identify the user with their email
                $posthog->identify($distinctId, [
                    'email' => $data['email'],
                    'name' => $data['name'],
                    'last_action' => 'contact_form_submitted'
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
                'message' => 'Contact submission received successfully'
            ], 201);
            break;

        case 'PATCH':
            // Mark as read
            if ($id && $action === 'read') {
                $readValue = ($DB_TYPE === 'pgsql') ? 'TRUE' : '1';
                $stmt = $pdo->prepare("UPDATE contacts SET $readCol = $readValue WHERE id = :id");
                $stmt->execute(['id' => $id]);
                sendResponse(['success' => true]);
            } else {
                sendResponse(['error' => 'Invalid request'], 400);
            }
            break;

        case 'DELETE':
            if ($id) {
                $stmt = $pdo->prepare("DELETE FROM contacts WHERE id = :id");
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