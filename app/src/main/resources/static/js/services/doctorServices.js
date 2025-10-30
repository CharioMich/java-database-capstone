/*
  Import the base API URL from the config file
  Define a constant DOCTOR_API to hold the full endpoint for doctor-related actions


  Function: getDoctors
  Purpose: Fetch the list of all doctors from the API

   Use fetch() to send a GET request to the DOCTOR_API endpoint
   Convert the response to JSON
   Return the 'doctors' array from the response
   If there's an error (e.g., network issue), log it and return an empty array


  Function: deleteDoctor
  Purpose: Delete a specific doctor using their ID and an authentication token

   Use fetch() with the DELETE method
    - The URL includes the doctor ID and token as path parameters
   Convert the response to JSON
   Return an object with:
    - success: true if deletion was successful
    - message: message from the server
   If an error occurs, log it and return a default failure response


  Function: saveDoctor
  Purpose: Save (create) a new doctor using a POST request

   Use fetch() with the POST method
    - URL includes the token in the path
    - Set headers to specify JSON content type
    - Convert the doctor object to JSON in the request body

   Parse the JSON response and return:
    - success: whether the request succeeded
    - message: from the server

   Catch and log errors
    - Return a failure response if an error occurs


  Function: filterDoctors
  Purpose: Fetch doctors based on filtering criteria (name, time, and specialty)

   Use fetch() with the GET method
    - Include the name, time, and specialty as URL path parameters
   Check if the response is OK
    - If yes, parse and return the doctor data
    - If no, log the error and return an object with an empty 'doctors' array

   Catch any other errors, alert the user, and return a default empty result
*/


import { API_BASE_URL } from "../config/config.js";

// Define the base API endpoint for doctor services
const DOCTOR_API = API_BASE_URL + '/doctor';

/**
 * Function: getDoctors
 * Purpose: Fetch all doctor records from the server.
 * @returns {Array<Object>} An array of doctor objects, or an empty array on failure.
 */
export async function getDoctors() {
    try {
        // Send a GET request to the DOCTOR_API endpoint
        const response = await fetch(DOCTOR_API, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        });

        // Check if the request was successful
        if (response.ok) {
            // Extract and return the list of doctors from the response JSON
            return await response.json();
        } else {
            // Log the status if the response is not OK
            console.error(`Failed to fetch doctors: HTTP status ${response.status}`);
            return []; // Return empty list on non-200 status
        }
    } catch (error) {
        // Handle network or unexpected errors
        console.error("Error fetching doctors:", error);
        return []; // Return empty list on error
    }
}

/**
 * Function: deleteDoctor
 * Purpose: Delete a specific doctor using their ID, requiring an authentication token.
 * @param {number} id - The unique ID of the doctor to delete.
 * @param {string} token - The Admin authentication token.
 * @returns {Object} { success: boolean, message: string }
 */
export async function deleteDoctor(id, token) {
    // Construct the full endpoint URL including the ID and token
    const url = `${DOCTOR_API}/${id}/${token}`;

    try {
        // Use fetch() with the DELETE method
        const response = await fetch(url, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                // Although the token is in the URL (as per instructions), typically it's better in the Authorization header
                // 'Authorization': `Bearer ${token}`
            }
        });

        // Check if the response is OK
        if (response.ok) {
            // Convert the response to JSON
            const data = await response.json();
            // Return a success object
            return {
                success: true,
                message: data.message || "Doctor deleted successfully."
            };
        } else {
            // If deletion failed (e.g., doctor not found, token invalid)
            const errorData = await response.json();
            return {
                success: false,
                message: errorData.message || `Deletion failed with status: ${response.status}`
            };
        }
    } catch (error) {
        // If an error occurs, log it and return a default failure response
        console.error("Error deleting doctor:", error);
        return {
            success: false,
            message: "An unexpected error occurred during doctor deletion."
        };
    }
}

/**
 * Function: saveDoctor
 * Purpose: Save (create) a new doctor using a POST request, requiring an authentication token.
 * @param {Object} doctor - The doctor object containing details.
 * @param {string} token - The Admin authentication token.
 * @returns {Object} { success: boolean, message: string }
 */
export async function saveDoctor(doctor, token) {
    // Construct the full endpoint URL including the token
    const url = `${DOCTOR_API}/${token}`;

    try {
        // Use fetch() with the POST method
        const response = await fetch(url, {
            method: 'POST',
            // Set headers to specify JSON content type
            headers: {
                'Content-Type': 'application/json',
                // 'Authorization': `Bearer ${token}`
            },
            // Convert the doctor object to JSON in the request body
            body: JSON.stringify(doctor)
        });

        // Parse the JSON response
        const data = await response.json();

        // Check if the response is OK
        if (response.ok) {
            // Return a success object
            return {
                success: true,
                message: data.message || "Doctor saved successfully."
            };
        } else {
            // Return a failure object
            return {
                success: false,
                message: data.message || `Failed to save doctor with status: ${response.status}`
            };
        }
    } catch (error) {
        // Catch and log errors
        console.error("Error saving doctor:", error);
        // Return a failure response if an error occurs
        return {
            success: false,
            message: "An unexpected network error occurred while saving the doctor."
        };
    }
}

/**
 * Function: filterDoctors
 * Purpose: Fetch doctors based on filtering criteria (name, time, and specialty).
 * @param {string} [name=''] - Name filter.
 * @param {string} [time=''] - Time/Availability filter.
 * @param {string} [specialty=''] - Specialty filter.
 * @returns {Array<Object>} An array of filtered doctor objects, or an empty array on failure.
 */
export async function filterDoctors(name = '', time = '', specialty = '') {
    // Construct the query parameters string, ensuring empty strings are handled
    const queryName = name ? `name=${encodeURIComponent(name)}` : '';
    const queryTime = time ? `time=${encodeURIComponent(time)}` : '';
    const querySpecialty = specialty ? `specialty=${encodeURIComponent(specialty)}` : '';

    // Join parameters with '&', filtering out empty ones
    const queryParams = [queryName, queryTime, querySpecialty].filter(p => p).join('&');

    // Construct the full URL for the GET request
    // Assuming the filter endpoint is DOCTOR_API/filter/param1/param2/param3 as per typical REST path filtering,
    // OR, more standardly, using query parameters. We will use query parameters for standard REST practices.
    const url = `${DOCTOR_API}/filter?${queryParams}`;

    // NOTE: Based on the instruction 'passing these values as route parameters' vs query params,
    // if the server expects path params, the URL would be:
    // const url = `${DOCTOR_API}/filter/${name || 'null'}/${time || 'null'}/${specialty || 'null'}`;
    // We will stick with the cleaner query parameters approach unless path parameters are strictly required by the API.
    // If you need the path parameter approach, replace the URL construction above with the commented one.

    try {
        // Use fetch() with the GET method
        const response = await fetch(url, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        });

        // Check if the response is OK
        if (response.ok) {
            // Parse and return the doctor data
            return await response.json();
        } else {
            // If response is not OK, log the error and return an empty array
            console.error(`Failed to filter doctors: HTTP status ${response.status}`);
            return [];
        }
    } catch (error) {
        // Catch any other errors, log the error, and return a default empty result
        console.error("Error filtering doctors:", error);
        alert("An error occurred while attempting to filter doctors.");
        return [];
    }
}
