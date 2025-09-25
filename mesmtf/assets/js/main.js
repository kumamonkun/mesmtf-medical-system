// MESMTF - Medical Expert System JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Initialize tooltips
    var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });

    // Initialize popovers
    var popoverTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="popover"]'));
    var popoverList = popoverTriggerList.map(function (popoverTriggerEl) {
        return new bootstrap.Popover(popoverTriggerEl);
    });

    // Auto-hide alerts after 5 seconds
    setTimeout(function() {
        var alerts = document.querySelectorAll('.alert');
        alerts.forEach(function(alert) {
            var bsAlert = new bootstrap.Alert(alert);
            bsAlert.close();
        });
    }, 5000);

    // Form validation
    initializeFormValidation();
    
    // Initialize diagnosis form
    initializeDiagnosisForm();
    
    // Initialize dashboard
    initializeDashboard();
});

// Form Validation
function initializeFormValidation() {
    const forms = document.querySelectorAll('.needs-validation');
    
    Array.from(forms).forEach(form => {
        form.addEventListener('submit', event => {
            if (!form.checkValidity()) {
                event.preventDefault();
                event.stopPropagation();
            }
            form.classList.add('was-validated');
        });
    });
}

// Diagnosis Form Functions
function initializeDiagnosisForm() {
    const diagnosisForm = document.getElementById('diagnosisForm');
    if (diagnosisForm) {
        diagnosisForm.addEventListener('submit', handleDiagnosisSubmit);
        
        // Add symptom selection handlers
        const symptomCheckboxes = document.querySelectorAll('.symptom-checkbox input[type="checkbox"]');
        symptomCheckboxes.forEach(checkbox => {
            checkbox.addEventListener('change', updateSymptomSelection);
        });
    }
}

function updateSymptomSelection() {
    const selectedSymptoms = document.querySelectorAll('.symptom-checkbox input[type="checkbox"]:checked');
    const submitBtn = document.getElementById('diagnoseBtn');
    
    if (selectedSymptoms.length > 0) {
        submitBtn.disabled = false;
        submitBtn.textContent = `Diagnose (${selectedSymptoms.length} symptoms selected)`;
    } else {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Select symptoms to diagnose';
    }
}

function handleDiagnosisSubmit(event) {
    event.preventDefault();
    
    const form = event.target;
    const formData = new FormData(form);
    const selectedSymptoms = [];
    
    // Collect selected symptoms
    const checkboxes = form.querySelectorAll('input[type="checkbox"]:checked');
    checkboxes.forEach(checkbox => {
        selectedSymptoms.push(checkbox.value);
    });
    
    if (selectedSymptoms.length === 0) {
        showAlert('Please select at least one symptom.', 'warning');
        return;
    }
    
    // Show loading state
    const submitBtn = document.getElementById('diagnoseBtn');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<span class="spinner"></span> Analyzing...';
    submitBtn.disabled = true;
    
    // Simulate diagnosis process (replace with actual AJAX call)
    setTimeout(() => {
        performDiagnosis(selectedSymptoms);
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }, 2000);
}

function performDiagnosis(symptoms) {
    // This would normally be an AJAX call to the server
    // For now, we'll simulate the diagnosis
    
    const malariaConfidence = calculateMalariaConfidence(symptoms);
    const typhoidConfidence = calculateTyphoidConfidence(symptoms);
    
    let diagnosis = '';
    let confidence = 0;
    let diseaseType = '';
    
    if (malariaConfidence > typhoidConfidence && malariaConfidence > 30) {
        diagnosis = 'Malaria';
        confidence = malariaConfidence;
        diseaseType = 'malaria';
    } else if (typhoidConfidence > malariaConfidence && typhoidConfidence > 30) {
        diagnosis = 'Typhoid Fever';
        confidence = typhoidConfidence;
        diseaseType = 'typhoid';
    } else {
        diagnosis = 'Insufficient symptoms for diagnosis';
        confidence = Math.max(malariaConfidence, typhoidConfidence);
        diseaseType = 'unknown';
    }
    
    displayDiagnosisResult(diagnosis, confidence, diseaseType, symptoms);
}

