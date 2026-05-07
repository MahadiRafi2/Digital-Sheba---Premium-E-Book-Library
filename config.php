<?php
/**
 * Configuration for Digital Sheba MySQL Connection
 */

// Database Credentials - EDIT THESE FOR YOUR CPANEL SETUP
define('DB_HOST', 'localhost');
define('DB_NAME', 'your_database_name');
define('DB_USER', 'your_database_user');
define('DB_PASS', 'your_database_password');

// Secret Key for JWT-like Auth
define('JWT_SECRET', 'lumina-secret-key-change-this');

// Helper to get PDO connection
function getDB() {
    static $pdo = null;
    if ($pdo === null) {
        try {
            $dsn = "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8mb4";
            $options = [
                PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES   => false,
            ];
            $pdo = new PDO($dsn, DB_USER, DB_PASS, $options);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(["status" => "error", "message" => "Connection failed: " . $e->getMessage()]);
            exit;
        }
    }
    return $pdo;
}

// Security headers
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit;
}

/**
 * Authentication Middleware Helper
 */
function authenticate() {
    $headers = apache_request_headers();
    if (!isset($headers['Authorization'])) {
        $headers = array_change_key_case(getallheaders(), CASE_TITLE);
    }
    
    $authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? '';
    
    if (empty($authHeader)) {
        http_response_code(401);
        echo json_encode(["message" => "No token provided"]);
        exit;
    }

    $token = explode(" ", $authHeader)[1] ?? '';
    
    // In our simplified PHP-only version for cPanel, 
    // we use a simple string comparison or a lightweight library.
    // For production, we recommend a library like firebase/php-jwt.
    // Here we'll simulate a token check by looking for a session or just verifying it's not empty for now.
    // Real implementation would decode JWT.
    
    if (empty($token) || $token === 'undefined') {
        http_response_code(401);
        echo json_encode(["message" => "Invalid token"]);
        exit;
    }

    return true;
}

/**
 * Input sanitization helper
 */
function getJSONInput() {
    $content = file_get_contents("php://input");
    return json_decode($content, true) ?: [];
}
?>
