/*
Import the overlay function for booking appointments from loggedPatient.js

  Import the deleteDoctor API function to remove doctors (admin role) from doctorServices.js

  Import function to fetch patient details (used during booking) from patientServices.js

  Function to create and return a DOM element for a single doctor card
    Create the main container for the doctor card
    Retrieve the current user role from localStorage
    Create a div to hold doctor information
    Create and set the doctor’s name
    Create and set the doctor's specialization
    Create and set the doctor's email
    Create and list available appointment times
    Append all info elements to the doctor info container
    Create a container for card action buttons
    === ADMIN ROLE ACTIONS ===
      Create a delete button
      Add click handler for delete button
     Get the admin token from localStorage
        Call API to delete the doctor
        Show result and remove card if successful
      Add delete button to actions container
   
    === PATIENT (NOT LOGGED-IN) ROLE ACTIONS ===
      Create a book now button
      Alert patient to log in before booking
      Add button to actions container
  
    === LOGGED-IN PATIENT ROLE ACTIONS === 
      Create a book now button
      Handle booking logic for logged-in patient   
        Redirect if token not available
        Fetch patient data with token
        Show booking overlay UI with doctor and patient info
      Add button to actions container
   
  Append doctor info and action buttons to the car
  Return the complete doctor card element
*/


import { showBookingOverlay } from '../loggedPatient.js'; // Assuming this function is in a file that is sibling or higher
import { deleteDoctor } from '../services/doctorServices.js';
import { getPatientData } from '../services/patientServices.js';

/*
Import the overlay function for booking appointments from loggedPatient.js
Import the deleteDoctor API function to remove doctors (admin role) from doctorServices.js
Import function to fetch patient details (used during booking) from patientServices.js

Function to create and return a DOM element for a single doctor card
*/
export function createDoctorCard(doctor) {
    // Create the main container for the doctor card
    const card = document.createElement("div");
    card.classList.add("doctor-card");

    // Retrieve the current user role from localStorage
    const role = localStorage.getItem("userRole");

    // Create a div to hold doctor information
    const infoDiv = document.createElement("div");
    infoDiv.classList.add("doctor-info");

    // Create and set the doctor’s name
    const name = document.createElement("h3");
    name.textContent = doctor.name;

    // Create and set the doctor's specialization
    const specialization = document.createElement("p");
    specialization.classList.add("specialization");
    specialization.textContent = `Specialty: ${doctor.specialty}`;

    // Create and set the doctor's email
    const email = document.createElement("p");
    email.textContent = `Email: ${doctor.email}`;

    // Create and list available appointment times
    const availability = document.createElement("p");
    availability.classList.add("availability");
    // Join an array of availability times into a string for display
    const availableTimes = Array.isArray(doctor.availability) ? doctor.availability.join(", ") : doctor.availability;
    availability.textContent = `Available: ${availableTimes}`;

    // Append all info elements to the doctor info container
    infoDiv.appendChild(name);
    infoDiv.appendChild(specialization);
    infoDiv.appendChild(email);
    infoDiv.appendChild(availability);

    // Create a container for card action buttons
    const actionsDiv = document.createElement("div");
    actionsDiv.classList.add("card-actions");

    // === ADMIN ROLE ACTIONS ===
    if (role === "admin") {
        // Create a delete button
        const removeBtn = document.createElement("button");
        removeBtn.textContent = "Delete";
        removeBtn.classList.add("danger-btn");

        // Add click handler for delete button
        removeBtn.addEventListener("click", async () => {
            // 1. Confirm deletion
            if (!confirm(`Are you sure you want to delete Dr. ${doctor.name}?`)) {
                return;
            }

            // 2. Get the admin token from localStorage
            const token = localStorage.getItem("token");

            try {
                // 3. Call API to delete the doctor
                await deleteDoctor(doctor.id, token);

                // 4. On success: remove the card from the DOM
                alert(`Doctor ${doctor.name} deleted successfully.`);
                card.remove();
            } catch (error) {
                console.error("Deletion failed:", error);
                alert(`Failed to delete doctor: ${error.message || "An error occurred."}`);
            }
        });

        // Add delete button to actions container
        actionsDiv.appendChild(removeBtn);
    }
    // ---
    // === PATIENT (NOT LOGGED-IN) ROLE ACTIONS ===
    else if (role === "patient") {
        // Create a book now button
        const bookNow = document.createElement("button");
        bookNow.textContent = "Book Now";
        bookNow.classList.add("primary-btn");

        // Alert patient to log in before booking
        bookNow.addEventListener("click", () => {
            alert("Please log in or sign up to book an appointment.");
            // Optionally redirect to login page
            // window.location.href = "/login.html";
        });

        // Add button to actions container
        actionsDiv.appendChild(bookNow);
    }
    // ---
    // === LOGGED-IN PATIENT ROLE ACTIONS ===
    else if (role === "loggedPatient") {
        // Create a book now button
        const bookNow = document.createElement("button");
        bookNow.textContent = "Book Now";
        bookNow.classList.add("primary-btn");

        // Handle booking logic for logged-in patient
        bookNow.addEventListener("click", async (e) => {
            const token = localStorage.getItem("token");

            // Redirect if token not available
            if (!token) {
                alert("Your session has expired. Please log in again.");
                window.location.href = "/"; // Redirect to root or login
                return;
            }

            try {
                // Fetch patient data with token
                const patientData = await getPatientData(token);

                // Show booking overlay UI with doctor and patient info
                showBookingOverlay(e, doctor, patientData);
            } catch (error) {
                console.error("Error fetching patient data:", error);
                alert("Failed to initiate booking. Please try again.");
            }
        });

        // Add button to actions container
        actionsDiv.appendChild(bookNow);
    }
    // ---

    // Append doctor info and action buttons to the card
    card.appendChild(infoDiv);
    card.appendChild(actionsDiv);

    // Return the complete doctor card element
    return card;
}