function calculateMalariaConfidence(symptoms) {
    const weights = {
        'abdominal_pain': 4,
        'vomiting': 4,
        'sore_throat': 4,
        'headache': 3,
        'fatigue': 3,
        'cough': 3,
        'chest_pain': 2,
        'back_pain': 2,
        'muscle_pain': 2,
        'diarrhea': 1,
        'sweating': 1,
        'rash': 1
    };
    
    let totalWeight = 0;
    let maxWeight = 0;
    
    symptoms.forEach(symptom => {
        if (weights[symptom]) {
            totalWeight += weights[symptom];
        }
    });
    
    // Calculate maximum possible weight
    Object.values(weights).forEach(weight => {
        maxWeight += weight;
    });
    
    return Math.round((totalWeight / maxWeight) * 100);
}

function calculateTyphoidConfidence(symptoms) {
    const weights = {
        'abdominal_pain': 4,
        'stomach_issues': 4,
        'constipation': 3,
        'headache': 3,
        'persistent_high_fever': 3,
        'weakness': 2,
        'tiredness': 2,
        'loss_of_appetite': 1,
        'rash': 1
    };
    
    let totalWeight = 0;
    let maxWeight = 0;
    
    symptoms.forEach(symptom => {
        if (weights[symptom]) {
            totalWeight += weights[symptom];
        }
    });
    
    // Calculate maximum possible weight
    Object.values(weights).forEach(weight => {
        maxWeight += weight;
    });
    
    return Math.round((totalWeight / maxWeight) * 100);
}

function displayDiagnosisResult(diagnosis, confidence, diseaseType, symptoms) {
    const resultContainer = document.getElementById('diagnosisResult');
    if (!resultContainer) return;
    
    let resultHTML = `
        <div class="diagnosis-result fade-in">
            <h3 class="mb-3">
                <i class="fas fa-stethoscope me-2"></i>
                Diagnosis Result
            </h3>
            <div class="row">
                <div class="col-md-6">
                    <h4 class="mb-2">${diagnosis}</h4>
                    <p class="mb-3">Confidence Level: ${confidence}%</p>
                    <div class="confidence-bar">
                        <div class="confidence-fill" style="width: ${confidence}%"></div>
                    </div>
                </div>
                <div class="col-md-6">
                    <h5>Selected Symptoms:</h5>
                    <ul class="list-unstyled">
    `;
    
    symptoms.forEach(symptom => {
        const symptomName = symptom.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        resultHTML += `<li><i class="fas fa-check text-success me-2"></i>${symptomName}</li>`;
    });
    
    resultHTML += `
                    </ul>
                </div>
            </div>
    `;
    
    if (confidence > 70 && diseaseType !== 'unknown') {
        resultHTML += `
            <div class="mt-4">
                <div class="alert alert-warning">
                    <i class="fas fa-exclamation-triangle me-2"></i>
                    <strong>Important:</strong> This is a preliminary diagnosis. Please book an appointment with a doctor for confirmation and proper treatment.
                </div>
                <div class="text-center">
                    <a href="appointment.php" class="btn btn-light btn-lg">
                        <i class="fas fa-calendar-plus me-2"></i>
                        Book Appointment
                    </a>
                </div>
            </div>
        `;
    } else if (confidence > 30) {
        resultHTML += `
            <div class="mt-4">
                <div class="alert alert-info">
                    <i class="fas fa-info-circle me-2"></i>
                    <strong>Note:</strong> The symptoms suggest a possible condition. Consider consulting a healthcare professional for proper evaluation.
                </div>
            </div>
        `;
    } else {
        resultHTML += `
            <div class="mt-4">
                <div class="alert alert-success">
                    <i class="fas fa-check-circle me-2"></i>
                    <strong>Good news:</strong> The selected symptoms don't strongly indicate Malaria or Typhoid Fever. However, if symptoms persist or worsen, please consult a doctor.
                </div>
            </div>
        `;
    }
    
    resultHTML += '</div>';
    
    resultContainer.innerHTML = resultHTML;
    resultContainer.scrollIntoView({ behavior: 'smooth' });
}

