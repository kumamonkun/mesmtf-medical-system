<?php
session_start();
require_once 'includes/config.php';

// Redirect if already logged in
if (is_logged_in()) {
    redirect_by_role();
}

$error_message = '';
$success_message = '';

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $username = sanitize_input($_POST['username']);
    $email = sanitize_input($_POST['email']);
    $password = $_POST['password'];
    $confirm_password = $_POST['confirm_password'];
    $first_name = sanitize_input($_POST['first_name']);
    $last_name = sanitize_input($_POST['last_name']);
    $phone = sanitize_input($_POST['phone']);
    $role = sanitize_input($_POST['role']);
    
    // Validation
    if (empty($username) || empty($email) || empty($password) || empty($first_name) || empty($last_name) || empty($role)) {
        $error_message = 'Please fill in all required fields.';
    } elseif (!validate_email($email)) {
        $error_message = 'Please enter a valid email address.';
    } elseif (strlen($password) < 6) {
        $error_message = 'Password must be at least 6 characters long.';
    } elseif ($password !== $confirm_password) {
        $error_message = 'Passwords do not match.';
    } else {
        try {
            // Check if username or email already exists
            $stmt = $pdo->prepare("SELECT id FROM users WHERE username = ? OR email = ?");
            $stmt->execute([$username, $email]);
            
            if ($stmt->fetch()) {
                $error_message = 'Username or email already exists.';
            } else {
                // Hash password
                $password_hash = password_hash($password, PASSWORD_DEFAULT);
                
                // Insert user
                $stmt = $pdo->prepare("INSERT INTO users (username, email, password_hash, first_name, last_name, phone, role) VALUES (?, ?, ?, ?, ?, ?, ?)");
                $stmt->execute([$username, $email, $password_hash, $first_name, $last_name, $phone, $role]);
                
                $user_id = $pdo->lastInsertId();
                
                // If patient, create patient record
                if ($role === 'patient') {
                    $patient_id = generate_patient_id();
                    $date_of_birth = !empty($_POST['date_of_birth']) ? $_POST['date_of_birth'] : null;
                    $gender = !empty($_POST['gender']) ? $_POST['gender'] : null;
                    $address = !empty($_POST['address']) ? sanitize_input($_POST['address']) : null;
                    
                    $stmt = $pdo->prepare("INSERT INTO patients (user_id, patient_id, date_of_birth, gender, address) VALUES (?, ?, ?, ?, ?)");
                    $stmt->execute([$user_id, $patient_id, $date_of_birth, $gender, $address]);
                }
                
                // If doctor, create doctor record
                if ($role === 'doctor') {
                    $license_number = sanitize_input($_POST['license_number']);
                    $specialization = sanitize_input($_POST['specialization']);
                    $experience_years = !empty($_POST['experience_years']) ? (int)$_POST['experience_years'] : 0;
                    $consultation_fee = !empty($_POST['consultation_fee']) ? (float)$_POST['consultation_fee'] : 0;
                    
                    $stmt = $pdo->prepare("INSERT INTO doctors (user_id, license_number, specialization, experience_years, consultation_fee) VALUES (?, ?, ?, ?, ?)");
                    $stmt->execute([$user_id, $license_number, $specialization, $experience_years, $consultation_fee]);
                }
                
                // Log registration
                log_activity($user_id, 'registration', 'User registered successfully');
                
                $success_message = 'Registration successful! You can now login with your credentials.';
                
                // Clear form data
                $_POST = [];
            }
        } catch (PDOException $e) {
            $error_message = 'Database error. Please try again.';
            error_log("Registration error: " . $e->getMessage());
        }
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Register - MESMTF</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
    <link href="assets/css/style.css" rel="stylesheet">
</head>
<body class="bg-light">
    <div class="container py-5">
        <div class="row justify-content-center">
            <div class="col-md-8 col-lg-6">
                <div class="card shadow-lg border-0 rounded-custom">
                    <div class="card-body p-5">
                        <div class="text-center mb-4">
                            <i class="fas fa-user-plus text-primary display-4 mb-3"></i>
                            <h2 class="fw-bold text-gradient">Create Account</h2>
                            <p class="text-muted">Join the MESMTF Medical Expert System</p>
                        </div>
                        
                        <?php if ($error_message): ?>
                            <div class="alert alert-danger alert-dismissible fade show" role="alert">
                                <i class="fas fa-exclamation-circle me-2"></i>
                                <?php echo $error_message; ?>
                                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
                            </div>
                        <?php endif; ?>
                        
                        <?php if ($success_message): ?>
                            <div class="alert alert-success alert-dismissible fade show" role="alert">
                                <i class="fas fa-check-circle me-2"></i>
                                <?php echo $success_message; ?>
                                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
                            </div>
                        <?php endif; ?>
                        
                        <form method="POST" class="needs-validation" novalidate>
                            <div class="row">
                                <div class="col-md-6">
                                    <div class="mb-3">
                                        <label for="first_name" class="form-label">
                                            <i class="fas fa-user me-2"></i>First Name *
                                        </label>
                                        <input type="text" class="form-control" id="first_name" name="first_name" 
                                               value="<?php echo isset($_POST['first_name']) ? htmlspecialchars($_POST['first_name']) : ''; ?>" 
                                               required>
                                        <div class="invalid-feedback">
                                            Please enter your first name.
                                        </div>
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <div class="mb-3">
                                        <label for="last_name" class="form-label">
                                            <i class="fas fa-user me-2"></i>Last Name *
                                        </label>
                                        <input type="text" class="form-control" id="last_name" name="last_name" 
                                               value="<?php echo isset($_POST['last_name']) ? htmlspecialchars($_POST['last_name']) : ''; ?>" 
                                               required>
                                        <div class="invalid-feedback">
                                            Please enter your last name.
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="mb-3">
                                <label for="username" class="form-label">
                                    <i class="fas fa-at me-2"></i>Username *
                                </label>
                                <input type="text" class="form-control" id="username" name="username" 
                                       value="<?php echo isset($_POST['username']) ? htmlspecialchars($_POST['username']) : ''; ?>" 
                                       required>
                                <div class="invalid-feedback">
                                    Please enter a username.
                                </div>
                            </div>
                            
                            <div class="mb-3">
                                <label for="email" class="form-label">
                                    <i class="fas fa-envelope me-2"></i>Email Address *
                                </label>
                                <input type="email" class="form-control" id="email" name="email" 
                                       value="<?php echo isset($_POST['email']) ? htmlspecialchars($_POST['email']) : ''; ?>" 
                                       required>
                                <div class="invalid-feedback">
                                    Please enter a valid email address.
                                </div>
                            </div>
                            
                            <div class="mb-3">
                                <label for="phone" class="form-label">
                                    <i class="fas fa-phone me-2"></i>Phone Number
                                </label>
                                <input type="tel" class="form-control" id="phone" name="phone" 
                                       value="<?php echo isset($_POST['phone']) ? htmlspecialchars($_POST['phone']) : ''; ?>">
                            </div>
                            
                            <div class="mb-3">
                                <label for="role" class="form-label">
                                    <i class="fas fa-user-tag me-2"></i>User Type *
                                </label>
                                <select class="form-select" id="role" name="role" required onchange="toggleRoleFields()">
                                    <option value="">Select your role</option>
                                    <option value="patient" <?php echo (isset($_POST['role']) && $_POST['role'] === 'patient') ? 'selected' : ''; ?>>Patient</option>
                                    <option value="doctor" <?php echo (isset($_POST['role']) && $_POST['role'] === 'doctor') ? 'selected' : ''; ?>>Doctor</option>
                                    <option value="nurse" <?php echo (isset($_POST['role']) && $_POST['role'] === 'nurse') ? 'selected' : ''; ?>>Nurse</option>
                                    <option value="pharmacist" <?php echo (isset($_POST['role']) && $_POST['role'] === 'pharmacist') ? 'selected' : ''; ?>>Pharmacist</option>
                                    <option value="receptionist" <?php echo (isset($_POST['role']) && $_POST['role'] === 'receptionist') ? 'selected' : ''; ?>>Receptionist</option>
                                </select>
                                <div class="invalid-feedback">
                                    Please select your role.
                                </div>
                            </div>
                            
                            <!-- Patient-specific fields -->
                            <div id="patientFields" style="display: none;">
                                <div class="row">
                                    <div class="col-md-6">
                                        <div class="mb-3">
                                            <label for="date_of_birth" class="form-label">
                                                <i class="fas fa-calendar me-2"></i>Date of Birth
                                            </label>
                                            <input type="date" class="form-control" id="date_of_birth" name="date_of_birth" 
                                                   value="<?php echo isset($_POST['date_of_birth']) ? htmlspecialchars($_POST['date_of_birth']) : ''; ?>">
                                        </div>
                                    </div>
                                    <div class="col-md-6">
                                        <div class="mb-3">
                                            <label for="gender" class="form-label">
                                                <i class="fas fa-venus-mars me-2"></i>Gender
                                            </label>
                                            <select class="form-select" id="gender" name="gender">
                                                <option value="">Select gender</option>
                                                <option value="male" <?php echo (isset($_POST['gender']) && $_POST['gender'] === 'male') ? 'selected' : ''; ?>>Male</option>
                                                <option value="female" <?php echo (isset($_POST['gender']) && $_POST['gender'] === 'female') ? 'selected' : ''; ?>>Female</option>
                                                <option value="other" <?php echo (isset($_POST['gender']) && $_POST['gender'] === 'other') ? 'selected' : ''; ?>>Other</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                                <div class="mb-3">
                                    <label for="address" class="form-label">
                                        <i class="fas fa-map-marker-alt me-2"></i>Address
                                    </label>
                                    <textarea class="form-control" id="address" name="address" rows="3"><?php echo isset($_POST['address']) ? htmlspecialchars($_POST['address']) : ''; ?></textarea>
                                </div>
                            </div>
                            
                            <!-- Doctor-specific fields -->
                            <div id="doctorFields" style="display: none;">
                                <div class="row">
                                    <div class="col-md-6">
                                        <div class="mb-3">
                                            <label for="license_number" class="form-label">
                                                <i class="fas fa-certificate me-2"></i>License Number *
                                            </label>
                                            <input type="text" class="form-control" id="license_number" name="license_number" 
                                                   value="<?php echo isset($_POST['license_number']) ? htmlspecialchars($_POST['license_number']) : ''; ?>">
                                        </div>
                                    </div>
                                    <div class="col-md-6">
                                        <div class="mb-3">
                                            <label for="specialization" class="form-label">
                                                <i class="fas fa-stethoscope me-2"></i>Specialization *
                                            </label>
                                            <input type="text" class="form-control" id="specialization" name="specialization" 
                                                   value="<?php echo isset($_POST['specialization']) ? htmlspecialchars($_POST['specialization']) : ''; ?>">
                                        </div>
                                    </div>
                                </div>
                                <div class="row">
                                    <div class="col-md-6">
                                        <div class="mb-3">
                                            <label for="experience_years" class="form-label">
                                                <i class="fas fa-clock me-2"></i>Experience (Years)
                                            </label>
                                            <input type="number" class="form-control" id="experience_years" name="experience_years" 
                                                   value="<?php echo isset($_POST['experience_years']) ? htmlspecialchars($_POST['experience_years']) : ''; ?>" min="0">
                                        </div>
                                    </div>
                                    <div class="col-md-6">
                                        <div class="mb-3">
                                            <label for="consultation_fee" class="form-label">
                                                <i class="fas fa-dollar-sign me-2"></i>Consultation Fee
                                            </label>
                                            <input type="number" class="form-control" id="consultation_fee" name="consultation_fee" 
                                                   value="<?php echo isset($_POST['consultation_fee']) ? htmlspecialchars($_POST['consultation_fee']) : ''; ?>" min="0" step="0.01">
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="row">
                                <div class="col-md-6">
                                    <div class="mb-3">
                                        <label for="password" class="form-label">
                                            <i class="fas fa-lock me-2"></i>Password *
                                        </label>
                                        <div class="input-group">
                                            <input type="password" class="form-control" id="password" name="password" required>
                                            <button class="btn btn-outline-secondary" type="button" id="togglePassword">
                                                <i class="fas fa-eye"></i>
                                            </button>
                                        </div>
                                        <div class="invalid-feedback">
                                            Password must be at least 6 characters long.
                                        </div>
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <div class="mb-3">
                                        <label for="confirm_password" class="form-label">
                                            <i class="fas fa-lock me-2"></i>Confirm Password *
                                        </label>
                                        <input type="password" class="form-control" id="confirm_password" name="confirm_password" required>
                                        <div class="invalid-feedback">
                                            Passwords do not match.
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="mb-3 form-check">
                                <input type="checkbox" class="form-check-input" id="agreeTerms" required>
                                <label class="form-check-label" for="agreeTerms">
                                    I agree to the <a href="#" class="text-decoration-none">Terms of Service</a> and <a href="#" class="text-decoration-none">Privacy Policy</a>
                                </label>
                                <div class="invalid-feedback">
                                    You must agree to the terms and conditions.
                                </div>
                            </div>
                            
                            <button type="submit" class="btn btn-primary w-100 btn-lg mb-3">
                                <i class="fas fa-user-plus me-2"></i>Create Account
                            </button>
                        </form>
                        
                        <div class="text-center">
                            <p class="mb-0">
                                Already have an account? 
                                <a href="login.php" class="text-decoration-none fw-bold">
                                    Login here
                                </a>
                            </p>
                        </div>
                        
                        <hr class="my-4">
                        
                        <div class="text-center">
                            <a href="index.php" class="btn btn-outline-secondary">
                                <i class="fas fa-home me-2"></i>Back to Home
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
    <script src="assets/js/main.js"></script>
    <script>
        function toggleRoleFields() {
            const role = document.getElementById('role').value;
            const patientFields = document.getElementById('patientFields');
            const doctorFields = document.getElementById('doctorFields');
            
            // Hide all role-specific fields
            patientFields.style.display = 'none';
            doctorFields.style.display = 'none';
            
            // Show relevant fields based on role
            if (role === 'patient') {
                patientFields.style.display = 'block';
            } else if (role === 'doctor') {
                doctorFields.style.display = 'block';
            }
        }
        
        // Toggle password visibility
        document.getElementById('togglePassword').addEventListener('click', function() {
            const passwordField = document.getElementById('password');
            const icon = this.querySelector('i');
            
            if (passwordField.type === 'password') {
                passwordField.type = 'text';
                icon.classList.remove('fa-eye');
                icon.classList.add('fa-eye-slash');
            } else {
                passwordField.type = 'password';
                icon.classList.remove('fa-eye-slash');
                icon.classList.add('fa-eye');
            }
        });
        
        // Password confirmation validation
        document.getElementById('confirm_password').addEventListener('input', function() {
            const password = document.getElementById('password').value;
            const confirmPassword = this.value;
            
            if (password !== confirmPassword) {
                this.setCustomValidity('Passwords do not match');
            } else {
                this.setCustomValidity('');
            }
        });
        
        // Initialize role fields on page load
        document.addEventListener('DOMContentLoaded', function() {
            toggleRoleFields();
        });
    </script>
</body>
</html>