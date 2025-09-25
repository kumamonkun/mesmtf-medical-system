<?php
session_start();
require_once 'includes/config.php';

// Log logout activity
if (is_logged_in()) {
    log_activity($_SESSION['user_id'], 'logout', 'User logged out successfully');
}

// Destroy session
session_unset();
session_destroy();

// Redirect to home page
header('Location: index.php');
exit();
?>