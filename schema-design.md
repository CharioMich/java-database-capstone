## MySQL Database Design

### Table: patients
- id: INT, Primary Key, Auto Increment
- firstname: VARCHAR(60)
- lastname: VARCHAR(60)

### Table: doctors
- id: INT, Primary Key, Auto Increment
- firstname: VARCHAR(60)
- lastname: VARCHAR(60)

### Table: admins
- id: INT, Primary Key, Auto Increment
- firstname: VARCHAR(60)
- lastname: VARCHAR(60)

### Table: appointments
- id: INT, Primary Key, Auto Increment
- doctor_id: INT, Foreign Key → doctors(id)
- patient_id: INT, Foreign Key → patients(id)
- appointment_time: DATETIME, Not Null
- status: INT (0 = Scheduled, 1 = Completed, 2 = Cancelled)



## MongoDB Collection Design

### Collection: prescriptions

```json
{
  "_id": "ObjectId('64abc123456')",
  "patientName": "John Smith",
  "appointmentId": 51,
  "medication": "Paracetamol",
  "dosage": "500mg",
  "doctorNotes": "Take 1 tablet every 6 hours.",
  "refillCount": 2,
  "pharmacy": {
    "name": "Walgreens SF",
    "location": "Market Street"
  }
}