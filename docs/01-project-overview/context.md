# PROGRAMMING COMPETITION 2025
## CASE STUDY PROJECT FOR TERTIARY INSTITUTIONS
**19 – 28 SEPT 2025**

---

# PROJECT TITLE: MEDICAL EXPERT SYSTEM FOR MALARIA AND TYPHOID FEVER (MESMTF)
## FOR MINISTRY OF HEALTH AND SOCIAL SERVICES

---

## 1. PROJECT OVERVIEW

### 1.1 Introduction
A Medical Expert System (ES) is a computer program that uses artificial intelligence to emulate human expertise, aiding in tasks like diagnosis, treatment planning, and patient care. By so doing, ES acts in all respects like a human expert, using human knowledge to solve problems that would require human intelligence.

When patients seek the help of medical experts, they do so for diagnosis and treatment of their various health problems. You are required to develop a fully-fledged web-based Medical Expert System for Malaria and Typhoid Fever (MESMTF). The system is expected to provide e-Health services for medical records, appointment, diagnosis, treatment, pharmacy, drug administration and reporting at the Ministry of Health and Social Services.

### 1.2 Project Scope
Teams are expected to go online or make more enquiries and establish additional requirements for MESMTF, where necessary. 

### 1.3 Core Modules
The following specifications/interfaces are assumed, but may be complemented by other requirements discovered by your team:
- Medical Records
- Appointment with the Doctor
- Diagnosis
- Treatment
- Pharmacy
- Drug Administration
- Reporting

You are to develop sets of production rules for Malaria and Typhoid fever, and use them for the diagnosis module.

---

## 2. MEDICAL SYMPTOMS AND DIAGNOSIS

### 2.1 Signs and Symptoms Classification

| Severity Level | Malaria Symptoms | Typhoid Symptoms |
|---|---|---|
| **Very Strong Signs (VSs)** | Abdominal pain, Vomiting, Sore throat | Abdominal pain, Stomach issues |
| **Strong Signs (Ss)** | Headache, Fatigue, Cough | Constipation, Headache, Persistent high fever |
| **Weak Signs (Ws)** | Chest pain, Back pain, Muscle Pain | Weakness, Tiredness |
| **Very Weak Signs (VWs)** | Diarrhea, Sweating, Rash | Loss of appetite, Rash, Loss of appetite |

### 2.2 Treatment Protocol
- **Very Strong Signs (VSs)** of Malaria and Typhoid will require chest X-ray, in addition to drug administration
- **Other signs** (Strong signs, Weak signs, and Very Weak Signs) will require drug administration only (no chest X-ray)

### 2.3 Drug Administration
It is the responsibility of teams to search for the name of drugs that can be used (administered) for the treatment of Malaria and/or Typhoid. Note that the drugs for the treatment of Malaria may be different from the treatment of Typhoid Fever.

Teams should verify/establish the symptoms and treatment drugs for:
- Malaria
- Typhoid Fever
- Malaria and Typhoid Fever combined

---

## 3. SYSTEM REQUIREMENTS

### 3.1 Core Functionality
- The Medical records module and Pharmacy module is an information system integrated into the MESMTF system
- There should be a screen to enter the different symptoms for Malaria and Typhoid
- The MESMTF system should be dynamic and allow for entering symptoms of other diseases such as:
  - Tuberculosis (TB)
  - HIV/AIDS
  - Mental Health
  - Diabetes
  - And others as demonstrated by teams

### 3.2 Accessibility Requirements
The MESMTF system should be able to handle:
- **Online access** (where there is internet connectivity)
- **Offline access** (where there is no internet connectivity)

### 3.3 Innovation Opportunities
Apart from the basic requirements described above, participants are encouraged to be as innovative as possible, for example:
- Adding a chatbot feature for the website
- Allowing users to blog and others to comment or like
- Other creative features

Such additions are not basic requirements, but may earn your team some additional points under creativity.

---

## 4. SYSTEM ARCHITECTURE

### 4.1 Organization Metadata
- **Name of Organisation:** Ministry of Health and Social Services

### 4.2 Current System (Manual)
The existing system is assumed to be manual and have the following medical services done conventionally:
- Medical Records
- Appointment with the Doctor
- Diagnosis
- Treatment
- Pharmacy
- Drug Administration
- Reporting

