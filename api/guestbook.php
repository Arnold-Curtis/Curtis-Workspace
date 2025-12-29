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
                // Get only approved entries (public)
                $stmt = $pdo->query("SELECT * FROM guestbook WHERE approved = 1 ORDER BY timestamp DESC");
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
            
            sendResponse([
                'success' => true,
                'id' => $pdo->lastInsertId(),
                'message' => 'Guestbook entry submitted successfully'
            ], 201);
            break;
            
        case 'PATCH':
            // Approve entry
            if ($id && $action === 'approve') {
                $stmt = $pdo->prepare("UPDATE guestbook SET approved = 1, status = 'approved' WHERE id = :id");
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
} catch(PDOException $e) {
    sendResponse(['error' => 'Database error', 'details' => $e->getMessage()], 500);
}
?>
