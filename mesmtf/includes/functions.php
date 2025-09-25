<?php
// Common utility functions for MESMTF system

/**
 * Sanitize input data
 */
function sanitize_input($data) {
    $data = trim($data);
    $data = stripslashes($data);
    $data = htmlspecialchars($data);
    return $data;
}

/**
 * Validate email address
 */
function validate_email($email) {
    return filter_var($email, FILTER_VALIDATE_EMAIL);
}

/**
 * Generate unique patient ID
 */
function generate_patient_id() {
    return 'PAT' . date('Y') . str_pad(rand(1, 9999), 4, '0', STR_PAD_LEFT);
}

/**
 * Generate unique appointment ID
 */
function generate_appointment_id() {
    return 'APT' . date('Ymd') . str_pad(rand(1, 999), 3, '0', STR_PAD_LEFT);
}

/**
 * Check if user is logged in
 */
function is_logged_in() {
    return isset($_SESSION['user_id']) && !empty($_SESSION['user_id']);
}

/**
 * Check user role
 */
function has_role($role) {
    return isset($_SESSION['user_role']) && $_SESSION['user_role'] === $role;
}

/**
 * Redirect to login if not authenticated
 */
function require_login() {
    if (!is_logged_in()) {
        header('Location: ' . SITE_URL . '/login.php');
        exit();
    }
}

/**
 * Redirect based on user role
 */
function redirect_by_role() {
    if (!is_logged_in()) {
        return;
    }
    
    $role = $_SESSION['user_role'];
    switch ($role) {
        case 'admin':
            header('Location: ' . SITE_URL . '/admin/dashboard.php');
            break;
        case 'doctor':
            header('Location: ' . SITE_URL . '/doctor/dashboard.php');
            break;
        case 'patient':
            header('Location: ' . SITE_URL . '/patient/dashboard.php');
            break;
        case 'pharmacist':
            header('Location: ' . SITE_URL . '/pharmacy/dashboard.php');
            break;
        default:
            header('Location: ' . SITE_URL . '/login.php');
    }
    exit();
}

/**
 * Log user activity
 */
function log_activity($user_id, $action, $details = '') {
    global $pdo;
    
    try {
        $stmt = $pdo->prepare("INSERT INTO activity_logs (user_id, action, details, ip_address, created_at) VALUES (?, ?, ?, ?, NOW())");
        $stmt->execute([$user_id, $action, $details, $_SERVER['REMOTE_ADDR']]);
    } catch (PDOException $e) {
        error_log("Failed to log activity: " . $e->getMessage());
    }
}

/**
 * Expert System - Calculate diagnosis confidence
 */
function calculate_diagnosis_confidence($symptoms, $disease_type) {
    $weights = [
        'malaria' => [
            'abdominal_pain' => SYMPTOM_WEIGHT_VS,
            'vomiting' => SYMPTOM_WEIGHT_VS,
            'sore_throat' => SYMPTOM_WEIGHT_VS,
            'headache' => SYMPTOM_WEIGHT_S,
            'fatigue' => SYMPTOM_WEIGHT_S,
            'cough' => SYMPTOM_WEIGHT_S,
            'chest_pain' => SYMPTOM_WEIGHT_W,
            'back_pain' => SYMPTOM_WEIGHT_W,
            'muscle_pain' => SYMPTOM_WEIGHT_W,
            'diarrhea' => SYMPTOM_WEIGHT_VW,
            'sweating' => SYMPTOM_WEIGHT_VW,
            'rash' => SYMPTOM_WEIGHT_VW
        ],
        'typhoid' => [
            'abdominal_pain' => SYMPTOM_WEIGHT_VS,
            'stomach_issues' => SYMPTOM_WEIGHT_VS,
            'constipation' => SYMPTOM_WEIGHT_S,
            'headache' => SYMPTOM_WEIGHT_S,
            'persistent_high_fever' => SYMPTOM_WEIGHT_S,
            'weakness' => SYMPTOM_WEIGHT_W,
            'tiredness' => SYMPTOM_WEIGHT_W,
            'loss_of_appetite' => SYMPTOM_WEIGHT_VW,
            'rash' => SYMPTOM_WEIGHT_VW
        ]
    ];
    
    $total_weight = 0;
    $max_possible_weight = 0;
    
    foreach ($symptoms as $symptom) {
        if (isset($weights[$disease_type][$symptom])) {
            $total_weight += $weights[$disease_type][$symptom];
        }
    }
    
    // Calculate maximum possible weight for this disease
    foreach ($weights[$disease_type] as $weight) {
        $max_possible_weight += $weight;
    }
    
    if ($max_possible_weight == 0) {
        return 0;
    }
    
    return round(($total_weight / $max_possible_weight) * 100);
}

