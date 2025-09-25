<?php
session_start();
require_once 'includes/config.php';
require_once 'includes/functions.php';

// Check if user is already logged in
if (isset($_SESSION['user_id'])) {
    $user_role = $_SESSION['user_role'];
    switch ($user_role) {
        case 'admin':
            header('Location: admin/dashboard.php');
            break;
        case 'doctor':
            header('Location: doctor/dashboard.php');
            break;
        case 'patient':
            header('Location: patient/dashboard.php');
            break;
        case 'pharmacist':
            header('Location: pharmacy/dashboard.php');
            break;
        default:
            header('Location: login.php');
    }
    exit();
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>MESMTF - Medical Expert System for Malaria and Typhoid Fever</title>
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
                        <a class="nav-link" href="diagnosis.php">AI Diagnosis</a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" href="login.php">Login</a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" href="register.php">Register</a>
                    </li>
                </ul>
            </div>
        </div>
    </nav>

    <!-- Hero Section -->
    <section class="hero-section bg-gradient-primary text-white py-5">
        <div class="container">
            <div class="row align-items-center">
                <div class="col-lg-6">
                    <h1 class="display-4 fw-bold mb-4">Medical Expert System for Malaria and Typhoid Fever</h1>
                    <p class="lead mb-4">Advanced AI-powered diagnosis system for the Ministry of Health and Social Services. Get instant preliminary diagnosis and connect with medical experts.</p>
                    <div class="d-flex gap-3">
                        <a href="diagnosis.php" class="btn btn-light btn-lg">
                            <i class="fas fa-robot me-2"></i>Start AI Diagnosis
                        </a>
                        <a href="register.php" class="btn btn-outline-light btn-lg">
                            <i class="fas fa-user-plus me-2"></i>Register
                        </a>
                    </div>
                </div>
                <div class="col-lg-6">
                    <div class="text-center">
                        <i class="fas fa-heartbeat display-1 text-white-50"></i>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- Features Section -->
    <section class="py-5">
        <div class="container">
            <div class="row text-center mb-5">
                <div class="col-12">
                    <h2 class="display-5 fw-bold">System Features</h2>
                    <p class="lead text-muted">Comprehensive e-Health solution for medical care</p>
                </div>
            </div>
            <div class="row g-4">
                <div class="col-md-4">
                    <div class="card h-100 border-0 shadow-sm">
                        <div class="card-body text-center p-4">
                            <div class="feature-icon bg-primary text-white rounded-circle mx-auto mb-3">
                                <i class="fas fa-brain fa-2x"></i>
                            </div>
                            <h5 class="card-title">AI Diagnosis</h5>
                            <p class="card-text">Expert system with rule-based inference for accurate preliminary diagnosis of Malaria and Typhoid Fever.</p>
                        </div>
                    </div>
                </div>
                <div class="col-md-4">
                    <div class="card h-100 border-0 shadow-sm">
                        <div class="card-body text-center p-4">
                            <div class="feature-icon bg-success text-white rounded-circle mx-auto mb-3">
                                <i class="fas fa-calendar-check fa-2x"></i>
                            </div>
                            <h5 class="card-title">Appointment Booking</h5>
                            <p class="card-text">Easy appointment scheduling with available doctors and specialists in Malaria and Typhoid treatment.</p>
                        </div>
                    </div>
                </div>
                <div class="col-md-4">
                    <div class="card h-100 border-0 shadow-sm">
                        <div class="card-body text-center p-4">
                            <div class="feature-icon bg-info text-white rounded-circle mx-auto mb-3">
                                <i class="fas fa-pills fa-2x"></i>
                            </div>
                            <h5 class="card-title">Pharmacy Management</h5>
                            <p class="card-text">Complete drug inventory management and prescription tracking system.</p>
                        </div>
                    </div>
                </div>
                <div class="col-md-4">
                    <div class="card h-100 border-0 shadow-sm">
                        <div class="card-body text-center p-4">
                            <div class="feature-icon bg-warning text-white rounded-circle mx-auto mb-3">
                                <i class="fas fa-file-medical fa-2x"></i>
                            </div>
                            <h5 class="card-title">Medical Records</h5>
                            <p class="card-text">Secure and comprehensive patient medical record management system.</p>
                        </div>
                    </div>
                </div>
                <div class="col-md-4">
                    <div class="card h-100 border-0 shadow-sm">
                        <div class="card-body text-center p-4">
                            <div class="feature-icon bg-danger text-white rounded-circle mx-auto mb-3">
                                <i class="fas fa-chart-line fa-2x"></i>
                            </div>
                            <h5 class="card-title">Reporting</h5>
                            <p class="card-text">Generate comprehensive medical reports and statistical analysis.</p>
                        </div>
                    </div>
                </div>
                <div class="col-md-4">
                    <div class="card h-100 border-0 shadow-sm">
                        <div class="card-body text-center p-4">
                            <div class="feature-icon bg-secondary text-white rounded-circle mx-auto mb-3">
                                <i class="fas fa-shield-alt fa-2x"></i>
                            </div>
                            <h5 class="card-title">Secure Access</h5>
                            <p class="card-text">Role-based access control for patients, doctors, nurses, and administrators.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- CTA Section -->
    <section class="bg-light py-5">
        <div class="container">
            <div class="row align-items-center">
                <div class="col-lg-8">
                    <h3 class="mb-3">Ready to get started?</h3>
                    <p class="mb-0">Join thousands of patients who trust our AI-powered medical diagnosis system.</p>
                </div>
                <div class="col-lg-4 text-end">
                    <a href="register.php" class="btn btn-primary btn-lg">
                        <i class="fas fa-user-plus me-2"></i>Register Now
                    </a>
                </div>
            </div>
        </div>
    </section>

    <!-- Footer -->
    <footer class="bg-dark text-white py-4">
        <div class="container">
            <div class="row">
                <div class="col-md-6">
                    <h5>MESMTF System</h5>
                    <p class="mb-0">Medical Expert System for Malaria and Typhoid Fever</p>
                </div>
                <div class="col-md-6 text-end">
                    <p class="mb-0">&copy; 2025 Ministry of Health and Social Services. All rights reserved.</p>
                </div>
            </div>
        </div>
    </footer>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
    <script src="assets/js/main.js"></script>
</body>
</html>