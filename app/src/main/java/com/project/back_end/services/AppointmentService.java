package com.project.back_end.services;

import com.project.back_end.models.Appointment;
import com.project.back_end.models.Doctor;
import com.project.back_end.models.Patient;
import com.project.back_end.repo.AppointmentRepository;
import com.project.back_end.repo.DoctorRepository;
import com.project.back_end.repo.PatientRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class AppointmentService {

    // 1. **Add @Service Annotation**:
    //    - To indicate that this class is a service layer class for handling business logic.
    //    - The `@Service` annotation should be added before the class declaration to mark it as a Spring service component.
    //    - Instruction: Add `@Service` above the class definition.

    // 2. **Constructor Injection for Dependencies**:
    //    - The `AppointmentService` class requires several dependencies like `AppointmentRepository`, `Service`, `TokenService`, `PatientRepository`, and `DoctorRepository`.
    //    - These dependencies should be injected through the constructor.
    //    - Instruction: Ensure constructor injection is used for proper dependency management in Spring.

    private final AppointmentRepository appointmentRepository;
    private final com.project.back_end.services.Service service;
    private final TokenService tokenService;
    private final PatientRepository patientRepository;
    private final DoctorRepository doctorRepository;

    public AppointmentService(
            AppointmentRepository appointmentRepository,
            com.project.back_end.services.Service service,
            TokenService tokenService,
            PatientRepository patientRepository,
            DoctorRepository doctorRepository
    ) {
        this.appointmentRepository = appointmentRepository;
        this.service = service;
        this.tokenService = tokenService;
        this.patientRepository = patientRepository;
        this.doctorRepository = doctorRepository;
    }

    // 3. **Add @Transactional Annotation for Methods that Modify Database**:
    //    - The methods that modify or update the database should be annotated with `@Transactional` to ensure atomicity and consistency of the operations.
    //    - Instruction: Add the `@Transactional` annotation above methods that interact with the database, especially those modifying data.

    // 4. **Book Appointment Method**:
    //    - Responsible for saving the new appointment to the database.
    //    - If the save operation fails, it returns `0`; otherwise, it returns `1`.
    //    - Instruction: Ensure that the method handles any exceptions and returns an appropriate result code.

    @Transactional
    public int bookAppointment(Appointment appointment) {
        try {
            appointmentRepository.save(appointment);
            return 1;
        } catch(Exception e) {
            System.out.println("Error in bookAppointment: " + e.getMessage());
            return 0;
        }
    }

    // 5. **Update Appointment Method**:
    //    - This method is used to update an existing appointment based on its ID.
    //    - It validates whether the patient ID matches, checks if the appointment is available for updating, and ensures that the doctor is available at the specified time.
    //    - If the update is successful, it saves the appointment; otherwise, it returns an appropriate error message.
    //    - Instruction: Ensure proper validation and error handling is included for appointment updates.

    @Transactional
    public ResponseEntity<Map<String, String>> updateAppointment(Appointment appointment) {
        Map<String, String> response = new HashMap<>();

        try {
            Appointment existingAppointment = appointmentRepository.findById(appointment.getId())
                    .orElseThrow(EntityNotFoundException::new);

            if (!appointment.getPatient().getId().equals(existingAppointment.getPatient().getId())) {
                response.put("error", "Patient ID mismatch.");
                return new ResponseEntity<>(response, HttpStatus.CONFLICT);
            }

            String timeSlot = appointment.getAppointmentTime().toString().concat("-").concat(appointment.getEndTime().toString());
            Doctor doctor = appointment.getDoctor();
            if (!doctor.getAvailableTimes().contains(timeSlot)) {
                response.put("error", "Doctor is not available at the selected time.");
                return new ResponseEntity<>(response, HttpStatus.CONFLICT);
            }

            // Update appointment. (Only time is logic to be updated)
            existingAppointment.setAppointmentTime(appointment.getAppointmentTime());
            appointmentRepository.save(existingAppointment);
            // Successful response
            response.put("message", "Appointment updated successfully.");
            return new ResponseEntity<>(response, HttpStatus.OK);

        } catch(EntityNotFoundException e) {
            System.out.println("Appointment to update not found.");
            response.put("error", "Appointment to update not found");
            return new ResponseEntity<>(response, HttpStatus.NOT_FOUND);
        } catch (Exception e) {
            response.put("error", "An unexpected error occurred: " + e.getMessage());
            return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // 6. **Cancel Appointment Method**:
    //    - This method cancels an appointment by deleting it from the database.
    //    - It ensures the patient who owns the appointment is trying to cancel it and handles possible errors.
    //    - Instruction: Make sure that the method checks for the patient ID match before deleting the appointment.
    @Transactional
    public ResponseEntity<Map<String, String>> cancelAppointment(Long id, String token) {
        Map<String, String> response = new HashMap<>();

        try {
            String patientEmail = tokenService.extractEmail(token);

            Patient patient = patientRepository.findByEmail(patientEmail)
                    .orElseThrow(() -> new EntityNotFoundException("Invalid token."));

            Appointment appointment = appointmentRepository.findById(id)
                    .orElseThrow(() -> new EntityNotFoundException("Appointment with id " + id + " not found."));

            if (!patient.getId().equals(appointment.getPatient().getId())) {
                response.put("error", "Unauthorized to cancel this appointment as it belongs to another user");
                return new ResponseEntity<>(response, HttpStatus.UNAUTHORIZED);
            }

            appointmentRepository.delete(appointment);
            response.put("success", "Appointment cancelled successfully!");
            return new ResponseEntity<>(response, HttpStatus.OK);
        } catch (EntityNotFoundException e) {
            response.put("error", e.getMessage());
            return new ResponseEntity<>(response, HttpStatus.NOT_FOUND);
        } catch (Exception e) {
            response.put("error", "An unexpected error occurred: " + e.getMessage());
            return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // 7. **Get Appointments Method**:
    //    - This method retrieves a list of appointments for a specific doctor on a particular day, optionally filtered by the patient's name.
    //    - It uses `@Transactional` to ensure that database operations are consistent and handled in a single transaction.
    //    - Instruction: Ensure the correct use of transaction boundaries, especially when querying the database for appointments.
    @Transactional(readOnly = true)
    public ResponseEntity<Map<String, Object>> getAppointment(String pname, LocalDate date, String token) {
        Map<String, Object> response = new HashMap<>();
        List<Appointment> appointments;
        try {
            Doctor doctor = doctorRepository.findByEmail(tokenService.extractEmail(token))
                    .orElseThrow(() -> new EntityNotFoundException("Doctor not found - Invalid Token"));

            // Convert LocalDate to LocalDateTime at start of day (00:00)
            LocalDateTime startOfDay = date.atStartOfDay();
            // End of the day (23:59:59.999999999)
            LocalDateTime endOfDay = date.atTime(LocalTime.MAX);

            // Here we use both
            // findByDoctorIdAndPatient_NameContainingIgnoreCaseAndAppointmentTimeBetween
            // and
            // findByDoctorIdAndAppointmentTimeBetween
            // to handle the case of pname being null.
            // A better, more advanced approach would be Specifications (JpaSpecificationExecutor)
            if (pname != null) {
                ;appointments = appointmentRepository
                        .findByDoctorIdAndPatient_NameContainingIgnoreCaseAndAppointmentTimeBetween(doctor.getId(), pname, startOfDay, endOfDay);
            } else {
                ;appointments = appointmentRepository
                        .findByDoctorIdAndAppointmentTimeBetween(doctor.getId(), startOfDay, endOfDay);
            }
            response.put("success", appointments);
            return new ResponseEntity<>(response, HttpStatus.OK);

        } catch (EntityNotFoundException e) {
            response.put("error", e.getMessage());
            return new ResponseEntity<>(response, HttpStatus.NOT_FOUND);

        } catch (Exception e) {
            response.put("error", "An unexpected error occurred: " + e.getMessage());
            return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // 8. **Change Status Method**:
    //    - This method updates the status of an appointment by changing its value in the database.
    //    - It should be annotated with `@Transactional` to ensure the operation is executed in a single transaction.
    //    - Instruction: Add `@Transactional` before this method to ensure atomicity when updating appointment status.
    @Transactional
    public ResponseEntity<Map<String, String>> changeStatus(int status, Long id) {
        Map<String, String> response = new HashMap<>();

        try {
            Appointment appointment = appointmentRepository.findById(id)
                    .orElseThrow(() -> new EntityNotFoundException("Appointment not found."));
            appointmentRepository.updateStatus(status, id);
            response.put("success", "Appointment status updated to: " + status);
            return new ResponseEntity<>(response, HttpStatus.OK);

        } catch (EntityNotFoundException e) {
            response.put("error", e.getMessage());
            return new ResponseEntity<>(response, HttpStatus.NOT_FOUND);

        } catch (Exception e) {
            response.put("error", "An unexpected error occurred: " + e.getMessage());
            return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

}
