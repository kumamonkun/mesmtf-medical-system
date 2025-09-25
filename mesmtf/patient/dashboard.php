<?php
session_start();
require_once '../includes/config.php';

// Check if user is logged in and is a patient
require_login();
if (!has_role('patient')) {
    header('Location: ' . SITE_URL . '/login.php');
    exit();
}

// Get patient information
try {
    $stmt = $pdo->prepare("
        SELECT p.*, u.first_name, u.last_name, u.email, u.phone 
        FROM patients p 
        JOIN users u ON p.user_id = u.id 
        WHERE p.user_id = ?
    ");
    $stmt->execute([$_SESSION['user_id']]);
    $patient = $stmt->fetch();
    
    if (!$patient) {
        header('Location: ' . SITE_URL . '/login.php');
        exit();
    }
} catch (PDOException $e) {
    error_log("Error fetching patient data: " . $e->getMessage());
    $patient = null;
}

// Get recent appointments
try {
    $stmt = $pdo->prepare("
        SELECT a.*, d.first_name as doctor_first_name, d.last_name as doctor_last_name, 
               doc.specialization, doc.consultation_fee
        FROM appointments a
        JOIN doctors doc ON a.doctor_id = doc.id
        JOIN users d ON doc.user_id = d.id
        WHERE a.patient_id = ?
        ORDER BY a.appointment_date DESC, a.appointment_time DESC
        LIMIT 5
    ");
    $stmt->execute([$patient['id']]);
    $recent_appointments = $stmt->fetchAll();
} catch (PDOException $e) {
    $recent_appointments = [];
}

// Get recent diagnoses
try {
    $stmt = $pdo->prepare("
        SELECT d.*, doc.first_name as doctor_first_name, doc.last_name as doctor_last_name
        FROM diagnoses d
        LEFT JOIN doctors doc_doc ON d.doctor_id = doc_doc.id
        LEFT JOIN users doc ON doc_doc.user_id = doc.id
        WHERE d.patient_id = ?
        ORDER BY d.created_at DESC
        LIMIT 5
    ");
    $stmt->execute([$patient['id']]);
    $recent_diagnoses = $stmt->fetchAll();
} catch (PDOException $e) {
    $recent_diagnoses = [];
}

// Get statistics
try {
    // Total appointments
    $stmt = $pdo->prepare("SELECT COUNT(*) FROM appointments WHERE patient_id = ?");
    $stmt->execute([$patient['id']]);
    $total_appointments = $stmt->fetchColumn();
    
    // Upcoming appointments
    $stmt = $pdo->prepare("SELECT COUNT(*) FROM appointments WHERE patient_id = ? AND appointment_date >= CURDATE() AND status IN ('scheduled', 'confirmed')");
    $stmt->execute([$patient['id']]);
    $upcoming_appointments = $stmt->fetchColumn();
    
    // Total diagnoses
    $stmt = $pdo->prepare("SELECT COUNT(*) FROM diagnoses WHERE patient_id = ?");
    $stmt->execute([$patient['id']]);
    $total_diagnoses = $stmt->fetchColumn();
    
    // Pending prescriptions
    $stmt = $pdo->prepare("SELECT COUNT(*) FROM prescriptions WHERE patient_id = ? AND status = 'pending'");
    $stmt->execute([$patient['id']]);
    $pending_prescriptions = $stmt->fetchColumn();
} catch (PDOException $e) {
    $total_appointments = $upcoming_appointments = $total_diagnoses = $pending_prescriptions = 0;
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Patient Dashboard - MESMTF</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
    <link href="../assets/css/style.css" rel="stylesheet">
</head>
<body>
    <div class="container-fluid">
        <div class="row">
            <!-- Sidebar -->
            <nav class="col-md-3 col-lg-2 d-md-block sidebar collapse">
                <div class="position-sticky pt-3">
                    <div class="text-center mb-4">
                        <i class="fas fa-user-circle text-white display-4"></i>
                        <h5 class="text-white mt-2"><?php echo htmlspecialchars($patient['first_name'] . ' ' . $patient['last_name']); ?></h5>
                        <small class="text-white-50">Patient ID: <?php echo htmlspecialchars($patient['patient_id']); ?></small>
                    </div>
                    
                    <ul class="nav flex-column">
                        <li class="nav-item">
                            <a class="nav-link active" href="dashboard.php">
                                <i class="fas fa-tachometer-alt"></i> Dashboard
                            </a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link" href="appointments.php">
                                <i class="fas fa-calendar-check"></i> Appointments
                            </a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link" href="medical-records.php">
                                <i class="fas fa-file-medical"></i> Medical Records
                            </a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link" href="prescriptions.php">
                                <i class="fas fa-prescription-bottle-alt"></i> Prescriptions
                            </a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link" href="profile.php">
                                <i class="fas fa-user-edit"></i> Profile
                            </a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link" href="../diagnosis.php">
                                <i class="fas fa-robot"></i> AI Diagnosis
                            </a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link" href="../logout.php">
                                <i class="fas fa-sign-out-alt"></i> Logout
                            </a>
                        </li>
                    </ul>
                </div>
            </nav>

            <!-- Main content -->
            <main class="col-md-9 ms-sm-auto col-lg-10 px-md-4">
                <div class="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
                    <h1 class="h2">Patient Dashboard</h1>
                    <div class="btn-toolbar mb-2 mb-md-0">
                        <div class="btn-group me-2">
                            <a href="appointments.php?action=new" class="btn btn-primary">
                                <i class="fas fa-plus me-2"></i>Book Appointment
                            </a>
                        </div>
                    </div>
                </div>

                <!-- Statistics Cards -->
                <div class="row mb-4">
                    <div class="col-xl-3 col-md-6 mb-4">
                        <div class="card border-left-primary shadow h-100 py-2">
                            <div class="card-body">
                                <div class="row no-gutters align-items-center">
                                    <div class="col mr-2">
                                        <div class="text-xs font-weight-bold text-primary text-uppercase mb-1">
                                            Total Appointments
                                        </div>
                                        <div class="h5 mb-0 font-weight-bold text-gray-800"><?php echo $total_appointments; ?></div>
                                    </div>
                                    <div class="col-auto">
                                        <i class="fas fa-calendar fa-2x text-gray-300"></i>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="col-xl-3 col-md-6 mb-4">
                        <div class="card border-left-success shadow h-100 py-2">
                            <div class="card-body">
                                <div class="row no-gutters align-items-center">
                                    <div class="col mr-2">
                                        <div class="text-xs font-weight-bold text-success text-uppercase mb-1">
                                            Upcoming Appointments
                                        </div>
                                        <div class="h5 mb-0 font-weight-bold text-gray-800"><?php echo $upcoming_appointments; ?></div>
                                    </div>
                                    <div class="col-auto">
                                        <i class="fas fa-calendar-check fa-2x text-gray-300"></i>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="col-xl-3 col-md-6 mb-4">
                        <div class="card border-left-info shadow h-100 py-2">
                            <div class="card-body">
                                <div class="row no-gutters align-items-center">
                                    <div class="col mr-2">
                                        <div class="text-xs font-weight-bold text-info text-uppercase mb-1">
                                            Total Diagnoses
                                        </div>
                                        <div class="h5 mb-0 font-weight-bold text-gray-800"><?php echo $total_diagnoses; ?></div>
                                    </div>
                                    <div class="col-auto">
                                        <i class="fas fa-stethoscope fa-2x text-gray-300"></i>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="col-xl-3 col-md-6 mb-4">
                        <div class="card border-left-warning shadow h-100 py-2">
                            <div class="card-body">
                                <div class="row no-gutters align-items-center">
                                    <div class="col mr-2">
                                        <div class="text-xs font-weight-bold text-warning text-uppercase mb-1">
                                            Pending Prescriptions
                                        </div>
                                        <div class="h5 mb-0 font-weight-bold text-gray-800"><?php echo $pending_prescriptions; ?></div>
                                    </div>
                                    <div class="col-auto">
                                        <i class="fas fa-prescription-bottle-alt fa-2x text-gray-300"></i>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="row">
                    <!-- Recent Appointments -->
                    <div class="col-lg-6 mb-4">
                        <div class="card shadow">
                            <div class="card-header py-3 d-flex flex-row align-items-center justify-content-between">
                                <h6 class="m-0 font-weight-bold text-primary">Recent Appointments</h6>
                                <a href="appointments.php" class="btn btn-sm btn-primary">View All</a>
                            </div>
                            <div class="card-body">
                                <?php if (empty($recent_appointments)): ?>
                                    <div class="text-center py-4">
                                        <i class="fas fa-calendar-times fa-3x text-muted mb-3"></i>
                                        <p class="text-muted">No appointments found</p>
                                        <a href="appointments.php?action=new" class="btn btn-primary">Book Your First Appointment</a>
                                    </div>
                                <?php else: ?>
                                    <div class="table-responsive">
                                        <table class="table table-borderless">
                                            <thead>
                                                <tr>
                                                    <th>Date</th>
                                                    <th>Doctor</th>
                                                    <th>Status</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <?php foreach ($recent_appointments as $appointment): ?>
                                                    <tr>
                                                        <td>
                                                            <strong><?php echo format_date($appointment['appointment_date'], 'M d, Y'); ?></strong><br>
                                                            <small class="text-muted"><?php echo format_date($appointment['appointment_time'], 'g:i A'); ?></small>
                                                        </td>
                                                        <td>
                                                            <?php echo htmlspecialchars($appointment['doctor_first_name'] . ' ' . $appointment['doctor_last_name']); ?><br>
                                                            <small class="text-muted"><?php echo htmlspecialchars($appointment['specialization']); ?></small>
                                                        </td>
                                                        <td>
                                                            <span class="badge bg-<?php 
                                                                echo $appointment['status'] === 'completed' ? 'success' : 
                                                                    ($appointment['status'] === 'cancelled' ? 'danger' : 'primary'); 
                                                            ?>">
                                                                <?php echo ucfirst($appointment['status']); ?>
                                                            </span>
                                                        </td>
                                                    </tr>
                                                <?php endforeach; ?>
                                            </tbody>
                                        </table>
                                    </div>
                                <?php endif; ?>
                            </div>
                        </div>
                    </div>

                    <!-- Recent Diagnoses -->
                    <div class="col-lg-6 mb-4">
                        <div class="card shadow">
                            <div class="card-header py-3 d-flex flex-row align-items-center justify-content-between">
                                <h6 class="m-0 font-weight-bold text-primary">Recent Diagnoses</h6>
                                <a href="medical-records.php" class="btn btn-sm btn-primary">View All</a>
                            </div>
                            <div class="card-body">
                                <?php if (empty($recent_diagnoses)): ?>
                                    <div class="text-center py-4">
                                        <i class="fas fa-stethoscope fa-3x text-muted mb-3"></i>
                                        <p class="text-muted">No diagnoses found</p>
                                        <a href="../diagnosis.php" class="btn btn-primary">Try AI Diagnosis</a>
                                    </div>
                                <?php else: ?>
                                    <div class="table-responsive">
                                        <table class="table table-borderless">
                                            <thead>
                                                <tr>
                                                    <th>Date</th>
                                                    <th>Diagnosis</th>
                                                    <th>Confidence</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <?php foreach ($recent_diagnoses as $diagnosis): ?>
                                                    <tr>
                                                        <td>
                                                            <strong><?php echo format_date($diagnosis['created_at'], 'M d, Y'); ?></strong><br>
                                                            <small class="text-muted"><?php echo format_date($diagnosis['created_at'], 'g:i A'); ?></small>
                                                        </td>
                                                        <td>
                                                            <?php echo htmlspecialchars($diagnosis['final_diagnosis'] ?: $diagnosis['preliminary_diagnosis']); ?>
                                                        </td>
                                                        <td>
                                                            <div class="progress" style="height: 20px;">
                                                                <div class="progress-bar" role="progressbar" 
                                                                     style="width: <?php echo $diagnosis['confidence_score']; ?>%"
                                                                     aria-valuenow="<?php echo $diagnosis['confidence_score']; ?>" 
                                                                     aria-valuemin="0" aria-valuemax="100">
                                                                    <?php echo $diagnosis['confidence_score']; ?>%
                                                                </div>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                <?php endforeach; ?>
                                            </tbody>
                                        </table>
                                    </div>
                                <?php endif; ?>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Quick Actions -->
                <div class="row">
                    <div class="col-12">
                        <div class="card shadow">
                            <div class="card-header py-3">
                                <h6 class="m-0 font-weight-bold text-primary">Quick Actions</h6>
                            </div>
                            <div class="card-body">
                                <div class="row">
                                    <div class="col-md-3 mb-3">
                                        <a href="appointments.php?action=new" class="btn btn-outline-primary w-100 h-100 d-flex flex-column align-items-center justify-content-center py-4">
                                            <i class="fas fa-calendar-plus fa-2x mb-2"></i>
                                            <span>Book Appointment</span>
                                        </a>
                                    </div>
                                    <div class="col-md-3 mb-3">
                                        <a href="../diagnosis.php" class="btn btn-outline-success w-100 h-100 d-flex flex-column align-items-center justify-content-center py-4">
                                            <i class="fas fa-robot fa-2x mb-2"></i>
                                            <span>AI Diagnosis</span>
                                        </a>
                                    </div>
                                    <div class="col-md-3 mb-3">
                                        <a href="medical-records.php" class="btn btn-outline-info w-100 h-100 d-flex flex-column align-items-center justify-content-center py-4">
                                            <i class="fas fa-file-medical fa-2x mb-2"></i>
                                            <span>Medical Records</span>
                                        </a>
                                    </div>
                                    <div class="col-md-3 mb-3">
                                        <a href="prescriptions.php" class="btn btn-outline-warning w-100 h-100 d-flex flex-column align-items-center justify-content-center py-4">
                                            <i class="fas fa-prescription-bottle-alt fa-2x mb-2"></i>
                                            <span>Prescriptions</span>
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
    <script src="../assets/js/main.js"></script>
</body>
</html>