/*
  Import getAllAppointments to fetch appointments from the backend
  Import createPatientRow to generate a table row for each patient appointment


  Get the table body where patient rows will be added
  Initialize selectedDate with today's date in 'YYYY-MM-DD' format
  Get the saved token from localStorage (used for authenticated API calls)
  Initialize patientName to null (used for filtering by name)


  Add an 'input' event listener to the search bar
  On each keystroke:
    - Trim and check the input value
    - If not empty, use it as the patientName for filtering
    - Else, reset patientName to "null" (as expected by backend)
    - Reload the appointments list with the updated filter


  Add a click listener to the "Today" button
  When clicked:
    - Set selectedDate to today's date
    - Update the date picker UI to match
    - Reload the appointments for today


  Add a change event listener to the date picker
  When the date changes:
    - Update selectedDate with the new value
    - Reload the appointments for that specific date


  Function: loadAppointments
  Purpose: Fetch and display appointments based on selected date and optional patient name

  Step 1: Call getAllAppointments with selectedDate, patientName, and token
  Step 2: Clear the table body content before rendering new rows

  Step 3: If no appointments are returned:
    - Display a message row: "No Appointments found for today."

  Step 4: If appointments exist:
    - Loop through each appointment and construct a 'patient' object with id, name, phone, and email
    - Call createPatientRow to generate a table row for the appointment
    - Append each row to the table body

  Step 5: Catch and handle any errors during fetch:
    - Show a message row: "Error loading appointments. Try again later."


  When the page is fully loaded (DOMContentLoaded):
    - Call renderContent() (assumes it sets up the UI layout)
    - Call loadAppointments() to display today's appointments by default
*/


/*
  Import getAllAppointments to fetch appointments from the backend
  Import createPatientRow to generate a table row for each patient appointment
*/
import { getAllAppointments } from './services/appointmentRecordService.js';
import { createPatientRow } from './components/patientRows.js';


/*
  Get the table body where patient rows will be added
  Initialize selectedDate with today's date in 'YYYY-MM-DD' format
  Get the saved token from localStorage (used for authenticated API calls)
  Initialize patientName to null (used for filtering by name)
*/
const appointmentTableBody = document.getElementById('patientTableBody');

// Helper function to get today's date in YYYY-MM-DD format
const getTodayDate = () => new Date().toISOString().split('T')[0];

let selectedDate = getTodayDate();
const token = localStorage.getItem('token');
// Initialize patientName to the string "null" as expected by the backend per comments
let patientName = "";


/**
 * Helper function to display a message row in the table.
 * @param {string} message - The message to display.
 */
const displayMessageRow = (message) => {
    if (appointmentTableBody) {
        // Clear body
        appointmentTableBody.innerHTML = '';
        // Add message row
        const row = document.createElement('tr');
        row.innerHTML = `<td colspan="100%" class="text-center text-muted p-4">${message}</td>`;
        appointmentTableBody.appendChild(row);
    }
};

/*
  Function: loadAppointments
  Purpose: Fetch and display appointments based on selected date and optional patient name
*/
async function loadAppointments() {
    // Ensure table body and token exist before fetching
    if (!appointmentTableBody) {
        console.error("Fatal Error: #patientTableBody element not found.");
        return;
    }
    if (!token) {
        displayMessageRow("Authentication Error: No token found. Please log in again.");
        return;
    }

    try {
        // Step 1: Call getAllAppointments
        const response = await getAllAppointments(selectedDate, patientName, token);
        const appointments = response.appointments;
        console.log(response);
        // Step 2: Clear the table body content
        appointmentTableBody.innerHTML = "";

        // Step 3: If no appointments are returned
        if (!appointments || appointments.length === 0) {
            // Display message as specified in comments
            displayMessageRow("No Appointments found for today.");
        } else {
            // Step 4: If appointments exist
            appointments.forEach(appointment => {
                // Call createPatientRow to generate a table row
                const row = createPatientRow(appointment.patient, appointment.id, appointment.doctor.id);
                // Append row to the table body
                appointmentTableBody.appendChild(row);
            });
        }
    } catch (error) {
        // Step 5: Catch and handle any errors
        console.error("Error loading appointments:", error);
        displayMessageRow("Error loading appointments. Try again later.");
    }
}


/*
  When the page is fully loaded (DOMContentLoaded):
    - Call renderContent() (assumes it sets up the UI layout)
    - Call loadAppointments() to display today's appointments by default
*/
document.addEventListener('DOMContentLoaded', () => {

    // --- Get references to filter controls ---
    const searchBar = document.getElementById('searchBar');
    const todayButton = document.getElementById('todayButton');
    const datePicker = document.getElementById('datePicker');

    /*
      Add an 'input' event listener to the search bar
    */
    if (searchBar) {
        searchBar.addEventListener('input', (e) => {
            const query = e.target.value.trim();
            // If not empty, use it; else, reset to string "null"
            patientName = query ? query : "null";
            loadAppointments();
        });
    }

    /*
      Add a click listener to the "Today" button
    */
    if (todayButton) {
        todayButton.addEventListener('click', () => {
            selectedDate = getTodayDate();
            // Update the date picker UI to match
            if (datePicker) {
                datePicker.value = selectedDate;
            }
            loadAppointments();
        });
    }

    /*
      Add a change event listener to the date picker
    */
    if (datePicker) {
        // Set the initial value of the date picker
        datePicker.value = selectedDate;

        datePicker.addEventListener('change', (e) => {
            selectedDate = e.target.value;
            loadAppointments();
        });
    }

    // Call renderContent() (if it exists, as per instructions)
    if (typeof renderContent === 'function') {
        renderContent();
    }

    // Call loadAppointments() to display today's appointments by default
    loadAppointments();
});