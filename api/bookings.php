<?php
/**
 * Bookings API Endpoint
 * Handles call booking requests
 */

require_once 'config.php';

$method = $_SERVER['REQUEST_METHOD'];
$id = $_GET['id'] ?? null;
$action = $_GET['action'] ?? null;

try {
    switch ($method) {
        case 'GET':
            // Get all bookings
            $stmt = $pdo->query("SELECT * FROM bookings ORDER BY timestamp DESC");
            $bookings = $stmt->fetchAll();
            sendResponse($bookings);
            break;

        case 'POST':
            // Create new booking
            $data = getJsonInput();

            if (empty($data['name']) || empty($data['email'])) {
                sendResponse(['error' => 'Name and email are required'], 400);
            }

            $stmt = $pdo->prepare("
                INSERT INTO bookings (name, email, phone, preferred_date, preferred_time, timezone, topic, message, status) 
                VALUES (:name, :email, :phone, :preferred_date, :preferred_time, :timezone, :topic, :message, 'pending')
            ");
            $stmt->execute([
                'name' => $data['name'],
                'email' => $data['email'],
                'phone' => $data['phone'] ?? '',
                'preferred_date' => $data['preferred_date'] ?? $data['date'] ?? '',
                'preferred_time' => $data['preferred_time'] ?? $data['time'] ?? '',
                'timezone' => $data['timezone'] ?? '',
                'topic' => $data['topic'] ?? '',
                'message' => $data['message'] ?? ''
            ]);

            $insertId = $pdo->lastInsertId();

            // PostHog: Track meeting_booked event with identity handover
            $distinctId = $data['ph_distinct_id'] ?? null;
            if ($distinctId) {
                require_once 'PostHogClient.php';
                $posthog = new PostHogClient();

                // Track the event
                $posthog->capture($distinctId, 'meeting_booked', [
                    'topic' => $data['topic'] ?? 'General',
                    'preferred_date' => $data['preferred_date'] ?? $data['date'] ?? null,
                    'booking_id' => $insertId
                ]);

                // Identify the user with their info
                $posthog->identify($distinctId, [
                    'email' => $data['email'],
                    'name' => $data['name'],
                    'phone' => $data['phone'] ?? null,
                    'last_action' => 'meeting_booked'
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
                'message' => 'Booking submitted successfully'
            ], 201);
            break;

        case 'PATCH':
            // Update status
            if ($id && $action === 'status') {
                $data = getJsonInput();
                $status = $data['status'] ?? 'pending';

                $stmt = $pdo->prepare("UPDATE bookings SET status = :status WHERE id = :id");
                $stmt->execute(['status' => $status, 'id' => $id]);
                sendResponse(['success' => true]);
            } else {
                sendResponse(['error' => 'Invalid request'], 400);
            }
            break;

        case 'DELETE':
            if ($id) {
                $stmt = $pdo->prepare("DELETE FROM bookings WHERE id = :id");
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