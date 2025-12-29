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
            
            sendResponse([
                'success' => true,
                'id' => $pdo->lastInsertId(),
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
} catch(PDOException $e) {
    sendResponse(['error' => 'Database error', 'details' => $e->getMessage()], 500);
}
?>