### 4.3 Proposed System (MESMTF)
In the new system, an MESMTF is proposed to handle:
- Medical Records
- Appointment with the Doctor
- Diagnosis
- Treatment
- Pharmacy
- Drug Administration
- Reporting

---

## 5. REQUIREMENT SPECIFICATIONS

### 5.1 Functional Requirements

Functional requirements are the list of services that the system should provide, how the system should behave in a given situation and how the system should react to specific inputs.

The functional requirements for the system include:
- User registration (users includes patient, doctor, nurse, pharmacist, admin, etc)
- Managing of users' accounts by the admin
- Registration of patients, storing their details into the system
- Booking appointments with doctors
- The software must have the facility to give a unique ID for every patient and stores the details of every patient and the staff automatically
- User can search availability of a doctor and the details of a patient using the ID
- The MESMTF can be entered using a username and password
- Part of the administrator's tasks includes managing doctors information and patient's information and checking appointments and prescription

#### Table 1: MESMTF Functional Requirements

| FR-ID | Functional Requirement |
|---|---|
| **FR-1** | User registers on the system (users includes medical receptionist, patient, doctor, nurse, pharmacist, admin, etc) |
| **FR-2** | User profile management - Each user can view and update their profile information |
| **FR-3** | The user is prompted to enter username and password for authentication after the sign in option is clicked |
| **FR-4** | A dashboard page is displayed to the user (patient, doctor, nurse, pharmacist) after validation, with the following options: Medical Records, Appointment Booking with the Doctor, Diagnosis, Treatment, Pharmacy, Drug Administration, Reporting, Search and Logout |
| **FR-5** | The system has the ability to search for doctors, drugs, patients, etc. |
| **FR-6** | The user can log out of the system anytime using the logout option |
| **FR-7** | A dashboard page is displayed to the user (administrator) after validation with the following options: Medical Records, Appointment Booking with the Doctor, Diagnosis, Treatment, Pharmacy, Drug Administration, Reporting, Search and Logout |
| **FR-8** | Patient registration and management - Add, edit, delete, and view patient records |
| **FR-9** | Appointment scheduling - Book, modify, and cancel appointments |
| **FR-10** | Medical diagnosis using expert system rules for Malaria and Typhoid |
| **FR-11** | Treatment plan generation based on diagnosis results |
| **FR-12** | Pharmacy management - Drug inventory, prescription management |
| **FR-13** | Drug administration tracking and management |
| **FR-14** | Report generation - Medical reports, prescription reports, statistical reports |
| **FR-15** | Expert system rule management for different diseases |
| **FR-16** | User role-based access control and permissions |

### 5.2 Non-Functional Requirements

Non-functional requirements are constraints on the services or functions offered by the system such as timing constraints, constraints on the development process, standards, etc.

#### Table 2: MESMTF Non-Functional Requirements

| NFR-ID | Non-Functional Requirement |
|---|---|
| **NFR-1** | **Availability/Accessibility** - The system should be available on a web, or web with mobile. The system should be accessed using a desktop computer or laptop or mobile devices |
| **NFR-2** | **Security** - The system should be able to authenticate users by requesting for their username and password before granting them access to the services |
| **NFR-3** | **Capacity and Scalability** - The system should be able to accommodate a large number of patients at the same time |
| **NFR-4** | **Performance** - System response time should be less than 3 seconds for most operations |
| **NFR-5** | **Reliability** - System should have 99.5% uptime availability |
| **NFR-6** | **Usability** - Interface should be intuitive and user-friendly for all user types |
| **NFR-7** | **Compatibility** - System should work across different browsers and devices |
| **NFR-8** | **Data Integrity** - All medical data should be accurate and consistent |
| **NFR-9** | **Backup and Recovery** - System should have automated backup and recovery mechanisms |
| **NFR-10** | **Compliance** - System should comply with medical data protection regulations |

---

## 6. SYSTEM MODULES

### 6.1 Module Specifications

#### Table 3: Module and Requirements Supported by MESMTF

