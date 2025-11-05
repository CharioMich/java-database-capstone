package com.project.back_end.controllers;

import com.project.back_end.DTO.Login;
import com.project.back_end.models.Doctor;
import com.project.back_end.services.DoctorService;
import com.project.back_end.services.Service;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("${api.path}" + "doctor")
public class DoctorController {

// 1. Set Up the Controller Class:
//    - Annotate the class with `@RestController` to define it as a REST controller that serves JSON responses.
//    - Use `@RequestMapping("${api.path}doctor")` to prefix all endpoints with a configurable API path followed by "doctor".
//    - This class manages doctor-related functionalities such as registration, login, updates, and availability.


// 2. Autowire Dependencies:
//    - Inject `DoctorService` for handling the core logic related to doctors (e.g., CRUD operations, authentication).
//    - Inject the shared `Service` class for general-purpose features like token validation and filtering.
    private final DoctorService doctorService;
    private final Service service;

    public DoctorController(DoctorService doctorService, Service service) {
        this.doctorService = doctorService;
        this.service = service;
    }

// 3. Define the `getDoctorAvailability` Method:
//    - Handles HTTP GET requests to check a specific doctor’s availability on a given date.
//    - Requires `user` type, `doctorId`, `date`, and `token` as path variables.
//    - First validates the token against the user type.
//    - If the token is invalid, returns an error response; otherwise, returns the availability status for the doctor.
    @GetMapping("/availability/{user}/{doctorId}/{date}/{token}")
    public ResponseEntity<Map<String, Object>> getDoctorAvailability(
            @PathVariable String user,
            @PathVariable Long doctorId,
            @PathVariable LocalDate date,
            @PathVariable String token
            ) {
        ResponseEntity<Map<String, String>> validationResult = service.validateToken(token, user);
        Map<String, Object> response = new HashMap<>();

        if (!validationResult.getStatusCode().is2xxSuccessful()) {
            response.put("error", "Invalid or expired token");
            return new ResponseEntity<>(response, HttpStatus.UNAUTHORIZED);
        }
        List<String> availability = doctorService.getDoctorAvailability(doctorId, date);
        response.put("status", "success");
        response.put("availability", availability);
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

// 4. Define the `getDoctor` Method:
//    - Handles HTTP GET requests to retrieve a list of all doctors.
//    - Returns the list within a response map under the key `"doctors"` with HTTP 200 OK status.
    @GetMapping
    public ResponseEntity<Map<String, Object>> getDoctors() {
        List<Doctor> doctors = doctorService.getDoctors();
        Map<String, Object> response = new HashMap<>();
        response.put("status", "success");
        response.put("doctors", doctors);
        return new ResponseEntity<>(response, HttpStatus.OK);
    }


// 5. Define the `saveDoctor` Method:
//    - Handles HTTP POST requests to register a new doctor.
//    - Accepts a validated `Doctor` object in the request body and a token for authorization.
//    - Validates the token for the `"admin"` role before proceeding.
//    - If the doctor already exists, returns a conflict response; otherwise, adds the doctor and returns a success message.
    @PostMapping("/{token}")
    public ResponseEntity<Map<String, String>> saveDoctor(
            @RequestBody Doctor doctor,
            @PathVariable String token
    ) {
        ResponseEntity<Map<String, String>> validationResult = service.validateToken(token, "admin");
        Map<String, String> response = new HashMap<>();
        HttpStatus status = HttpStatus.INTERNAL_SERVER_ERROR;

        if (!validationResult.getStatusCode().is2xxSuccessful()) {
            response.put("error", "Invalid or expired token");
            return new ResponseEntity<>(response, HttpStatus.UNAUTHORIZED);
        }
        int result = doctorService.saveDoctor(doctor);
        switch (result) {
            case 1 -> {
                response.put("status", "success");
                response.put("message", "Doctor added to db");
                status = HttpStatus.CREATED;
            }
            case -1 -> {
                response.put("status", "conflict");
                response.put("error", "Doctor already exists");
                status = HttpStatus.CONFLICT;
            }
            case 0 -> {
                response.put("status", "internal error");
                response.put("error", "Internal server error");
            }
        }
        return new ResponseEntity<>(response, status);
    }

// 6. Define the `doctorLogin` Method:
//    - Handles HTTP POST requests for doctor login.
//    - Accepts a validated `Login` DTO containing credentials.
//    - Delegates authentication to the `DoctorService` and returns login status and token information.
    @PostMapping("/login")
    public ResponseEntity<Map<String, String>> doctorLogin(@RequestBody @Valid Login login) {
        return doctorService.validateDoctor(login);
    }

// 7. Define the `updateDoctor` Method:
//    - Handles HTTP PUT requests to update an existing doctor's information.
//    - Accepts a validated `Doctor` object and a token for authorization.
//    - Token must belong to an `"admin"`.
//    - If the doctor exists, updates the record and returns success; otherwise, returns not found or error messages.
    @PutMapping("/{token}")
    public ResponseEntity<Map<String, String>> updateDoctor(@RequestBody @Valid Doctor doctor, @PathVariable String token) {
        ResponseEntity<Map<String, String>> validationResult = service.validateToken(token, "admin");
        Map<String, String> response = new HashMap<>();
        HttpStatus status = HttpStatus.INTERNAL_SERVER_ERROR;

        if (!validationResult.getStatusCode().is2xxSuccessful()) {
            response.put("error", "Invalid or expired token");
            return new ResponseEntity<>(response, HttpStatus.UNAUTHORIZED);
        }

        int result = doctorService.updateDoctor(doctor);
        switch (result) {
            case 1 -> {
                response.put("status", "success");
                response.put("message", "Doctor updated");
                status = HttpStatus.OK;
            }
            case -1 -> {
                response.put("status", "not found");
                response.put("error", "Doctor not found");
                status = HttpStatus.NOT_FOUND;
            }
            case 0 -> {
                response.put("status", "internal error");
                response.put("error", "Internal server error");
            }
        }
        return new ResponseEntity<>(response, status);
    }

// 8. Define the `deleteDoctor` Method:
//    - Handles HTTP DELETE requests to remove a doctor by ID.
//    - Requires both doctor ID and an admin token as path variables.
//    - If the doctor exists, deletes the record and returns a success message; otherwise, responds with a not found or error message.
    @DeleteMapping("/{id}/{token}")
    public ResponseEntity<Map<String, String>> deleteDoctor(@PathVariable Long id, @PathVariable String token) {
        ResponseEntity<Map<String, String>> validationResult = service.validateToken(token, "admin");
        Map<String, String> response = new HashMap<>();
        HttpStatus status = HttpStatus.INTERNAL_SERVER_ERROR;

        if (!validationResult.getStatusCode().is2xxSuccessful()) {
            response.put("error", "Invalid or expired token");
            return new ResponseEntity<>(response, HttpStatus.UNAUTHORIZED);
        }

        int result = doctorService.deleteDoctor(id);
        switch (result) {
            case 1 -> {
                response.put("status", "success");
                response.put("message", "Doctor deleted successfully");
                status = HttpStatus.OK;
            }
            case -1 -> {
                response.put("status", "not found");
                response.put("error", "Doctor not found");
                status = HttpStatus.NOT_FOUND;
            }
            case 0 -> {
                response.put("status", "internal error");
                response.put("error", "Internal server error");
            }
        }
        return new ResponseEntity<>(response, status);
    }

// 9. Define the `filter` Method:
//    - Handles HTTP GET requests to filter doctors based on name, time, and specialty.
//    - Accepts `name`, `time`, and `speciality` as path variables.
//    - Calls the shared `Service` to perform filtering logic and returns matching doctors in the response.
    @GetMapping("/filter/{name}/{time}/{speciality}")
    public ResponseEntity<Map<String, Object>> filterDoctors(
            @PathVariable String name,
            @PathVariable String time,
            @PathVariable String speciality
            ) {
        Map<String, Object> response = doctorService.filterDoctorsByNameSpecialityAndTime(name, time, speciality);
        return new ResponseEntity<>(response, HttpStatus.OK); // Incomplete Http status logic
    }

}
