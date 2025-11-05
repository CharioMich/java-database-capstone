package com.project.back_end.controllers;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.validation.FieldError;

import java.util.HashMap;
import java.util.Map;

/**
 * The ValidationFailed class is a custom exception handler that handles validation errors in a Spring Boot application.
 * It is annotated with @RestControllerAdvice, which makes it a global exception handler for REST controllers.
 * This class handles the MethodArgumentNotValidException which occurs when a validation fails during the binding of
 * request parameters or request body fields to the method parameters in a controller. Typically, this happens when
 * input data does not meet the constraints defined by annotations such as @NotNull, @Size, @Email, and so on, in the model class.
 * The @ExceptionHandler(MethodArgumentNotValidException.class) annotation specifies that this method will handle exceptions of type MethodArgumentNotValidException.
 * The method handleValidationException is invoked when a MethodArgumentNotValidException is thrown.
 *
 * Inside the method, the exception object (ex) provides access to the binding result of the validation errors,
 * which includes the field errors (for example, which fields failed validation).
 */
@RestControllerAdvice
public class ValidationFailed {

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, String>> handleValidationException(MethodArgumentNotValidException ex) {
        Map<String, String> errors = new HashMap<>();
        
        // Iterate through all the validation errors
        for (FieldError error : ex.getBindingResult().getFieldErrors()) {
            String errorMessage = error.getDefaultMessage();
            errors.put("message", errorMessage);
        }

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errors);
    }
}