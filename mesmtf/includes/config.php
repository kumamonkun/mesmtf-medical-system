<?php
// Database configuration
define('DB_HOST', 'localhost');
define('DB_USER', 'root');
define('DB_PASS', '');
define('DB_NAME', 'mesmtf_db');

// Site configuration
define('SITE_NAME', 'MESMTF - Medical Expert System');
define('SITE_URL', 'http://localhost/mesmtf');
define('ADMIN_EMAIL', 'admin@mesmtf.gov');

// Security settings
define('SESSION_TIMEOUT', 3600); // 1 hour
define('MAX_LOGIN_ATTEMPTS', 5);
define('LOGIN_LOCKOUT_TIME', 900); // 15 minutes

// File upload settings
define('MAX_FILE_SIZE', 5 * 1024 * 1024); // 5MB
define('ALLOWED_FILE_TYPES', ['jpg', 'jpeg', 'png', 'pdf', 'doc', 'docx']);

// Expert system settings
define('DIAGNOSIS_CONFIDENCE_THRESHOLD', 70); // Minimum confidence percentage
define('SYMPTOM_WEIGHT_VS', 4); // Very Strong signs weight
define('SYMPTOM_WEIGHT_S', 3);  // Strong signs weight
define('SYMPTOM_WEIGHT_W', 2);  // Weak signs weight
define('SYMPTOM_WEIGHT_VW', 1); // Very Weak signs weight

// Error reporting (set to 0 in production)
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Timezone
date_default_timezone_set('Africa/Lagos');

// Start session if not already started
if (session_status() == PHP_SESSION_NONE) {
    session_start();
}

// Database connection
try {
    $pdo = new PDO("mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8", DB_USER, DB_PASS);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
} catch (PDOException $e) {
    die("Database connection failed: " . $e->getMessage());
}

// Include common functions
require_once __DIR__ . '/functions.php';
?>