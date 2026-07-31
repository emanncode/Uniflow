# 6. API Design

All Uniflow API routes are implemented as Next.js Route Handlers (`uniflow-web/src/app/api/*`). They leverage Supabase's privileged Service Role Client (`createAdminClient()`) to orchestrate Auth and db modifications securely, using authorization middleware (`lib/auth.ts`) to verify callers.

---

## 1. Onboarding & Registration APIs

### `POST /api/approve-university`
*Super Admin approves a pending registration application, onboarding the university and bootstrap admin.*
* **Auth Requirement:** Authenticated user must have the `uniflow_admin` role.
* **Request Input (JSON):**
  ```json
  {
    "registrationId": "uuid"
  }
  ```
* **Success Output (200 OK):**
  ```json
  {
    "success": true,
    "emailSent": true,
    "email": "admin@university.edu",
    "universityName": "State University"
  }
  ```
* **Error Scenarios:**
  * **403 Forbidden:** Caller is not a Super Admin.
  * **404 Not Found:** `registrationId` does not exist in `university_registrations`.
  * **400 Bad Request:** Email address in registration violates validation rules.
  * **500 Server Error:** Supabase auth creation failed or database transaction aborted.

### `POST /api/reject-university`
*Super Admin rejects a pending registration.*
* **Auth Requirement:** Super Admin (`uniflow_admin` role).
* **Request Input (JSON):**
  ```json
  {
    "registrationId": "uuid",
    "reason": "string"
  }
  ```
* **Success Output (200 OK):**
  ```json
  {
    "success": true
  }
  ```
* **Error Scenarios:**
  * **403 Forbidden:** Unauthorized user.
  * **404 Not Found:** Registration record missing.

---

## 2. Staff & Student Registry APIs

### `POST /api/create-staff`
*University Admin creates a new student, lecturer, dean, or HOD profile.*
* **Auth Requirement:** Admin belonging to the target `university_id`.
* **Request Input (JSON):**
  ```json
  {
    "full_name": "John Doe",
    "email": "johndoe@uni.edu",
    "role": "student | lecturer | dean | hod",
    "department_id": "uuid (optional)",
    "university_id": "uuid",
    "level": 100 | 200 | 300 | 400 | 500 (required if role = student, else null)
  }
  ```
* **Success Output (200 OK):**
  ```json
  {
    "success": true,
    "emailSent": true,
    "email": "johndoe@uni.edu",
    "name": "John Doe"
  }
  ```
* **Error Scenarios:**
  * **400 Bad Request:** Missing `university_id`, invalid level value for student, or malformed email.
  * **403 Forbidden:** Admin tries to insert staff for a different university ID.
  * **500 Server Error:** Auth user exists or profile table write rejected.

### `POST /api/reset-password`
*Triggers an administrative password recovery request.*
* **Auth Requirement:** Authorized administrator for the target profile's university.
* **Request Input (JSON):**
  ```json
  {
    "email": "user@uni.edu",
    "university_id": "uuid"
  }
  ```
* **Success Output (200 OK):**
  ```json
  {
    "success": true,
    "emailSent": true
  }
  ```
* **Error Scenarios:**
  * **403 Forbidden:** Caller lacks permissions for the target university.

---

## 3. Academic & Timetable Coordination APIs

### `POST /api/timetable/import`
*Bulk imports academic courses, schedules, and lecturer assignments via a single CSV file.*
* **Auth Requirement:** University Admin.
* **Request Input (JSON):**
  ```json
  {
    "university_id": "uuid",
    "department_id": "uuid",
    "csv_text": "course_code,course_title,level,semester,credit_units,lecturer_email,day,start_time,end_time,venue\nCSC301,Data Structures,300,1,3,lecturer@uni.edu,Monday,08:00,10:00,LT1",
    "mode": "preview | commit",
    "auto_enroll": true
  }
  ```
* **Success Output (200 OK):**
  * **Preview Mode:** Returns parsing analytics and structural issues (e.g. missing lecturer profiles) without touching database state.
    ```json
    {
      "success": true,
      "preview": {
        "totalRows": 2,
        "parsedSlots": [...],
        "errors": [
          { "row": 1, "field": "lecturer_email", "message": "Lecturer profile not found for lecturer@uni.edu. Please create them first." }
        ]
      }
    }
    ```
  * **Commit Mode:** Performs database insertions and returns counts of created/updated entities.
    ```json
    {
      "success": true,
      "stats": {
        "coursesCreated": 1,
        "offeringsCreated": 1,
        "slotsCreated": 1,
        "studentsEnrolled": 45
      }
    }
    ```

### `POST /api/enrollments/auto`
*Triggers batch course enrollments based on department, level, and semester boundaries.*
* **Auth Requirement:** University Admin.
* **Request Input (JSON):**
  ```json
  {
    "university_id": "uuid",
    "department_id": "uuid"
  }
  ```
* **Success Output (200 OK):**
  ```json
  {
    "success": true,
    "enrolledCount": 124
  }
  ```

### `GET /api/course-offerings`
*Lists active course offerings for administrative tracking.*
* **Query Parameters:** `university_id`, `department_id`, `academic_session`, `semester`
* **Success Output (200 OK):**
  ```json
  [
    {
      "id": "uuid-offering",
      "academic_session": "2025/2026",
      "semester": 1,
      "courses": { "code": "CSC301", "title": "Data Structures" },
      "profiles": { "full_name": "Dr. Sarah" }
    }
  ]
  ```

---

## 4. Public & Portal Security APIs

### `POST /api/public/request-password-reset`
*Public password reset route handler supporting the mobile app forgot-password flow.*
* **Auth Requirement:** Public.
* **Request Input (JSON):**
  ```json
  {
    "email": "student@uni.edu",
    "portal": "mobile"
  }
  ```
* **Success Output (200 OK):**
  ```json
  {
    "success": true,
    "message": "Reset email sent successfully"
  }
  ```
* **Error Scenarios:**
  * **403 Forbidden:** The email belongs to a `uniflow_admin` or `university_admin`. Admins cannot trigger self-service resets.
  * **404 Not Found:** Email does not exist.

### `POST /api/auth/verify-portal`
*Validates whether the logged-in session user has permissions to access the current web portal.*
* **Request Input (JSON):**
  ```json
  {
    "token": "supabase-session-token",
    "portal": "uniflow_admin | university_admin"
  }
  ```
* **Success Output (200 OK):**
  ```json
  {
    "success": true,
    "authorized": true,
    "profile": {
      "id": "uuid",
      "role": "university_admin",
      "university_id": "uuid-uni"
    }
  }
  ```
