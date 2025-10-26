This Spring Boot application uses both MVC and REST controllers. Thymeleaf templates are used for the Admin and Doctor dashboards, while REST APIs serve all other modules. The application interacts with two databases—MySQL (for patient, doctor, appointment, and admin data) and MongoDB (for prescriptions). All controllers route requests through a common service layer, which in turn delegates to the appropriate repositories. MySQL uses JPA entities while MongoDB uses document models.

### App Flow:

1. User accesses AdminDashboard or Appointment pages.
2. The action is routed to the appropriate Thymeleaf or REST controller.
3. The controller handles validation and calls the service layer
4. The service layer handles business logic and calls the repository
5. The repository layer interacts with the databases using Spring Data JPA for mySQL and Spring Data Mongo for MongoDB
6. Model binding with @Entity for mySQL and @Document for MongoDB
7. Application models/data passed to Thymeleaf templates or serialized from dtos to JSON in the REST flows.