| Module ID | Module Name | Requirements Supported |
|---|---|---|
| **M-ID1** | Registration/Sign up | Register/Sign up users (users includes medical receptionist, patient, doctor, nurse, pharmacist, admin, etc). Each user will enter his/her profile/details during Registration/Sign up. Each user shall have a module with different access permission. |
| **M-ID2** | Login | Registered users only (users includes medical receptionist, patient, doctor, nurse, pharmacist, admin, etc). Each login screen should show different menu items based on access permissions. For instance, the login screen for medical receptionist should show different menu items. Same for patient, doctor, nurse, pharmacist, admin, etc. |
| **M-ID3** | Medical Records | View patients. Authorized users should be able to Upload/Edit/Delete/View/Search for patients. |
| **M-ID4** | Appointment booking with the Doctor | Patients can search for doctors and book appointment, or modify appointment or cancel appointment |
| **M-ID5** | Diagnosis | Doctors can use the system for medical diagnosis using expert system rules |
| **M-ID6** | Treatment | The system should provide the treatment services and treatment plan generation |
| **M-ID7** | Pharmacy | The system should provide pharmaceutical services and drug inventory management |
| **M-ID8** | Drug Administration | The system should provide drug administration services and tracking |
| **M-ID9** | Reporting | The system should provide reporting services, such as, printing of prescriptions, medical reports, statistical reports, etc. |
| **M-ID10** | Database | Backend database should be provided with proper data modeling and relationships |

---

## 7. EXPERT SYSTEM DIAGNOSIS MODULE

### 7.1 AI-Doctor Functionality
The Diagnosis module (AI-Doctor) should use a rule-based Expert System that allows individual/anyone at any time, any place (home, school, office, on the move, etc), to carry out personal diagnosis of Malaria and Typhoid Fever by entering any/some symptoms in Table 1 above, and thereafter establish if he/she is having Malaria or Typhoid Fever.

### 7.2 Diagnosis Workflow
1. User enters symptoms through the system interface
2. Expert system processes symptoms using production rules
3. System provides preliminary diagnosis
4. If system indicates Malaria or Typhoid Fever, user must book appointment with a doctor
5. During appointment booking, available expert medical doctor in the field of Malaria and Typhoid fever is recommended to the patient
6. Patient physically visits the medical centre on the appointment date to see the doctor for confirmation of the diagnosis, proper treatment and drug administration

---

## 8. TECHNICAL SPECIFICATIONS

### 8.1 System Architecture
- **Frontend:** Web-based user interface (WUI) compatible with PCs, laptops, and smart devices
- **Backend:** Database system with proper data modeling
- **Expert System:** Rule-based inference engine for diagnosis
- **Accessibility:** Both online and offline capabilities

### 8.2 User Interface Requirements
- Every user will have to register on the system through the web user interface (WUI) so that a user's profile will be created
- Once a user's login details have been validated at the point of access, the user will then gain access to the services of the MESMTF system
- The system is a web-based system or a hybrid of web-based and mobile-based

### 8.3 Database Requirements
- Backend database should be provided
- Proper data modeling for all entities (users, patients, appointments, diagnoses, treatments, etc.)
- Data integrity and security measures
- Backup and recovery mechanisms

---

## 9. COMPETITION RULES AND NOTES

### 9.1 Rules for Participants
The above are sample content that should be included on the website. However, other innovative concepts on the website are welcomed. The website must be dynamic and allows administrative access by a medical staff. It must have a backend database.

### 9.2 Assessment Criteria
- **Functionality:** All core modules must be implemented and working
- **User Experience:** Intuitive and user-friendly interface
- **Expert System:** Proper implementation of rule-based diagnosis
- **Database Design:** Well-structured and normalized database
- **Security:** Proper authentication and authorization
- **Innovation:** Additional creative features beyond basic requirements
- **Documentation:** Comprehensive documentation of the system

### 9.3 Additional Considerations
- System should demonstrate scalability for multiple concurrent users
- Proper error handling and validation
- Responsive design for different screen sizes
- Accessibility features for users with disabilities
- Integration capabilities for future enhancements

---

## 10. CONCLUSION

This document outlines the comprehensive requirements for developing a Medical Expert System for Malaria and Typhoid Fever (MESMTF) for the Ministry of Health and Social Services. The system should provide a complete e-Health solution covering all aspects of medical care from patient registration to treatment and reporting.

Teams are encouraged to go beyond the basic requirements and demonstrate innovation in their implementation while ensuring all core functionality is properly implemented and tested.

---

*Document Version: 2.0*  
*Last Updated: [Current Date]*  
*Prepared for: Programming Competition 2025*
 