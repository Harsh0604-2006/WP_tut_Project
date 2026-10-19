# Crop Disease Dashboard

A full-stack crop health reporting app that lets users register, sign in, submit crop symptoms, and receive a likely disease match with a recommended remedy. The frontend is built with React + Vite, and the backend is built with Express + MongoDB.

## Project overview

This project is divided into two main parts:

- Frontend: React application in `frontend/`
- Backend: Express API in `backend/`

The frontend handles user interactions and sends API requests to the backend. The backend verifies authentication, matches crop symptoms to disease data, and stores reports in MongoDB.

## Folder structure

```text
WP_tut_Project/
├── backend/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── seed/
│   ├── app.js
│   ├── db.js
│   ├── .env
│   └── package.json
├── frontend/
│   ├── src/
│   ├── .env
│   ├── package.json
│   └── vite.config.js
├── README.md
└── public/
```

## Frontend flow

The frontend app starts at `frontend/src/App.jsx`.

### 1. User enters the app
- The app shows a top navigation with pages like Dashboard, New Report, History, and Login.
- `App.jsx` stores the logged-in user in `localStorage`.
- A JWT token is also saved to the browser storage after login or registration.

### 2. Authentication
- The user can create an account or sign in from the `Login` page.
- The `authApi` helper in `frontend/src/api.js` calls:
  - `POST /api/auth/register`
  - `POST /api/auth/login`
- After success, the frontend stores:
  - `crop-dashboard-token`
  - `crop-dashboard-user`

### 3. Dashboard and history
- The dashboard loads summary data by calling:
  - `GET /api/reports/stats`
- The history page fetches all reports using:
  - `GET /api/reports`
- These requests include the Bearer token automatically via an Axios interceptor.

### 4. New report workflow
- In the `ReportForm` page, the user selects a crop type and one or more visible symptoms.
- The selected data is submitted to:
  - `POST /api/reports`
- The backend compares the selected symptoms with its disease library and returns all matching diseases ranked by symptom overlap.
- The frontend displays each possible disease and its remedy to the user.

## Backend flow

The backend entry point is `backend/app.js`.

### 1. Server startup
When the server starts:
- Express app is created
- CORS is enabled
- JSON request parsing is enabled
- Routes are mounted
- MongoDB connection is initialized

The server exposes routes like:
- `/api/health`
- `/api/auth`
- `/api/reports`

### 2. Routing layer
The backend route files contain API endpoints:

- `backend/routes/authRoutes.js`
  - `POST /register`
  - `POST /login`

- `backend/routes/reportRoutes.js`
  - `POST /`
  - `GET /`
  - `GET /stats`

### 3. Controller layer
Controllers handle request logic:

- `backend/controllers/authController.js`
  - registers a new user
  - validates login credentials
  - creates a JWT token
  - returns user details and token

- `backend/controllers/reportController.js`
  - validates submitted crop and symptoms
  - queries disease records for the chosen crop
  - calculates and ranks disease matches by symptom overlap
  - saves the report in MongoDB
  - returns statistics for the dashboard

### 4. Authentication middleware
`backend/middleware/authMiddleware.js` checks the incoming Bearer token and verifies it using `JWT_SECRET`.

If the token is valid:
- `req.user` is attached
- protected routes can access the logged-in user ID

If invalid:
- the server responds with `401 Unauthorized`

### 5. Database and seed data
`backend/db.js` connects MongoDB using `MONGO_URI` or `MONGODB_URI`.

After connection, it seeds the disease database from the JSON file in `backend/seed/` so the matching logic has a known disease library.

## Data models

The backend uses Mongoose models:

- `User`: stores name, email, and password
- `Disease`: stores crop name, disease name, matching symptoms, and remedy
- `Report`: stores crop type, symptoms, the primary matched disease, all ranked disease matches and remedies, date, and linked user

## Full end-to-end workflow

Here is the complete flow of the application:

1. The user opens the frontend in the browser.
2. The React app loads the dashboard or login page.
3. The user logs in or registers an account.
4. The frontend sends credentials to the backend API.
5. The backend checks the database, hashes the password if registering, and returns a JWT.
6. The frontend stores the token and user info locally.
7. The user chooses a crop and selects symptoms from the report form.
8. The frontend sends the data to `POST /api/reports`.
9. The backend finds disease records matching that crop.
10. It compares the selected symptoms with disease symptom lists.
11. All diseases with at least one matching symptom are ranked by overlap score.
12. The user can optionally attach a JPG, PNG, or WebP crop image up to 5 MB.
13. The report is saved to MongoDB with the primary match plus every matching disease, remedy, symptom-overlap score, relative match probability, and attached image URL.
14. The frontend displays each result's relative match probability and attached image, and the user can view them again in report history.
14. The dashboard loads aggregated statistics from saved reports.

