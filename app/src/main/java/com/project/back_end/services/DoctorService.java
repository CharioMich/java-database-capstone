package com.project.back_end.services;

import com.project.back_end.DTO.Login;
import com.project.back_end.models.Appointment;
import com.project.back_end.models.Doctor;
import com.project.back_end.repo.AppointmentRepository;
import com.project.back_end.repo.DoctorRepository;
import jakarta.persistence.EntityExistsException;
import jakarta.persistence.EntityNotFoundException;
import jakarta.security.auth.message.AuthException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class DoctorService {

    // 1. **Add @Service Annotation**:
    //    - This class should be annotated with `@Service` to indicate that it is a service layer class.
    //    - The `@Service` annotation marks this class as a Spring-managed bean for business logic.
    //    - Instruction: Add `@Service` above the class declaration.

    // 2. **Constructor Injection for Dependencies**:
    //    - The `DoctorService` class depends on `DoctorRepository`, `AppointmentRepository`, and `TokenService`.
    //    - These dependencies should be injected via the constructor for proper dependency management.
    //    - Instruction: Ensure constructor injection is used for injecting dependencies into the service.

    private final AppointmentRepository appointmentRepository;
    private final TokenService tokenService;
    private final DoctorRepository doctorRepository;

    public DoctorService(
            AppointmentRepository appointmentRepository,
            TokenService tokenService,
            DoctorRepository doctorRepository
    ) {
        this.appointmentRepository = appointmentRepository;
        this.tokenService = tokenService;
        this.doctorRepository = doctorRepository;
    }

    // 3. **Add @Transactional Annotation for Methods that Modify or Fetch Database Data**:
    //    - Methods like `getDoctorAvailability`, `getDoctors`, `findDoctorByName`, `filterDoctorsBy*` should be annotated with `@Transactional`.
    //    - The `@Transactional` annotation ensures that database operations are consistent and wrapped in a single transaction.
    //    - Instruction: Add the `@Transactional` annotation above the methods that perform database operations or queries.

    // 4. **getDoctorAvailability Method**:
    //    - Retrieves the available time slots for a specific doctor on a particular date and filters out already booked slots.
    //    - The method fetches all appointments for the doctor on the given date and calculates the availability by comparing against booked slots.
    //    - Instruction: Ensure that the time slots are properly formatted and the available slots are correctly filtered.


    @Transactional(readOnly = true)
    public List<String> getDoctorAvailability(Long doctorId, LocalDate date) {
        try {
            Doctor doctor = doctorRepository.findById(doctorId)
                    .orElseThrow(() -> new EntityNotFoundException("Doctor not found"));

            // Convert LocalDate to LocalDateTime at start of day (00:00)
            LocalDateTime startOfDay = date.atStartOfDay();
            // End of the day (23:59:59.999999999)
            LocalDateTime endOfDay = date.atTime(LocalTime.MAX);

            List<Appointment> appointments = appointmentRepository.findByDoctorIdAndAppointmentTimeBetween(doctorId, startOfDay, endOfDay);

            List<String> bookedTimes = appointments.stream()
                    .map((appointment) -> appointment.getAppointmentTimeOnly().toString())
                    .toList();

            return doctor.getAvailableTimes()
                    .stream()
                    .filter(time -> !bookedTimes.contains(time))
                    .toList();

        } catch(EntityNotFoundException e) {
            System.out.println("Doctor with id " + doctorId + " not found.");
            return List.of();
        }
    }


    // 5. **saveDoctor Method**:
    //    - Used to save a new doctor record in the database after checking if a doctor with the same email already exists.
    //    - If a doctor with the same email is found, it returns `-1` to indicate conflict; `1` for success, and `0` for internal errors.
    //    - Instruction: Ensure that the method correctly handles conflicts and exceptions when saving a doctor.
    @Transactional
    public int saveDoctor(Doctor doctor) {
        try {
            if (doctorRepository.findByEmail(doctor.getEmail()).isPresent()) throw new EntityExistsException("Doctor already exists");
            doctorRepository.save(doctor);
            return 1;
        } catch(EntityExistsException e) {
            System.out.println("Doctor with email: " + doctor.getEmail() + " already exists");
            return -1;
        } catch (Exception e) {
            System.out.println("Error in saving doctor. Error: " + e.getMessage());
            return 0;
        }
    }


    // 6. **updateDoctor Method**:
    //    - Updates an existing doctor's details in the database. If the doctor doesn't exist, it returns `-1`.
    //    - Instruction: Make sure that the doctor exists before attempting to save the updated record and handle any errors properly.
    @Transactional
    public int updateDoctor(Doctor doctor) {
        try {
            Doctor existingDoctor = doctorRepository.findById(doctor.getId())
                    .orElseThrow(() -> new EntityNotFoundException("Doctor to be updated not found"));

            doctorRepository.save(doctor);
            return 1;
        } catch(EntityNotFoundException e) {
            System.out.println(e.getMessage());
            return -1;
        } catch (Exception e) {
            System.out.println("Error in saving doctor. Error: " + e.getMessage());
            return 0;
        }
    }


    // 7. **getDoctors Method**:
    //    - Fetches all doctors from the database. It is marked with `@Transactional` to ensure that the collection is properly loaded.
    //    - Instruction: Ensure that the collection is eagerly loaded, especially if dealing with lazy-loaded relationships (e.g., available times).
    @Transactional(readOnly = true)
    public List<Doctor> getDoctors() {
        try {
            return doctorRepository.findAll();
        } catch (Exception e) {
            System.out.println("Error in getting all doctors. Error: " + e.getMessage());
            return List.of();
        }
    }


    // 8. **deleteDoctor Method**: (by id)
    //    - Deletes a doctor from the system along with all appointments associated with that doctor.
    //    - It first checks if the doctor exists. If not, it returns `-1`; otherwise, it deletes the doctor and their appointments.
    //    - Instruction: Ensure the doctor and their appointments are deleted properly, with error handling for internal issues.
    @Transactional
    public int deleteDoctor(Long id) {
        try {
            if (doctorRepository.findById(id).isEmpty()) throw new EntityNotFoundException("Doctor not found for deletion");
            // Delete appointments
            appointmentRepository.deleteAllByDoctorId(id);
            // Delete doctor
            doctorRepository.deleteById(id);
            return 1;
        } catch(EntityNotFoundException e) {
            System.out.println(e.getMessage());
            return -1;
        } catch (Exception e) {
            System.out.println("Error in deleting doctor. Error: " + e.getMessage());
            return 0;
        }
    }


    // 9. **validateDoctor Method**:
    //    - Validates a doctor's login by checking if the email and password match an existing doctor record.
    //    - It generates a token for the doctor if the login is successful, otherwise returns an error message.
    //    - Instruction: Make sure to handle invalid login attempts and password mismatches properly with error responses.
    @Transactional
    public ResponseEntity<Map<String, String>> validateDoctor(Login login) {
        Map<String, String> response = new HashMap<>();
        try {
            String doctorEmail = login.getIdentifier();
            Doctor doctor =  doctorRepository.findByEmail(doctorEmail)
                    .orElseThrow(EntityNotFoundException::new);
            if (!login.getPassword().equals(doctor.getPassword())) throw new AuthException("Wrong password.");

            // Generate token
            String token = tokenService.generateToken(doctorEmail);
            response.put("token", token);
            // Success message
            response.put("status", "success");
            response.put("message", "Password confirmed for doctor with email: " + doctorEmail);
            // Response
            return new ResponseEntity<>(response, HttpStatus.OK);
        } catch(EntityNotFoundException e) {
            response.put("error", "Doctor with email" + login.getIdentifier() + " not found");
            return new ResponseEntity<>(response, HttpStatus.NOT_FOUND);
        } catch (AuthException e) {
            response.put("error", "Wrong password for doctor with email: " + login.getIdentifier());
            return new ResponseEntity<>(response, HttpStatus.UNAUTHORIZED);
        }
    }


    // 10. **findDoctorByName Method**:
    //    - Finds doctors based on partial name matching and returns the list of doctors with their available times.
    //    - This method is annotated with `@Transactional` to ensure that the database query and data retrieval are properly managed within a transaction.
    //    - Instruction: Ensure that available times are eagerly loaded for the doctors.
    @Transactional(readOnly = true)
    public Map<String, Object> findDoctorByName(String name) {
        Map<String, Object> response = new HashMap<>();
        try {
            List<Doctor> doctors = doctorRepository.findByNameLike(name);

            // Eager loading by "touching" the list, inside a @Transactional method
            // Alternatively we could "JOIN FETCH" in the findByNameLike in the repository
            // or
            // @ElementCollection(fetch = FetchType.EAGER) inside the Doctor model
            // doctors.forEach(d -> d.getAvailableTimes().size());

            response.put("status", "success");
            response.put("doctors", doctors);
            return response;
        } catch(Exception e) {
            response.put("error", "Error while trying to fetch doctors");
            return response;
        }
    }

    // 11. **filterDoctorsByNameSpecialtyAndTime Method**:
    //    - Filters doctors based on their name, specialty, and availability during a specific time (AM/PM).
    //    - The method fetches doctors matching the name and specialty criteria, then filters them based on their availability during the specified time period.
    //    - Instruction: Ensure proper filtering based on both the name and specialty as well as the specified time period.
    @Transactional(readOnly = true)
    public Map<String, Object> filterDoctorsByNameSpecialtyAndTime(String name, String amOrPm, String specialty) {
        Map<String, Object> response = new HashMap<>();

        try {
            List<Doctor> doctors;

            if (!name.isEmpty() && !specialty.isEmpty()) {
                doctors = doctorRepository.findByNameContainingIgnoreCaseAndSpecialtyIgnoreCase(name, specialty);
            } else if (!name.isEmpty()) {
                doctors = doctorRepository.findByNameLike(name);
            } else if (!specialty.isEmpty()) {
                doctors = doctorRepository.findBySpecialtyIgnoreCase(specialty);
            } else {
                doctors = doctorRepository.findAll();
            }

//            List<Doctor> doctors = doctorRepository.findByNameContainingIgnoreCaseAndSpecialtyIgnoreCase(
//                    name,
//                    specialty
//            );

            String period = amOrPm.trim().toUpperCase();

            List<Doctor> filteredDoctors = doctors.stream()
                    .filter(doctor -> {
                        if (doctor.getAvailableTimes() == null || doctor.getAvailableTimes().isEmpty()) return false;
                        if (period.isEmpty()) return true;
                        return doctor.getAvailableTimes().stream().anyMatch(time -> {
                            try {
                                int hour = Integer.parseInt(time.split(":")[0]);
                                if (period.equals("AM")) {
                                    return hour >= 0 && hour < 12;
                                } else if (period.equals("PM")) {
                                    return hour >= 12 && hour < 24;
                                }
                                return false;
                            } catch (NumberFormatException e) {
                                return false;
                            }
                        });
                    })
                    .collect(Collectors.toList());

            response.put("status", "success");
            response.put("doctors", filteredDoctors);
            return response;
        } catch (Exception e) {
            System.out.println(e.getMessage());
            response.put("error", "Error while filtering doctors by name, specialty and time");
            return response;
        }
    }

    // 12. **filterDoctorByTime Method**:
    //    - Filters a list of doctors based on whether their available times match the specified time period (AM/PM).
    //    - This method processes a list of doctors and their available times to return those that fit the time criteria.
    //    - Instruction: Ensure that the time filtering logic correctly handles both AM and PM time slots and edge cases.
    @Transactional(readOnly = true)
    public Map<String, Object> filterDoctorByTime(String amOrPm) {
        Map<String, Object> response = new HashMap<>();

        try {
            List<Doctor> doctors = doctorRepository.findAll();

            String period = amOrPm.trim().toUpperCase();

            List<Doctor> filteredDoctors = doctors.stream()
                    .filter(doctor -> {
                        if (doctor.getAvailableTimes() == null || doctor.getAvailableTimes().isEmpty()) return false;

                        return doctor.getAvailableTimes().stream()
                                .anyMatch(time -> {
                                    try {
                                        int hour = Integer.parseInt(time.split(":")[0]);
                                        if (period.equals("AM")) {
                                            // AM: 00:00 - 11:59
                                            return hour >= 0 && hour < 12;
                                        } else if (period.equals("PM")) {
                                            // PM: 12:00 - 23:59
                                            return hour >= 12 && hour < 24;
                                        }
                                        return false;
                                    } catch (NumberFormatException e) {
                                        return false; // skip invalid time formats
                                    }
                                });

                    }).toList();

            response.put("status", "success");
            response.put("doctors", filteredDoctors);
            return response;
        } catch (Exception e) {
            System.out.println(e.getMessage());
            response.put("error", "Error while filtering doctors by time");
            return response;
        }
    }

    // 13. **filterDoctorByNameAndTime Method**:
    //    - Filters doctors based on their name and the specified time period (AM/PM).
    //    - Fetches doctors based on partial name matching and filters the results to include only those available during the specified time period.
    //    - Instruction: Ensure that the method correctly filters doctors based on the given name and time of day (AM/PM).
    @Transactional(readOnly = true)
    public Map<String, Object> filterDoctorByNameAndTime(String name, String amOrPm) {
        Map<String, Object> response = new HashMap<>();

        try {
            List<Doctor> doctors = doctorRepository.findByNameLike(name);

            String period = amOrPm.trim().toUpperCase();

            List<Doctor> filteredDoctors = doctors.stream()
                    .filter(doctor -> {
                        if (doctor.getAvailableTimes() == null || doctor.getAvailableTimes().isEmpty()) return false;

                        return doctor.getAvailableTimes().stream()
                                .anyMatch(time -> {
                                    try {
                                        int hour = Integer.parseInt(time.split(":")[0]);
                                        if (period.equals("AM")) {
                                            // AM: 00:00 - 11:59
                                            return hour >= 0 && hour < 12;
                                        } else if (period.equals("PM")) {
                                            // PM: 12:00 - 23:59
                                            return hour >= 12 && hour < 24;
                                        }
                                        return false;
                                    } catch (NumberFormatException e) {
                                        return false; // skip invalid time formats
                                    }
                                });

                    }).toList();

            response.put("status", "success");
            response.put("doctors", filteredDoctors);
            return response;
        } catch (Exception e) {
            System.out.println(e.getMessage());
            response.put("error", "Error while filtering doctors by name and time");
            return response;
        }
    }


    // 14. **filterDoctorByNameAndSpecialty Method**:
    //    - Filters doctors by name and specialty.
    //    - It ensures that the resulting list of doctors matches both the name (case-insensitive) and the specified specialty.
    //    - Instruction: Ensure that both name and specialty are considered when filtering doctors.
    @Transactional(readOnly = true)
    public Map<String, Object> filterDoctorByNameAndSpecialty(String name, String specialty) {
        Map<String, Object> response = new HashMap<>();

        try {
            List<Doctor> doctors = doctorRepository.findByNameContainingIgnoreCaseAndSpecialtyIgnoreCase(
                    name,
                    specialty
            );

            response.put("status", "success");
            response.put("doctors", doctors);
            return response;
        } catch (Exception e) {
            System.out.println(e.getMessage());
            response.put("error", "Error while filtering doctors by name and specialty");
            return response;
        }
    }

    // 15. **filterDoctorByTimeAndSpecialty Method**:
    //    - Filters doctors based on their specialty and availability during a specific time period (AM/PM).
    //    - Fetches doctors based on the specified specialty and filters them based on their available time slots for AM/PM.
    //    - Instruction: Ensure the time filtering is accurately applied based on the given specialty and time period (AM/PM).
    @Transactional(readOnly = true)
    public Map<String, Object> filterDoctorByTimeAndSpecialty(String specialty, String amOrPm) {
        Map<String, Object> response = new HashMap<>();

        try {
            List<Doctor> doctors = doctorRepository.findBySpecialtyIgnoreCase(specialty);

            String period = amOrPm.trim().toUpperCase();

            List<Doctor> filteredDoctors = doctors.stream()
                    .filter(doctor -> {
                        if (doctor.getAvailableTimes() == null || doctor.getAvailableTimes().isEmpty()) return false;

                        return doctor.getAvailableTimes().stream()
                                .anyMatch(time -> {
                                    try {
                                        int hour = Integer.parseInt(time.split(":")[0]);
                                        if (period.equals("AM")) {
                                            // AM: 00:00 - 11:59
                                            return hour >= 0 && hour < 12;
                                        } else if (period.equals("PM")) {
                                            // PM: 12:00 - 23:59
                                            return hour >= 12 && hour < 24;
                                        }
                                        return false;
                                    } catch (NumberFormatException e) {
                                        return false; // skip invalid time formats
                                    }
                                });

                    }).toList();

            response.put("status", "success");
            response.put("doctors", filteredDoctors);
            return response;
        } catch (Exception e) {
            System.out.println(e.getMessage());
            response.put("error", "Error while filtering doctors by specialty and time");
            return response;
        }
    }
    // 16. **filterDoctorBySpecialty Method**:
    //    - Filters doctors based on their specialty.
    //    - This method fetches all doctors matching the specified specialty and returns them.
    //    - Instruction: Make sure the filtering logic works for case-insensitive specialty matching.
    @Transactional(readOnly = true)
    public Map<String, Object> filterDoctorBySpecialty(String specialty) {
        Map<String, Object> response = new HashMap<>();

        try {
            List<Doctor> doctors = doctorRepository.findBySpecialtyIgnoreCase(specialty);
            response.put("status", "success");
            response.put("doctors", doctors);
            return response;
        } catch (Exception e) {
            System.out.println(e.getMessage());
            response.put("error", "Error while filtering doctors by specialty");
            return response;
        }
    }

    // 17. **filterDoctorsByTime Method**:
    //    - Filters all doctors based on their availability during a specific time period (AM/PM).
    //    - The method checks all doctors' available times and returns those available during the specified time period.
    //    - Instruction: Ensure proper filtering logic to handle AM/PM time periods.
    @Transactional(readOnly = true)
    public Map<String, Object> filterDoctorsByTime(String amOrPm) {
        Map<String, Object> response = new HashMap<>();
        try {
            String period = amOrPm.trim().toUpperCase();

            List<Doctor> doctors = doctorRepository.findAll();

            List<Doctor> filteredDoctors = doctors.stream().filter(doctor -> {
                        if (doctor.getAvailableTimes() == null || doctor.getAvailableTimes().isEmpty()) {
                            return false;
                        }

                        return doctor.getAvailableTimes().stream().anyMatch(time -> {
                            // Assuming time format like "09:00" or "15:30"
                            try {
                                int hour = Integer.parseInt(time.split(":")[0]);
                                if (period.equals("AM")) {
                                    // AM: 00:00 - 11:59
                                    return hour >= 0 && hour < 12;
                                } else if (period.equals("PM")) {
                                    // PM: 12:00 - 23:59
                                    return hour >= 12 && hour < 24;
                                }
                                return false;
                            } catch (NumberFormatException e) {
                                return false; // skip invalid time formats
                            }
                        });
                    })
                    .toList();

            response.put("status", "success");
            response.put("doctors", filteredDoctors);
            return response;
        } catch (Exception e) {
            System.out.println(e.getMessage());
            response.put("error", "Error while filtering doctors by time");
            return response;
        }
    }

}
