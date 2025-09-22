# MESMTF Mock Data Analysis & Replacement Plan

## 📋 **Overview**

This document identifies all mock data currently used in the MESMTF system and provides a detailed plan for replacing it with real database operations.

## 🔍 **Mock Data Inventory**

### **1. Patient Management Mock Data**

#### **Location**: `components/medical-records/medical-records-view.tsx`
```typescript
// Mock patient data (Lines 57-126)
const [patients] = useState<any[]>([
  {
    id: "1",
    patientId: "P-2025-001",
    firstName: "John",
    lastName: "Doe",
    dateOfBirth: "1985-03-15",
    gender: "Male",
    phone: "+264 81 234 5678",
    email: "john.doe@email.com",
    address: "123 Main Street, Windhoek, Namibia",
    emergencyContact: "Jane Doe - +264 81 234 5679",
    bloodType: "O+",
    allergies: ["Penicillin", "Shellfish"],
    chronicConditions: ["Hypertension"],
    lastVisit: "2025-09-20",
    status: "Active",
  },
  // ... 3 more mock patients
])
```

#### **Replacement Required**:
- **API Endpoint**: `GET /api/patients`
- **Database Table**: `patients`
- **Operations**: CRUD operations for patient management
- **Search/Filter**: Patient search and filtering functionality

---

### **2. Appointment Management Mock Data**

#### **Location**: `components/appointments/appointment-view.tsx`
```typescript
// Mock appointment data (Lines 40-116)
const [appointments] = useState<Appointment[]>([
  {
    id: "1",
    patientName: "John Doe",
    patientId: "P-2025-001",
    doctorName: "Dr. Sarah Johnson",
    doctorSpecialty: "General Medicine",
    date: "2025-09-25",
    time: "09:00",
    duration: 30,
    type: "Consultation",
    status: "Scheduled",
    reason: "Fever and headache symptoms",
    room: "Room 101",
    phone: "+264 81 234 5678",
  },
  // ... 4 more mock appointments
])
```

#### **Replacement Required**:
- **API Endpoint**: `GET /api/appointments`
- **Database Table**: `appointments`
- **Operations**: CRUD operations for appointment management
- **Status Management**: Appointment status updates
- **Calendar Integration**: Calendar view functionality

---

### **3. Drug Inventory Mock Data**

#### **Location**: `components/pharmacy/drug-inventory.tsx`
```typescript
// Mock drug data (Lines 23-72)
const SAMPLE_DRUGS: Drug[] = [
  {
    id: "1",
    name: "Artemether-Lumefantrine",
    category: "Antimalarial",
    stock: 150,
    minStock: 50,
    expiryDate: "2025-12-31",
    batchNumber: "AL2024001",
    supplier: "PharmaCorp Ltd",
    price: 25.5,
    indication: ["Malaria", "P. falciparum"],
  },
  // ... 3 more mock drugs
]
```

#### **Replacement Required**:
- **API Endpoint**: `GET /api/drugs`
- **Database Table**: `drugs`
- **Operations**: CRUD operations for drug management
- **Inventory Tracking**: Stock level monitoring
- **Expiry Alerts**: Drug expiry notifications

---

### **4. Diagnosis History Mock Data**

#### **Location**: `components/diagnosis/diagnosis-history.tsx`
```typescript
// Mock diagnosis history data (Lines 20-69)
const diagnosisHistory = [
  {
    id: "1",
    patientName: user.role === "patient" ? user.username : "John Doe",
    patientId: "P-2025-001",
    date: "2025-09-20",
    time: "14:30",
    diagnosis: "Malaria (P. falciparum)",
    confidence: 92,
    symptoms: ["High fever", "Chills", "Headache", "Nausea"],
    status: "Confirmed",
    treatedBy: "Dr. Sarah Johnson",
  },
  // ... 3 more mock diagnoses
]
```

#### **Replacement Required**:
- **API Endpoint**: `GET /api/diagnoses`
- **Database Table**: `diagnoses`
- **Operations**: CRUD operations for diagnosis management
- **AI Integration**: Store AI diagnosis results
- **History Tracking**: Patient diagnosis history

---

### **5. Doctor Information Mock Data**

#### **Location**: `components/appointments/book-appointment-dialog.tsx`
```typescript
// Mock doctor data (Lines 49-86)
const doctors: Doctor[] = [
  {
    id: "1",
    name: "Dr. Sarah Johnson",
    specialty: "General Medicine",
    experience: "8 years",
    rating: 4.8,
    availableSlots: ["09:00", "10:30", "14:00", "15:30"],
    nextAvailable: "2025-09-25",
  },
  // ... 3 more mock doctors
]
```

