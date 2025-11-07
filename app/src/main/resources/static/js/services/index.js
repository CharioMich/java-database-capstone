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

/* js/services/index.js */

import { openModal } from '../components/modals.js'
import { selectRole } from '../render.js';
import { API_BASE_URL } from '../config/config.js';

// Define constants for the admin and doctor login API endpoints using the base URL
const ADMIN_API = `${API_BASE_URL}/admin/login`;
const DOCTOR_API = `${API_BASE_URL}/doctor/login`;

/**
 * Use the window.onload event to ensure DOM elements are available after page load
 */
window.addEventListener('DOMContentLoaded', () => {
    // Select the role buttons using the IDs from index.html
    const adminBtn = document.getElementById('admin-btn');
    const doctorBtn = document.getElementById('doctor-btn');
    const patientBtn = document.getElementById('patient-btn');

    // If the admin login button exists:
    // Add a click event listener that calls openModal('adminLogin')
    if (adminBtn) {
        adminBtn.addEventListener('click', () => {
            openModal("adminLogin");
            selectRole('admin');
        });
    }

    // If the doctor login button exists:
    // Add a click event listener that calls openModal('doctorLogin')
    if (doctorBtn) {
        doctorBtn.addEventListener('click', () => {
            openModal("doctorLogin");
            selectRole('doctor');
        });
    }

    // (Logic for Patient button, based on its presence in the HTML)
    if (patientBtn) {
        patientBtn.addEventListener('click', () => {
            // Assuming 'patientLogin' is the modal type for patients
            // Or 'patientRegister' if that's the primary action
            selectRole('patient');
        });
    }
});

/**
 * Define a function named adminLoginHandler on the global window object
 * This function will be triggered when the admin submits their login credentials
 * (from within the modal form)
 */
window.adminLoginHandler = async () => {
    try {
        // Step 1: Get the entered username and password from the input fields
        // (Assuming IDs from a form loaded into the modal)
        const usernameInput = document.getElementById('admin-username');
        const passwordInput = document.getElementById('admin-password');

        if (!usernameInput || !passwordInput) {
            console.error('Admin login form fields not found in modal.');
            return;
        }

        const identifier = usernameInput.value;
        const password = passwordInput.value;

        // Step 2: Create an admin object with these credentials
        const admin = {
            identifier: identifier,
            password: password,
        };

        // Step 3: Use fetch() to send a POST request to the ADMIN_API endpoint
        const response = await fetch(ADMIN_API, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            // Convert the admin object to JSON and send in the body
            body: JSON.stringify(admin),
        });

        // Step 4: If the response is successful:
        if (response.ok) {
            const data = await response.json();
            // Store the token in localStorage
            localStorage.setItem('token', data.token);
            // Call selectRole('admin') to proceed (assuming selectRole is a global function)
            // Or redirect:
            window.location.href = '/admin-dashboard.html'; // Example redirect
        } else {
            // Step 5: If login fails or credentials are invalid:
            // Show an alert with an error message
            alert('Invalid admin credentials. Please try again.');
        }
    } catch (error) {
        // Step 6: Wrap everything in a try-catch to handle network or server errors
        console.error('Admin login error:', error);
        alert('An error occurred during admin login. Please try again later.');
    }
};

/**
 * Define a function named doctorLoginHandler on the global window object
 * This function will be triggered when a doctor submits their login credentials
 * (from within the modal form)
 */
window.doctorLoginHandler = async () => {
    try {
        // Step 1: Get the entered email and password from the input fields
        // (Assuming IDs from a form loaded into the modal)
        const emailInput = document.getElementById('doctor-email');
        const passwordInput = document.getElementById('doctor-password');

        if (!emailInput || !passwordInput) {
            console.error('Doctor login form fields not found in modal.');
            return;
        }
        
        const identifier = emailInput.value;
        const password = passwordInput.value;

        // Step 2: Create a doctor object with these credentials
        const doctor = {
            identifier: identifier,
            password: password,
        };

        // Step 3: Use fetch() to send a POST request to the DOCTOR_API endpoint
        const response = await fetch(DOCTOR_API, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            // Include headers and request body similar to admin login
            body: JSON.stringify(doctor),
        });

        // Step 4: If login is successful:
        if (response.ok) {
            const data = await response.json();
            // Store the token in localStorage
            localStorage.setItem('token', data.token);
            // Call selectRole('doctor') to proceed (assuming selectRole is a global function)
            // Or redirect:
            window.location.href = '/doctor-dashboard.html'; // Example redirect
        } else {
            // Step 5: If login fails:
            // Show an alert for invalid credentials
            alert('Invalid doctor credentials. Please try again.');
        }
    } catch (error) {
        // Step 6: Wrap in a try-catch block to handle errors gracefully
        // Log the error to the console
        console.error('Doctor login error:', error);
        // Show a generic error message
        alert('An error occurred during doctor login. Please try again later.');
    }
};
