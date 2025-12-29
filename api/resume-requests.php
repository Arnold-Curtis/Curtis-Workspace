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
            
            sendResponse([
                'success' => true,
                'id' => $pdo->lastInsertId(),
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
} catch(PDOException $e) {
    sendResponse(['error' => 'Database error', 'details' => $e->getMessage()], 500);
}
?>
