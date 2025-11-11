// patientDashboard.js
import { getDoctors } from './services/doctorServices.js';
import { openModal } from './components/modals.js';
import { createDoctorCard } from './components/doctorCard.js';
import { filterDoctors } from './services/doctorServices.js';//call the same function to avoid duplication coz the functionality was same
import { patientSignup, patientLogin } from './services/patientServices.js';
import { renderContent } from './render.js';
import { setRole } from './util.js';


document.addEventListener("DOMContentLoaded", () => {
  const contentDiv = document.getElementById("content");
    if (contentDiv) {
      loadDoctorCards();
    }
});

document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("patientSignup");
  if (btn) {
    btn.addEventListener("click", () => openModal("patientSignup"));
  }
});

document.addEventListener("DOMContentLoaded", () => {
  const loginBtn = document.getElementById("patientLogin")
  if (loginBtn) {
    loginBtn.addEventListener("click", () => {
      openModal("patientLogin")
    })
  }
})

function loadDoctorCards() {
  getDoctors()
    .then(res => {
      const contentDiv = document.getElementById("content");
      contentDiv.innerHTML = "";

      res["doctors"].forEach(doctor => {
        const card = createDoctorCard(doctor);
        contentDiv.appendChild(card);
      });
    })
    .catch(error => {
      console.error("Failed to load doctors:", error);
    });
}

// Filter Input with guard clauses
const searchBar = document.getElementById("searchBar");
if (searchBar) {
  searchBar.addEventListener("input", filterDoctorsOnChangePatient);
}

const filterTime = document.getElementById("filterTime");
if (filterTime) {
  filterTime.addEventListener("change", filterDoctorsOnChangePatient);
}

const filterSpecialty = document.getElementById("filterSpecialty");
if (filterSpecialty) {
  filterSpecialty.addEventListener("change", filterDoctorsOnChangePatient);
}



function filterDoctorsOnChangePatient() {
  const searchBar = document.getElementById("searchBar").value.trim();
  const filterTime = document.getElementById("filterTime").value;
  const filterSpecialty = document.getElementById("filterSpecialty").value;


  const name = searchBar.length > 0 ? searchBar : null;
  const time = filterTime.length > 0 ? filterTime : null;
  const specialty = filterSpecialty.length > 0 ? filterSpecialty : null;

  filterDoctors(name, time, specialty)
    .then(response => {
      const doctors = response.doctors;
      const contentDiv = document.getElementById("content");
      contentDiv.innerHTML = "";

      if (doctors.length > 0) {
        console.log(doctors);
        doctors.forEach(doctor => {
          const card = createDoctorCard(doctor);
          contentDiv.appendChild(card);
        });
      } else {
        contentDiv.innerHTML = "<p>No doctors found with the given filters.</p>";
        console.log("Nothing");
      }
    })
    .catch(error => {
      console.error("Failed to filter doctors:", error);
      alert("An error occurred while filtering doctors.");
    });
}

