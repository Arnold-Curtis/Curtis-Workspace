<?php
/**
 * Database Configuration
 * Update these values for your hosting environment
 */

// CORS headers for API access
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PATCH, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

// ============ DATABASE CONFIGURATION ============
// Set to 'pgsql' for PostgreSQL (local testing) or 'mysql' for MySQL (InfinityFree)
$DB_TYPE = 'pgsql';  // Change to 'mysql' for production

// PostgreSQL settings (for local testing)
$PGSQL_HOST = 'localhost';
$PGSQL_PORT = '5432';
$PGSQL_NAME = 'portfolio_db';
$PGSQL_USER = 'postgres';
$PGSQL_PASS = '1234';

// MySQL settings (for InfinityFree production)
$MYSQL_HOST = 'localhost';           // InfinityFree: sql###.infinityfree.com
$MYSQL_NAME = 'portfolio_db';        // Your database name
$MYSQL_USER = 'root';                // Your database username
$MYSQL_PASS = '';                    // Your database password

// ============ DATABASE CONNECTION ============
try {
    if ($DB_TYPE === 'pgsql') {
        // PostgreSQL connection
        $pdo = new PDO(
            "pgsql:host=$PGSQL_HOST;port=$PGSQL_PORT;dbname=$PGSQL_NAME",
            $PGSQL_USER,
            $PGSQL_PASS,
            [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false
            ]
        );
    } else {
        // MySQL connection
        $pdo = new PDO(
            "mysql:host=$MYSQL_HOST;dbname=$MYSQL_NAME;charset=utf8mb4",
            $MYSQL_USER,
            $MYSQL_PASS,
            [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false
            ]
        );
    }
} catch(PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database connection failed', 'details' => $e->getMessage()]);
    exit;
}

/**
 * Helper function to send JSON response
 */
function sendResponse($data, $statusCode = 200) {
    http_response_code($statusCode);
    echo json_encode($data);
    exit;
}

/**
 * Helper function to get JSON input
 */
function getJsonInput() {
    $input = file_get_contents('php://input');
    return json_decode($input, true) ?? [];
}
?>