## Setup and run locally

### Backend

```bash
cd backend
npm install
npm run dev
```

### Frontend

In a second terminal:

```bash
cd frontend
npm install
npm run dev
```

## Environment variables

### Backend (`backend/.env`)

```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
PORT=5000
HF_TOKEN=your_hugging_face_access_token
HF_MODEL=neghani/plantvillage-mobilenetv2
CONFIDENCE_THRESHOLD=0.40
```

### Frontend (`frontend/.env`)

```env
VITE_API_URL=http://localhost:5000/api
```

## AI Image-Based Disease Detection

The application supports hosted image-based plant disease classification for **Tomato** and **Potato** using Hugging Face inference.

### 1. Hosted Model & Provider
- **Model:** `neghani/plantvillage-mobilenetv2`
- **Architecture:** MobileNetV2 fine-tuned on the PlantVillage dataset
- **Task:** `image-classification`
- **Hosted Provider:** Hugging Face Serverless Inference Router (`hf-inference`)
- **Status:** Warm and endpoint-compatible on Hugging Face Hub

### 2. Configuring the Hugging Face Token
1. Create a Hugging Face account at [huggingface.co](https://huggingface.co).
2. Go to **Settings -> Access Tokens** (`https://huggingface.co/settings/tokens`).
3. Generate a new token with **Read** access.
4. Add the token to `backend/.env`:
   ```env
   HF_TOKEN=hf_...
   ```
   *Note: `backend/.env` is ignored by Git. Never expose or commit this token.*

### 3. API Contract (`POST /api/reports/predict-image`)
- **Authentication:** Requires `Authorization: Bearer <jwt_token>`
- **Content-Type:** `multipart/form-data`
- **Fields:**
  - `cropType`: `"Tomato"` or `"Potato"`
  - `image`: Image file (JPEG, PNG, or WebP up to 5 MB)

**Success Response (200 OK):**
```json
{
  "status": "success",
  "cropType": "Tomato",
  "modelLabel": "Tomato___Early_blight",
  "disease": "Early Blight",
  "confidence": 0.92,
  "remedy": "Apply a recommended fungicide, remove affected leaves, and improve airflow between plants.",
  "predictions": [
    { "disease": "Early Blight", "modelLabel": "Tomato___Early_blight", "confidence": 0.92 },
    { "disease": "Late Blight", "modelLabel": "Tomato___Late_blight", "confidence": 0.05 }
  ]
}
```

**Uncertain Response (200 OK):**
```json
{
  "status": "uncertain",
  "message": "The result is uncertain. Try a clearer leaf image.",
  "confidence": 0.28
}
```

### 4. Running Automated Tests
The backend contains a test suite using Node's native test runner covering all 12 edge cases (validation, timeouts, token absence, uncertain results, unauthenticated access, and symptom flow regression):
```bash
cd backend
npm test
```

### 5. Privacy Notice
Uploaded crop leaf photos are securely transmitted to the Hugging Face Inference API for automated classification. Images are not retained on disk for prediction-only queries.

### 6. Known Limitations
- **Dataset Domain Shift:** `neghani/plantvillage-mobilenetv2` is trained on PlantVillage laboratory leaf images with uniform backgrounds. Wild field photos with cluttered backgrounds, shadows, or multiple leaves may experience lower accuracy or trigger uncertain classifications.
- **Heuristic Confidence:** Softmax confidence scores are heuristic indicators of model certainty and do not constitute laboratory or agronomic certification.

## Summary

This application follows a classic full-stack architecture:

- Frontend: React handles UI and user interaction
- Backend: Express handles requests and business logic
- Database: MongoDB stores users, diseases, and reports
- Authentication: JWT protects private routes
- Diagnosis flow: symptom matching against a seeded disease dataset

The displayed probability is a relative ranking calculated from symptom overlap across the matching diseases; it is not a clinical or laboratory-confirmed diagnosis. This makes the app easy to extend with more crop types, disease entries, a richer dashboard, or a more advanced prediction model later.
