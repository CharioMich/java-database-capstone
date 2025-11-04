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
Below I am stating some things I would personally implement differently.
- Common responses among methods. Some return zeros and ones while others true or false
- Password encoding
- More robust role checking. Current one is fragile and introduces potential security issues
- Spring security implementation
- Common API response structure
- Global error handling
- Separation of validation logic into a validator class
- Implementation of Mapper class to map entities to DTOs and vice versa
- Records as DTOs
- Use of Lombok annotations for reducing boilerplate code


🚧 Project Under Construction...