#### **Replacement Required**:
- **API Endpoint**: `GET /api/doctors`
- **Database Table**: `doctors`
- **Operations**: CRUD operations for doctor management
- **Availability Tracking**: Doctor schedule management
- **Specialization Filtering**: Filter doctors by specialty

---

### **6. Dashboard Statistics Mock Data**

#### **Location**: Multiple dashboard components
```typescript
// Mock statistics in various dashboard components
const stats = {
  totalPatients: 150,
  activeAppointments: 8,
  pendingDiagnoses: 3,
  criticalCases: 2,
  // ... more mock statistics
}
```

#### **Replacement Required**:
- **API Endpoint**: `GET /api/analytics/dashboard`
- **Database Queries**: Aggregate queries for statistics
- **Real-time Updates**: Live statistics updates
- **Role-based Stats**: Different stats for different roles

---

## 🔄 **Replacement Implementation Plan**

### **Phase 1: Core Data Replacement (Week 1-2)**

#### **1.1 Patient Management**
```typescript
// Replace mock data with real API calls
const fetchPatients = async () => {
  const { data, error } = await supabase
    .from('patients')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data;
};

// Replace in component
const [patients, setPatients] = useState<Patient[]>([]);
const [loading, setLoading] = useState(true);

useEffect(() => {
  fetchPatients()
    .then(setPatients)
    .catch(console.error)
    .finally(() => setLoading(false));
}, []);
```

#### **1.2 Appointment Management**
```typescript
// Replace mock data with real API calls
const fetchAppointments = async (filters?: AppointmentFilters) => {
  let query = supabase
    .from('appointments')
    .select(`
      *,
      patients:patient_id(first_name, last_name, patient_id, phone),
      doctors:doctor_id(name, specialty)
    `);
  
  if (filters?.status) {
    query = query.eq('status', filters.status);
  }
  
  if (filters?.date) {
    query = query.gte('appointment_date', filters.date);
  }
  
  const { data, error } = await query.order('appointment_date', { ascending: true });
  
  if (error) throw error;
  return data;
};
```

### **Phase 2: Medical Features (Week 3-4)**

#### **2.1 Diagnosis Storage**
```typescript
// Store AI diagnosis results in database
const saveDiagnosis = async (diagnosisData: DiagnosisData) => {
  const { data, error } = await supabase
    .from('diagnoses')
    .insert({
      patient_id: diagnosisData.patientId,
      doctor_id: diagnosisData.doctorId,
      symptoms: diagnosisData.symptoms,
      diagnosis: diagnosisData.diagnosis,
      confidence_level: diagnosisData.confidence,
      expert_system_result: diagnosisData.expertSystemResult,
      requires_xray: diagnosisData.requiresXray,
      doctor_notes: diagnosisData.doctorNotes
    })
    .select()
    .single();
  
  if (error) throw error;
  return data;
};
```

#### **2.2 Drug Inventory Management**
```typescript
// Replace mock drug data with real inventory
const fetchDrugs = async (filters?: DrugFilters) => {
  let query = supabase
    .from('drugs')
    .select('*');
  
  if (filters?.category) {
    query = query.eq('category', filters.category);
  }
  
  if (filters?.lowStock) {
    query = query.lt('stock', supabase.raw('min_stock'));
  }
  
  const { data, error } = await query.order('name');
  
  if (error) throw error;
  return data;
};
```

### **Phase 3: Advanced Features (Week 5-6)**

#### **3.1 Real-time Statistics**
```typescript
// Replace mock statistics with real-time data
const fetchDashboardStats = async (userRole: string) => {
  const stats = await Promise.all([
    supabase.from('patients').select('id', { count: 'exact' }),
    supabase.from('appointments').select('id', { count: 'exact' }).eq('status', 'scheduled'),
    supabase.from('diagnoses').select('id', { count: 'exact' }).eq('status', 'pending'),
    supabase.from('patients').select('id', { count: 'exact' }).eq('status', 'critical')
  ]);
  
  return {
    totalPatients: stats[0].count || 0,
    activeAppointments: stats[1].count || 0,
    pendingDiagnoses: stats[2].count || 0,
    criticalCases: stats[3].count || 0
  };
};
```

#### **3.2 File Upload Integration**
```typescript
// Replace mock file handling with real upload
const uploadMedicalDocument = async (file: File, patientId: string) => {
  const fileExt = file.name.split('.').pop();
  const fileName = `${patientId}_${Date.now()}.${fileExt}`;
  
  const { data, error } = await supabase.storage
    .from('medical-documents')
    .upload(fileName, file);
  
  if (error) throw error;
  
  // Store file reference in database
  const { data: record, error: dbError } = await supabase
    .from('medical_records')
    .insert({
      patient_id: patientId,
      file_path: data.path,
      file_name: file.name,
      file_size: file.size,
      file_type: file.type
    })
    .select()
    .single();
  
  if (dbError) throw dbError;
  return record;
};
```

