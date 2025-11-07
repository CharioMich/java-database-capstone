# Smart Clinic Management System Full-Stack App

This is the main project from [Java Development Capstone Project](https://www.coursera.org/learn/java-development-capstone-project) course
and was created using [okssu-java-database-capstone-template](https://github.com/ibm-developer-skills-network/okssu-java-database-capstone-template) template.



This is a Spring Boot full-stack application following the MVC (Model–View–Controller) architectural pattern.  
It represents a Clinic Management System (CMS) providing both Thymeleaf templates and REST APIs.
The application interacts with two databases—MySQL (for patient, doctor, appointment, and admin data) and MongoDB (for prescriptions).

Since Spring MVC is used for this project, code is organized into three layers:

- Model: Data and business logic  
- View: UI or presentation layer  
- Controller: Handles input and orchestrates between Model and View

## Info: 
- Big enumerated comment blocks in some project files are the initial code development instructions provided by the course.
- There is a central Service class that provides multiple functionalities: authentication, validation, and coordination across entities.  

## Improvements 
The project is developed under the course instructions, so any personal opinions regarding structure, logic or design are limited.
Below I am stating some things I would personally implement differently:
- Common responses among methods. Some return zeros and ones while others true or false
- Implementation of Mapper class to map entities to DTOs and vice versa
- More robust role checking. Current one is fragile and introduces potential security issues
- Spring security implementation & Password encoding
- Access Token to be transferred via the headers and not in the url.
- Use of Lombok annotations for reducing boilerplate code
- Separation of validation logic into a validator class
- Global error handling
- Records as DTOs

## Resources / Front-End Project Structure

```declarative
app/src/main/resources
├── application.properties
├── static
│   ├── index.html
│   ├── assets
│   │   ├── css
│   │   │   ├── addPrescription.css
│   │   │   ├── adminDashboard.css
│   │   │   ├── doctorDashboard.css
│   │   │   ├── index.css
│   │   │   ├── patientDashboard.css
│   │   │   ├── style.css
│   │   │   └── updateAppointment.css
│   │   └── images
│   │       ├── addPrescriptionIcon
│   │       │   └── addPrescription.png
│   │       ├── edit
│   │       │   └── edit.png
│   │       ├── defineRole
│   │       │   └── index.png
│   │       └── logo
│   │           └── logo.png
│   ├── js
│   │   ├── components
│   │   │   ├── appointmentRow.js
│   │   │   ├── doctorCard.js
│   │   │   ├── footer.js
│   │   │   ├── header.js
│   │   │   ├── modals.js
│   │   │   ├── patientRecordRow.js
│   │   │   └── patientRows.js
│   │   ├── config
│   │   │   ├── config.js
│   │   ├── services
│   │   │   ├── appointmentRecordService.js
│   │   │   ├── doctorServices.js
│   │   │   ├── index.js
│   │   │   ├── patientServices.js
│   │   │   └── prescriptionServices.js
│   │   ├── addPrescription.js
│   │   ├── adminDashboard.js
│   │   ├── appointmentRecord.js
│   │   ├── doctorDashboard.js
│   │   ├── loggedPatient.js
│   │   ├── patientAppointment.js
│   │   ├── patientDashboard.js
│   │   ├── patientRecordServices.js
│   │   ├── render.js
│   │   ├── updateAppointment.js
│   │   └── util.js
│   └── pages
│       ├── addPrescription.html
│       ├── loggedPatientDashboard.html
│       ├── patientAppointments.html
│       ├── patientDashboard.html
│       ├── patientRecord.html
│       └── updateAppointment.html
└── templates
    ├── admin
    │   └── adminDashboard.html
    └── doctor
        └── doctorDashboard.html

```

## 🚧 Frontend Still Under Development...