/**
 * Expert System - Get treatment recommendation
 */
function get_treatment_recommendation($symptoms, $disease_type) {
    $very_strong_symptoms = ['abdominal_pain', 'vomiting', 'sore_throat', 'stomach_issues'];
    $has_very_strong = false;
    
    foreach ($symptoms as $symptom) {
        if (in_array($symptom, $very_strong_symptoms)) {
            $has_very_strong = true;
            break;
        }
    }
    
    $treatment = [
        'requires_xray' => $has_very_strong,
        'drugs' => get_drugs_for_disease($disease_type),
        'follow_up_days' => $has_very_strong ? 7 : 14
    ];
    
    return $treatment;
}

/**
 * Get drugs for specific disease
 */
function get_drugs_for_disease($disease_type) {
    $drugs = [
        'malaria' => [
            'Artemether-Lumefantrine',
            'Chloroquine',
            'Quinine',
            'Primaquine'
        ],
        'typhoid' => [
            'Ciprofloxacin',
            'Azithromycin',
            'Ceftriaxone',
            'Chloramphenicol'
        ],
        'both' => [
            'Artemether-Lumefantrine',
            'Ciprofloxacin',
            'Azithromycin',
            'Paracetamol'
        ]
    ];
    
    return $drugs[$disease_type] ?? [];
}

/**
 * Format date for display
 */
function format_date($date, $format = 'Y-m-d H:i:s') {
    return date($format, strtotime($date));
}

/**
 * Check if appointment time is available
 */
function is_appointment_available($doctor_id, $appointment_date, $appointment_time) {
    global $pdo;
    
    try {
        $stmt = $pdo->prepare("SELECT COUNT(*) FROM appointments WHERE doctor_id = ? AND appointment_date = ? AND appointment_time = ? AND status != 'cancelled'");
        $stmt->execute([$doctor_id, $appointment_date, $appointment_time]);
        $count = $stmt->fetchColumn();
        
        return $count == 0;
    } catch (PDOException $e) {
        return false;
    }
}

/**
 * Send notification email
 */
function send_notification_email($to, $subject, $message) {
    // In a real system, you would use PHPMailer or similar
    // For now, we'll just log the email
    error_log("Email to $to: $subject - $message");
    return true;
}

/**
 * Generate PDF report
 */
function generate_pdf_report($data, $type) {
    // In a real system, you would use a PDF library like TCPDF or FPDF
    // For now, we'll return a placeholder
    return "PDF report generated for $type";
}

/**
 * Validate file upload
 */
function validate_file_upload($file) {
    $errors = [];
    
    if ($file['size'] > MAX_FILE_SIZE) {
        $errors[] = "File size exceeds maximum allowed size of " . (MAX_FILE_SIZE / 1024 / 1024) . "MB";
    }
    
    $file_extension = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
    if (!in_array($file_extension, ALLOWED_FILE_TYPES)) {
        $errors[] = "File type not allowed. Allowed types: " . implode(', ', ALLOWED_FILE_TYPES);
    }
    
    return $errors;
}

/**
 * Get user dashboard URL based on role
 */
function get_dashboard_url($role) {
    switch ($role) {
        case 'admin':
            return SITE_URL . '/admin/dashboard.php';
        case 'doctor':
            return SITE_URL . '/doctor/dashboard.php';
        case 'patient':
            return SITE_URL . '/patient/dashboard.php';
        case 'pharmacist':
            return SITE_URL . '/pharmacy/dashboard.php';
        default:
            return SITE_URL . '/login.php';
    }
}

/**
 * Check session timeout
 */
function check_session_timeout() {
    if (isset($_SESSION['last_activity']) && (time() - $_SESSION['last_activity'] > SESSION_TIMEOUT)) {
        session_unset();
        session_destroy();
        return false;
    }
    $_SESSION['last_activity'] = time();
    return true;
}
?>