---

## 🗂️ **File-by-File Replacement Guide**

### **High Priority Files (Replace First)**

1. **`components/medical-records/medical-records-view.tsx`**
   - Replace mock patient data
   - Implement real CRUD operations
   - Add search and filtering

2. **`components/appointments/appointment-view.tsx`**
   - Replace mock appointment data
   - Implement appointment management
   - Add calendar integration

3. **`components/diagnosis/symptom-checker.tsx`**
   - Add diagnosis storage functionality
   - Implement AI result persistence
   - Add diagnosis history

4. **`components/pharmacy/drug-inventory.tsx`**
   - Replace mock drug data
   - Implement inventory management
   - Add stock monitoring

### **Medium Priority Files (Replace Second)**

5. **`components/dashboard/*-dashboard.tsx`**
   - Replace mock statistics
   - Implement real-time data
   - Add role-based statistics

6. **`components/appointments/book-appointment-dialog.tsx`**
   - Replace mock doctor data
   - Implement real doctor selection
   - Add availability checking

7. **`components/diagnosis/diagnosis-history.tsx`**
   - Replace mock diagnosis history
   - Implement real history queries
   - Add filtering and search

### **Low Priority Files (Replace Last)**

8. **`components/pharmacy/prescription-management.tsx`**
   - Implement prescription CRUD
   - Add prescription tracking
   - Implement fulfillment workflow

9. **`components/reports/*-reports.tsx`**
   - Implement report generation
   - Add PDF export functionality
   - Implement analytics queries

---

## 🔧 **Implementation Utilities**

### **1. Data Fetching Hook**
```typescript
// hooks/use-api.ts
export function useApi<T>(endpoint: string, options?: RequestOptions) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/${endpoint}`, options);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [endpoint, options]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}
```

### **2. CRUD Operations Hook**
```typescript
// hooks/use-crud.ts
export function useCrud<T>(endpoint: string) {
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const create = async (data: Partial<T>) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      
      if (!response.ok) throw new Error('Create failed');
      
      const newItem = await response.json();
      setItems(prev => [...prev, newItem]);
      return newItem;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const update = async (id: string, data: Partial<T>) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/${endpoint}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      
      if (!response.ok) throw new Error('Update failed');
      
      const updatedItem = await response.json();
      setItems(prev => prev.map(item => 
        (item as any).id === id ? updatedItem : item
      ));
      return updatedItem;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const remove = async (id: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/${endpoint}/${id}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) throw new Error('Delete failed');
      
      setItems(prev => prev.filter(item => (item as any).id !== id));
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { items, loading, error, create, update, remove };
}
```

---

## 📊 **Migration Checklist**

### **Phase 1: Core Data (Week 1-2)**
- [ ] Replace patient mock data with real API calls
- [ ] Replace appointment mock data with real API calls
- [ ] Implement patient CRUD operations
- [ ] Implement appointment CRUD operations
- [ ] Add search and filtering functionality
- [ ] Test all CRUD operations

### **Phase 2: Medical Features (Week 3-4)**
- [ ] Replace diagnosis mock data with real storage
- [ ] Replace drug inventory mock data with real data
- [ ] Implement diagnosis storage and retrieval
- [ ] Implement drug inventory management
- [ ] Add prescription management
- [ ] Test medical workflows

### **Phase 3: Advanced Features (Week 5-6)**
- [ ] Replace dashboard statistics with real data
- [ ] Implement file upload functionality
- [ ] Add real-time updates
- [ ] Implement reporting system
- [ ] Add notification system
- [ ] Test complete workflows

### **Phase 4: Optimization (Week 7-8)**
- [ ] Optimize database queries
- [ ] Implement caching
- [ ] Add error handling
- [ ] Performance testing
- [ ] Security testing
- [ ] Documentation updates

---

## 🚨 **Critical Considerations**

### **1. Data Consistency**
- Ensure all mock data is properly migrated
- Maintain data relationships
- Handle data validation
- Implement proper error handling

### **2. User Experience**
- Maintain loading states during transition
- Implement proper error messages
- Ensure responsive design
- Test all user workflows

### **3. Performance**
- Optimize database queries
- Implement pagination
- Add caching where appropriate
- Monitor performance metrics

### **4. Security**
- Implement proper authentication
- Add authorization checks
- Validate all inputs
- Audit data access

---

This comprehensive mock data analysis provides a detailed roadmap for replacing all mock data with real database operations, ensuring a smooth transition from a prototype to a production-ready medical management system.
