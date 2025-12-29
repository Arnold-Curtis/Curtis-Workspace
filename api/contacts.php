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
            
            sendResponse([
                'success' => true,
                'id' => $pdo->lastInsertId(),
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
} catch(PDOException $e) {
    sendResponse(['error' => 'Database error', 'details' => $e->getMessage()], 500);
}
?>