// Dashboard Functions
function initializeDashboard() {
    // Initialize charts if Chart.js is available
    if (typeof Chart !== 'undefined') {
        initializeCharts();
    }
    
    // Initialize real-time updates
    initializeRealTimeUpdates();
}

function initializeCharts() {
    // Patient Statistics Chart
    const patientCtx = document.getElementById('patientChart');
    if (patientCtx) {
        new Chart(patientCtx, {
            type: 'doughnut',
            data: {
                labels: ['New Patients', 'Returning Patients', 'Total Appointments'],
                datasets: [{
                    data: [12, 19, 3],
                    backgroundColor: [
                        '#FF6384',
                        '#36A2EB',
                        '#FFCE56'
                    ]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false
            }
        });
    }
    
    // Diagnosis Statistics Chart
    const diagnosisCtx = document.getElementById('diagnosisChart');
    if (diagnosisCtx) {
        new Chart(diagnosisCtx, {
            type: 'bar',
            data: {
                labels: ['Malaria', 'Typhoid', 'Both', 'Other'],
                datasets: [{
                    label: 'Diagnoses',
                    data: [12, 19, 3, 5],
                    backgroundColor: [
                        '#FF6384',
                        '#36A2EB',
                        '#FFCE56',
                        '#4BC0C0'
                    ]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }
}

function initializeRealTimeUpdates() {
    // Update dashboard statistics every 30 seconds
    setInterval(updateDashboardStats, 30000);
}

function updateDashboardStats() {
    // This would normally fetch real data from the server
    console.log('Updating dashboard statistics...');
}

// Utility Functions
function showAlert(message, type = 'info') {
    const alertContainer = document.getElementById('alertContainer') || document.body;
    
    const alertHTML = `
        <div class="alert alert-${type} alert-dismissible fade show" role="alert">
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        </div>
    `;
    
    alertContainer.insertAdjacentHTML('afterbegin', alertHTML);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        const alert = alertContainer.querySelector('.alert');
        if (alert) {
            const bsAlert = new bootstrap.Alert(alert);
            bsAlert.close();
        }
    }, 5000);
}

function confirmAction(message, callback) {
    if (confirm(message)) {
        callback();
    }
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

function formatDateTime(dateString) {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// AJAX Helper Functions
function makeAjaxRequest(url, method = 'GET', data = null) {
    return fetch(url, {
        method: method,
        headers: {
            'Content-Type': 'application/json',
            'X-Requested-With': 'XMLHttpRequest'
        },
        body: data ? JSON.stringify(data) : null
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    })
    .catch(error => {
        console.error('AJAX request failed:', error);
        showAlert('An error occurred. Please try again.', 'danger');
        throw error;
    });
}

// File Upload Functions
function handleFileUpload(input, callback) {
    const file = input.files[0];
    if (!file) return;
    
    // Validate file size
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
        showAlert('File size exceeds 5MB limit.', 'danger');
        return;
    }
    
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
        showAlert('Invalid file type. Please upload JPEG, PNG, or PDF files.', 'danger');
        return;
    }
    
    const formData = new FormData();
    formData.append('file', file);
    
    fetch('upload.php', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            callback(data.file_path);
        } else {
            showAlert(data.message || 'Upload failed.', 'danger');
        }
    })
    .catch(error => {
        console.error('Upload error:', error);
        showAlert('Upload failed. Please try again.', 'danger');
    });
}

// Search Functions
function initializeSearch() {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        let searchTimeout;
        
        searchInput.addEventListener('input', function() {
            clearTimeout(searchTimeout);
            const query = this.value.trim();
            
            if (query.length >= 2) {
                searchTimeout = setTimeout(() => {
                    performSearch(query);
                }, 300);
            } else {
                clearSearchResults();
            }
        });
    }
}

function performSearch(query) {
    // This would normally make an AJAX request to search the database
    console.log('Searching for:', query);
}

function clearSearchResults() {
    const resultsContainer = document.getElementById('searchResults');
    if (resultsContainer) {
        resultsContainer.innerHTML = '';
    }
}

// Export functions for global access
window.MESMTF = {
    showAlert,
    confirmAction,
    formatDate,
    formatDateTime,
    makeAjaxRequest,
    handleFileUpload,
    performDiagnosis,
    displayDiagnosisResult
};