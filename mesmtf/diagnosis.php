<?php
session_start();
require_once 'includes/config.php';

$diagnosis_result = null;
$error_message = '';

if ($_SERVER['REQUEST_METHOD'] == 'POST' && isset($_POST['symptoms'])) {
    $selected_symptoms = $_POST['symptoms'];
    
    if (empty($selected_symptoms)) {
        $error_message = 'Please select at least one symptom.';
    } else {
        // Calculate diagnosis confidence
        $malaria_confidence = calculate_diagnosis_confidence($selected_symptoms, 'malaria');
        $typhoid_confidence = calculate_diagnosis_confidence($selected_symptoms, 'typhoid');
        
        // Determine diagnosis
        $diagnosis = '';
        $confidence = 0;
        $disease_type = '';
        
        if ($malaria_confidence > $typhoid_confidence && $malaria_confidence > 30) {
            $diagnosis = 'Malaria';
            $confidence = $malaria_confidence;
            $disease_type = 'malaria';
        } elseif ($typhoid_confidence > $malaria_confidence && $typhoid_confidence > 30) {
            $diagnosis = 'Typhoid Fever';
            $confidence = $typhoid_confidence;
            $disease_type = 'typhoid';
        } else {
            $diagnosis = 'Insufficient symptoms for diagnosis';
            $confidence = max($malaria_confidence, $typhoid_confidence);
            $disease_type = 'unknown';
        }
        
        // Get treatment recommendation
        $treatment = get_treatment_recommendation($selected_symptoms, $disease_type);
        
        $diagnosis_result = [
            'diagnosis' => $diagnosis,
            'confidence' => $confidence,
            'disease_type' => $disease_type,
            'symptoms' => $selected_symptoms,
            'treatment' => $treatment,
            'malaria_confidence' => $malaria_confidence,
            'typhoid_confidence' => $typhoid_confidence
        ];
        
        // Log diagnosis activity
        if (is_logged_in()) {
            log_activity($_SESSION['user_id'], 'ai_diagnosis', "Diagnosis: $diagnosis (Confidence: $confidence%)");
        }
    }
}

