/*
  This script handles the admin dashboard functionality for managing doctors:
  - Loads all doctor cards
  - Filters doctors by name, time, or specialty
  - Adds a new doctor via modal form


  Attach a click listener to the "Add Doctor" button
  When clicked, it opens a modal form using openModal('addDoctor')


  When the DOM is fully loaded:
    - Call loadDoctorCards() to fetch and display all doctors


  Function: loadDoctorCards
  Purpose: Fetch all doctors and display them as cards

    Call getDoctors() from the service layer
    Clear the current content area
    For each doctor returned:
    - Create a doctor card using createDoctorCard()
    - Append it to the content div

    Handle any fetch errors by logging them


  Attach 'input' and 'change' event listeners to the search bar and filter dropdowns
  On any input change, call filterDoctorsOnChange()


  Function: filterDoctorsOnChange
  Purpose: Filter doctors based on name, available time, and specialty

    Read values from the search bar and filters
    Normalize empty values to null
    Call filterDoctors(name, time, specialty) from the service

    If doctors are found:
    - Render them using createDoctorCard()
    If no doctors match the filter:
    - Show a message: "No doctors found with the given filters."

    Catch and display any errors with an alert


  Function: renderDoctorCards
  Purpose: A helper function to render a list of doctors passed to it

    Clear the content area
    Loop through the doctors and append each card to the content area


  Function: adminAddDoctor
  Purpose: Collect form data and add a new doctor to the system

    Collect input values from the modal form
    - Includes name, email, phone, password, specialty, and available times

    Retrieve the authentication token from localStorage
    - If no token is found, show an alert and stop execution

    Build a doctor object with the form values

    Call saveDoctor(doctor, token) from the service

    If save is successful:
    - Show a success message
    - Close the modal and reload the page

    If saving fails, show an error message
*/

import { openModal } from '../components/modals.js';
import { getDoctors, filterDoctors, saveDoctor } from './services/doctorServices.js';
import { createDoctorCard } from '../components/doctorCard.js';

// Get the content container where doctor cards will be rendered
const contentDiv = document.getElementById("content");

/*
  Attach a click listener to the "Add Doctor" button
  When clicked, it opens a modal form using openModal('addDoctor')
*/
document.addEventListener('DOMContentLoaded', () => {
    const addDocBtn = document.getElementById('addDocBtn');
    if (addDocBtn) {
        addDocBtn.addEventListener('click', () => {
            openModal('addDoctor');
        });
    }

    // Call loadDoctorCards() when the DOM is fully loaded to display initial data
    loadDoctorCards();

    /*
      Attach 'input' and 'change' event listeners to the search bar and filter dropdowns
      On any input change, call filterDoctorsOnChange()
    */
    const searchBar = document.getElementById("searchBar");
    const filterTime = document.getElementById("filterTime");
    const filterSpecialty = document.getElementById("filterSpecialty");

    if (searchBar) searchBar.addEventListener("input", filterDoctorsOnChange);
    if (filterTime) filterTime.addEventListener("change", filterDoctorsOnChange);
    if (filterSpecialty) filterSpecialty.addEventListener("change", filterDoctorsOnChange);
});

/**
 * Function: renderDoctorCards
 * Purpose: A helper function to render a list of doctors passed to it
 * @param {Array<Object>} doctors - List of doctor objects to display.
 */
function renderDoctorCards(doctors) {
    // Clear the content area
    if (contentDiv) {
        contentDiv.innerHTML = "";

        // Loop through the doctors and append each card to the content area
        if (doctors && doctors.length > 0) {
            doctors.forEach(doctor => {
                const card = createDoctorCard(doctor);
                contentDiv.appendChild(card);
            });
        } else {
            // If no doctors match the filter:
            const noResults = document.createElement('p');
            noResults.className = 'text-center text-muted mt-5';
            noResults.textContent = "No doctors found with the given filters.";
            contentDiv.appendChild(noResults);
        }
    }
}

/**
 * Function: loadDoctorCards
 * Purpose: Fetch all doctors and display them as cards
 */
async function loadDoctorCards() {
    try {
        // Call getDoctors() from the service layer
        const doctors = await getDoctors();

        // Render the fetched doctors
        renderDoctorCards(doctors);

    } catch (error) {
        // Handle any fetch errors by logging them
        console.error("Error loading doctor cards:", error);
        alert("Failed to load doctors. Please check the network connection.");
    }
}


/**
 * Function: filterDoctorsOnChange
 * Purpose: Filter doctors based on name, available time, and specialty
 */
async function filterDoctorsOnChange() {
    try {
        // Read values from the search bar and filters
        const name = document.getElementById("searchBar")?.value.trim() || '';
        const time = document.getElementById("filterTime")?.value || '';
        const specialty = document.getElementById("filterSpecialty")?.value || '';

        // Call filterDoctors(name, time, specialty) from the service
        // Pass the values directly. The service handles non-existing/empty parameters.
        const filteredDoctors = await filterDoctors(name, time, specialty);

        // Render the filtered doctors
        renderDoctorCards(filteredDoctors);

    } catch (error) {
        // Catch and display any errors with an alert
        console.error("Error filtering doctors:", error);
        alert("An error occurred during filtering.");
    }
}


/**
 * Function: adminAddDoctor
 * Purpose: Collect form data and add a new doctor to the system
 * NOTE: This function needs to be exposed globally or bound to the modal form's submit event.
 */
window.adminAddDoctor = async function (event) {
    event.preventDefault(); // Prevent default form submission

    try {
        // Retrieve the authentication token from localStorage
        const token = localStorage.getItem('authToken');
        if (!token) {
            alert("Authentication failed. Please log in again.");
            return;
        }

        // Collect input values from the modal form
        const name = document.getElementById('addDoctorName').value.trim();
        const specialty = document.getElementById('addDoctorSpecialty').value.trim();
        const email = document.getElementById('addDoctorEmail').value.trim();
        const password = document.getElementById('addDoctorPassword').value;
        const mobileNo = document.getElementById('addDoctorMobile').value.trim();
        const availableTime = document.getElementById('addDoctorTime').value.trim();

        // Basic validation
        if (!name || !email || !password || !specialty || !mobileNo || !availableTime) {
            alert("Please fill in all required fields.");
            return;
        }

        // Build a doctor object with the form values
        const newDoctor = {
            name,
            specialty,
            email,
            password,
            mobileNo,
            availableTime
            // Assuming the backend handles ID generation and other defaults
        };

        // Call saveDoctor(doctor, token) from the service
        const result = await saveDoctor(newDoctor, token);

        if (result.success) {
            // If save is successful:
            alert("Doctor added successfully: " + result.message);
            // Assuming the modal provides a way to close itself, or we manually hide it
            // For simplicity, we'll rely on the modal component to handle closing, or use a general approach:

            // Reload the doctor list to display the new doctor
            await loadDoctorCards();

            // Optionally manually close the modal if required, e.g., openModal(null) or a specific close function
            // Since we don't have a specific closeModal function, we'll just focus on reloading data.
            // If running on a dedicated page, a simple page reload might work too: window.location.reload();

        } else {
            // If saving fails, show an error message
            alert("Failed to add doctor: " + result.message);
        }

    } catch (error) {
        console.error("Error during adminAddDoctor:", error);
        alert("An unexpected error occurred while adding the doctor.");
    }
};
