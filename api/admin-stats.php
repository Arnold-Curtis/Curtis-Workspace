<?php
/**
 * Admin Stats API Endpoint
 * Returns dashboard statistics
 */

require_once 'config.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method !== 'GET') {
    sendResponse(['error' => 'Method not allowed'], 405);
}

try {
    // Get contact stats
    $stmt = $pdo->query("SELECT COUNT(*) as total FROM contacts");
    $totalContacts = $stmt->fetch()['total'];
    
    $stmt = $pdo->query("SELECT COUNT(*) as unread FROM contacts WHERE `read` = 0");
    $unreadContacts = $stmt->fetch()['unread'];
    
    // Get guestbook stats
    $stmt = $pdo->query("SELECT COUNT(*) as total FROM guestbook");
    $totalGuestbook = $stmt->fetch()['total'];
    
    $stmt = $pdo->query("SELECT COUNT(*) as pending FROM guestbook WHERE approved = 0");
    $pendingGuestbook = $stmt->fetch()['pending'];
    
    // Get booking stats
    $stmt = $pdo->query("SELECT COUNT(*) as total FROM bookings");
    $totalBookings = $stmt->fetch()['total'];
    
    $stmt = $pdo->query("SELECT COUNT(*) as pending FROM bookings WHERE status = 'pending'");
    $pendingBookings = $stmt->fetch()['pending'];
    
    // Get resume request stats
    $stmt = $pdo->query("SELECT COUNT(*) as total FROM resume_requests");
    $totalResumeRequests = $stmt->fetch()['total'];
    
    $stmt = $pdo->query("SELECT COUNT(*) as pending FROM resume_requests WHERE fulfilled = 0");
    $pendingResumeRequests = $stmt->fetch()['pending'];
    
    sendResponse([
        'totalContacts' => (int)$totalContacts,
        'unreadContacts' => (int)$unreadContacts,
        'totalGuestbook' => (int)$totalGuestbook,
        'pendingGuestbook' => (int)$pendingGuestbook,
        'totalBookings' => (int)$totalBookings,
        'pendingBookings' => (int)$pendingBookings,
        'totalResumeRequests' => (int)$totalResumeRequests,
        'pendingResumeRequests' => (int)$pendingResumeRequests
    ]);
    
} catch(PDOException $e) {
    sendResponse(['error' => 'Database error', 'details' => $e->getMessage()], 500);
}
?>