// Get expert system rules for display
try {
    $stmt = $pdo->prepare("SELECT * FROM expert_rules ORDER BY disease_type, severity DESC, weight DESC");
    $stmt->execute();
    $expert_rules = $stmt->fetchAll();
} catch (PDOException $e) {
    $expert_rules = [];
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AI Diagnosis - MESMTF</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
    <link href="assets/css/style.css" rel="stylesheet">
</head>
<body>
    <!-- Navigation -->
    <nav class="navbar navbar-expand-lg navbar-dark bg-primary">
        <div class="container">
            <a class="navbar-brand" href="index.php">
                <i class="fas fa-stethoscope me-2"></i>MESMTF
            </a>
            <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
                <span class="navbar-toggler-icon"></span>
            </button>
            <div class="collapse navbar-collapse" id="navbarNav">
                <ul class="navbar-nav ms-auto">
                    <li class="nav-item">
                        <a class="nav-link" href="index.php">Home</a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link active" href="diagnosis.php">AI Diagnosis</a>
                    </li>
                    <?php if (is_logged_in()): ?>
                        <li class="nav-item">
                            <a class="nav-link" href="<?php echo get_dashboard_url($_SESSION['user_role']); ?>">Dashboard</a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link" href="logout.php">Logout</a>
                        </li>
                    <?php else: ?>
                        <li class="nav-item">
                            <a class="nav-link" href="login.php">Login</a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link" href="register.php">Register</a>
                        </li>
                    <?php endif; ?>
                </ul>
            </div>
        </div>
    </nav>

    <div class="container py-5">
        <div class="row">
            <div class="col-lg-8 mx-auto">
                <div class="text-center mb-5">
                    <h1 class="display-5 fw-bold text-gradient">
                        <i class="fas fa-robot me-3"></i>AI Medical Diagnosis
                    </h1>
                    <p class="lead text-muted">
                        Select your symptoms and get an instant preliminary diagnosis for Malaria and Typhoid Fever
                    </p>
                </div>
                
                <?php if ($error_message): ?>
                    <div class="alert alert-danger alert-dismissible fade show" role="alert">
                        <i class="fas fa-exclamation-circle me-2"></i>
                        <?php echo $error_message; ?>
                        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
                    </div>
                <?php endif; ?>
                
                <div class="card shadow-lg border-0 rounded-custom">
                    <div class="card-body p-4">
                        <form method="POST" id="diagnosisForm" class="needs-validation" novalidate>
                            <h3 class="mb-4">
                                <i class="fas fa-list-check me-2"></i>Select Your Symptoms
                            </h3>
                            
                            <div class="row">
                                <div class="col-md-6">
                                    <h5 class="text-primary mb-3">
                                        <i class="fas fa-bug me-2"></i>Malaria Symptoms
                                    </h5>
                                    
                                    <?php
                                    $malaria_symptoms = array_filter($expert_rules, function($rule) {
                                        return $rule['disease_type'] === 'malaria';
                                    });
                                    
                                    foreach ($malaria_symptoms as $rule):
                                        $symptom_name = str_replace('_', ' ', $rule['symptom']);
                                        $symptom_name = ucwords($symptom_name);
                                        $severity_class = 'severity-' . str_replace('_', '-', $rule['severity']);
                                    ?>
                                        <div class="symptom-checkbox">
                                            <input type="checkbox" 
                                                   id="symptom_<?php echo $rule['symptom']; ?>" 
                                                   name="symptoms[]" 
                                                   value="<?php echo $rule['symptom']; ?>"
                                                   class="form-check-input">
                                            <label for="symptom_<?php echo $rule['symptom']; ?>" class="form-check-label">
                                                <?php echo $symptom_name; ?>
                                                <span class="symptom-severity <?php echo $severity_class; ?> ms-2">
                                                    <?php echo str_replace('_', ' ', $rule['severity']); ?>
                                                </span>
                                            </label>
                                        </div>
                                    <?php endforeach; ?>
                                </div>
                                
                                <div class="col-md-6">
                                    <h5 class="text-success mb-3">
                                        <i class="fas fa-thermometer-half me-2"></i>Typhoid Symptoms
                                    </h5>
                                    
                                    <?php
                                    $typhoid_symptoms = array_filter($expert_rules, function($rule) {
                                        return $rule['disease_type'] === 'typhoid';
                                    });
                                    
                                    foreach ($typhoid_symptoms as $rule):
                                        $symptom_name = str_replace('_', ' ', $rule['symptom']);
                                        $symptom_name = ucwords($symptom_name);
                                        $severity_class = 'severity-' . str_replace('_', '-', $rule['severity']);
                                    ?>
                                        <div class="symptom-checkbox">
                                            <input type="checkbox" 
                                                   id="symptom_<?php echo $rule['symptom']; ?>" 
                                                   name="symptoms[]" 
                                                   value="<?php echo $rule['symptom']; ?>"
                                                   class="form-check-input">
                                            <label for="symptom_<?php echo $rule['symptom']; ?>" class="form-check-label">
                                                <?php echo $symptom_name; ?>
                                                <span class="symptom-severity <?php echo $severity_class; ?> ms-2">
                                                    <?php echo str_replace('_', ' ', $rule['severity']); ?>
                                                </span>
                                            </label>
                                        </div>
                                    <?php endforeach; ?>
                                </div>
                            </div>
                            
                            <div class="text-center mt-4">
                                <button type="submit" id="diagnoseBtn" class="btn btn-primary btn-lg" disabled>
                                    <i class="fas fa-stethoscope me-2"></i>Start AI Diagnosis
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
                
                <?php if ($diagnosis_result): ?>
                    <div id="diagnosisResult" class="mt-5">
                        <div class="diagnosis-result fade-in">
                            <h3 class="mb-3">
                                <i class="fas fa-stethoscope me-2"></i>Diagnosis Result
                            </h3>
                            
                            <div class="row">
                                <div class="col-md-6">
                                    <h4 class="mb-2"><?php echo htmlspecialchars($diagnosis_result['diagnosis']); ?></h4>
                                    <p class="mb-3">Confidence Level: <?php echo $diagnosis_result['confidence']; ?>%</p>
                                    
                                    <div class="confidence-bar">
                                        <div class="confidence-fill" style="width: <?php echo $diagnosis_result['confidence']; ?>%"></div>
                                    </div>
                                    
                                    <div class="mt-3">
                                        <small class="text-muted">
                                            Malaria: <?php echo $diagnosis_result['malaria_confidence']; ?>% | 
                                            Typhoid: <?php echo $diagnosis_result['typhoid_confidence']; ?>%
                                        </small>
                                    </div>
                                </div>
                                
                                <div class="col-md-6">
                                    <h5>Selected Symptoms:</h5>
                                    <ul class="list-unstyled">
                                        <?php foreach ($diagnosis_result['symptoms'] as $symptom): ?>
                                            <li>
                                                <i class="fas fa-check text-success me-2"></i>
                                                <?php echo ucwords(str_replace('_', ' ', $symptom)); ?>
                                            </li>
                                        <?php endforeach; ?>
                                    </ul>
                                </div>
                            </div>
                            
                            <?php if ($diagnosis_result['confidence'] > 70 && $diagnosis_result['disease_type'] !== 'unknown'): ?>
                                <div class="mt-4">
                                    <div class="alert alert-warning">
                                        <i class="fas fa-exclamation-triangle me-2"></i>
                                        <strong>Important:</strong> This is a preliminary diagnosis. Please book an appointment with a doctor for confirmation and proper treatment.
                                    </div>
                                    
                                    <?php if ($diagnosis_result['treatment']['requires_xray']): ?>
                                        <div class="alert alert-info">
                                            <i class="fas fa-x-ray me-2"></i>
                                            <strong>Note:</strong> Your symptoms require a chest X-ray in addition to drug treatment.
                                        </div>
                                    <?php endif; ?>
                                    
                                    <div class="text-center">
                                        <a href="appointment.php" class="btn btn-light btn-lg me-3">
                                            <i class="fas fa-calendar-plus me-2"></i>Book Appointment
                                        </a>
                                        <button type="button" class="btn btn-outline-light btn-lg" onclick="printDiagnosis()">
                                            <i class="fas fa-print me-2"></i>Print Result
                                        </button>
                                    </div>
                                </div>
                            <?php elseif ($diagnosis_result['confidence'] > 30): ?>
                                <div class="mt-4">
                                    <div class="alert alert-info">
                                        <i class="fas fa-info-circle me-2"></i>
                                        <strong>Note:</strong> The symptoms suggest a possible condition. Consider consulting a healthcare professional for proper evaluation.
                                    </div>
                                </div>
                            <?php else: ?>
                                <div class="mt-4">
                                    <div class="alert alert-success">
                                        <i class="fas fa-check-circle me-2"></i>
                                        <strong>Good news:</strong> The selected symptoms don't strongly indicate Malaria or Typhoid Fever. However, if symptoms persist or worsen, please consult a doctor.
                                    </div>
                                </div>
                            <?php endif; ?>
                        </div>
                    </div>
                <?php endif; ?>
                
                <div class="card mt-5">
                    <div class="card-body">
                        <h5 class="card-title">
                            <i class="fas fa-info-circle me-2"></i>Important Information
                        </h5>
                        <div class="row">
                            <div class="col-md-6">
                                <h6>About AI Diagnosis:</h6>
                                <ul class="list-unstyled">
                                    <li><i class="fas fa-check text-success me-2"></i>Preliminary assessment only</li>
                                    <li><i class="fas fa-check text-success me-2"></i>Based on expert system rules</li>
                                    <li><i class="fas fa-check text-success me-2"></i>Not a substitute for medical consultation</li>
                                </ul>
                            </div>
                            <div class="col-md-6">
                                <h6>Next Steps:</h6>
                                <ul class="list-unstyled">
                                    <li><i class="fas fa-arrow-right text-primary me-2"></i>Book appointment with doctor</li>
                                    <li><i class="fas fa-arrow-right text-primary me-2"></i>Get proper medical examination</li>
                                    <li><i class="fas fa-arrow-right text-primary me-2"></i>Follow prescribed treatment</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
    <script src="assets/js/main.js"></script>
    <script>
        function printDiagnosis() {
            const diagnosisResult = document.getElementById('diagnosisResult');
            if (diagnosisResult) {
                const printWindow = window.open('', '_blank');
                printWindow.document.write(`
                    <html>
                        <head>
                            <title>MESMTF Diagnosis Result</title>
                            <style>
                                body { font-family: Arial, sans-serif; margin: 20px; }
                                .diagnosis-result { background: #f8f9fa; padding: 20px; border-radius: 10px; }
                                .confidence-bar { background: #e9ecef; height: 20px; border-radius: 10px; overflow: hidden; }
                                .confidence-fill { background: #28a745; height: 100%; }
                                .alert { padding: 15px; margin: 10px 0; border-radius: 5px; }
                                .alert-warning { background: #fff3cd; border: 1px solid #ffeaa7; }
                                .alert-info { background: #d1ecf1; border: 1px solid #bee5eb; }
                                .alert-success { background: #d4edda; border: 1px solid #c3e6cb; }
                            </style>
                        </head>
                        <body>
                            <h1>MESMTF - Medical Expert System</h1>
                            <h2>Diagnosis Result</h2>
                            ${diagnosisResult.innerHTML}
                            <p><small>Generated on: ${new Date().toLocaleString()}</small></p>
                        </body>
                    </html>
                `);
                printWindow.document.close();
                printWindow.print();
            }
        }
    </script>
</body>
</html>