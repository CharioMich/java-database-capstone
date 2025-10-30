/*
  Import the openModal function to handle showing login popups/modals
  Import the base API URL from the config file
  Define constants for the admin and doctor login API endpoints using the base URL

  Use the window.onload event to ensure DOM elements are available after page load
  Inside this function:
    - Select the "adminLogin" and "doctorLogin" buttons using getElementById
    - If the admin login button exists:
        - Add a click event listener that calls openModal('adminLogin') to show the admin login modal
    - If the doctor login button exists:
        - Add a click event listener that calls openModal('doctorLogin') to show the doctor login modal


  Define a function named adminLoginHandler on the global window object
  This function will be triggered when the admin submits their login credentials

  Step 1: Get the entered username and password from the input fields
  Step 2: Create an admin object with these credentials

  Step 3: Use fetch() to send a POST request to the ADMIN_API endpoint
    - Set method to POST
    - Add headers with 'Content-Type: application/json'
    - Convert the admin object to JSON and send in the body

  Step 4: If the response is successful:
    - Parse the JSON response to get the token
    - Store the token in localStorage
    - Call selectRole('admin') to proceed with admin-specific behavior

  Step 5: If login fails or credentials are invalid:
    - Show an alert with an error message

  Step 6: Wrap everything in a try-catch to handle network or server errors
    - Show a generic error message if something goes wrong


  Define a function named doctorLoginHandler on the global window object
  This function will be triggered when a doctor submits their login credentials

  Step 1: Get the entered email and password from the input fields
  Step 2: Create a doctor object with these credentials

  Step 3: Use fetch() to send a POST request to the DOCTOR_API endpoint
    - Include headers and request body similar to admin login

  Step 4: If login is successful:
    - Parse the JSON response to get the token
    - Store the token in localStorage
    - Call selectRole('doctor') to proceed with doctor-specific behavior

  Step 5: If login fails:
    - Show an alert for invalid credentials

  Step 6: Wrap in a try-catch block to handle errors gracefully
    - Log the error to the console
    - Show a generic error message
*/

import {openModal} from '../components/modals.js';
import {API_BASE_URL} from '../config/config.js';

const ADMIN_API = API_BASE_URL + '/admin';
const DOCTOR_API = API_BASE_URL + '/doctor/login';

import { openModal } from '../components/modals.js';
import { API_BASE_URL } from '../config/config.js';

const ADMIN_API = API_BASE_URL + '/admin';
const DOCTOR_API = API_BASE_URL + '/doctor/login';

// Setup Button Event Listeners
window.onload = function () {
    const adminBtn = document.getElementById('adminLogin');
    const doctorBtn = document.getElementById('doctorLogin');

    // Admin Login Button
    if (adminBtn) {
        adminBtn.addEventListener('click', () => {
            openModal('adminLogin');
        });
    }

    // Doctor Login Button
    if (doctorBtn) {
        doctorBtn.addEventListener('click', () => {
            openModal('doctorLogin');
        });
    }
};

// --- Admin Login Handler ---
// Make it globally accessible by attaching to window
window.adminLoginHandler = async function () {
    try {
        // Step 1: Get the entered username and password from the input fields
        const username = document.getElementById('adminUsername').value;
        const password = document.getElementById('adminPassword').value;

        // Step 2: Create an admin object with these credentials
        const admin = { username, password };

        // Step 3: Use fetch() to send a POST request to the ADMIN_API endpoint
        const response = await fetch(ADMIN_API, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(admin)
        });

        // Step 4 & 5: Handle response
        if (response.ok) {
            // Successful login
            const data = await response.json();
            const token = data.token; // Assuming the token is returned in a 'token' field

            // Store the token in localStorage
            localStorage.setItem('authToken', token);

            // Call selectRole('admin') to proceed with admin-specific behavior
            // NOTE: Assuming selectRole() is defined/available globally (e.g., in render.js)
            if (typeof selectRole === 'function') {
                 selectRole('admin');
            } else {
                console.error("selectRole function not found. Cannot set role and redirect.");
                // Optionally redirect manually if selectRole is unavailable
            }

        } else if (response.status === 401 || response.status === 403) {
            // Invalid credentials (assuming 401 or 403 for unauthorized/forbidden)
            alert("Invalid credentials!");
        } else {
            // Other unsuccessful response statuses
            alert("Login failed! Please try again.");
        }

    } catch (error) {
        // Step 6: Handle network or unexpected errors
        console.error("Error during Admin login:", error);
        alert("An unexpected error occurred. Please try again later.");
    }
};

// --- Doctor Login Handler ---
// Make it globally accessible by attaching to window
window.doctorLoginHandler = async function () {
    try {
        // Step 1: Get the entered email and password from the input fields
        const email = document.getElementById('doctorEmail').value;
        const password = document.getElementById('doctorPassword').value;

        // Step 2: Create a doctor object with these credentials
        const doctor = { email, password };

        // Step 3: Use fetch() to send a POST request to the DOCTOR_API endpoint
        const response = await fetch(DOCTOR_API, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(doctor)
        });

        // Step 4 & 5: Handle response
        if (response.ok) {
            // Successful login
            const data = await response.json();
            const token = data.token; // Assuming the token is returned in a 'token' field

            // Store the token in localStorage
            localStorage.setItem('authToken', token);

            // Call selectRole('doctor') to proceed with doctor-specific behavior
            // NOTE: Assuming selectRole() is defined/available globally (e.g., in render.js)
            if (typeof selectRole === 'function') {
                 selectRole('doctor');
            } else {
                console.error("selectRole function not found. Cannot set role and redirect.");
                // Optionally redirect manually if selectRole is unavailable
            }

        } else if (response.status === 401 || response.status === 403) {
            // Invalid credentials
            alert("Invalid credentials!");
        } else {
            // Other unsuccessful response statuses
            alert("Login failed! Please try again.");
        }

    } catch (error) {
        // Step 6: Handle network or unexpected errors
        console.error("Error during Doctor login:", error);
        alert("An unexpected error occurred. Please try again later.");
    }
};

