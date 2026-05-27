# Cost Manager Project

A multi-process system for managing users and costs, built with **Node.js**, **Express**, and **MongoDB Atlas**.

The system follows a **microservices-like architecture**, where each service runs as a separate process.

---

## ☁️ Live Deployment (Render)

All microservices are fully deployed and live on the cloud. You can click the links below to test the active endpoints directly in your browser:

- **Users Service:** `https://costmanager-users-dog5.onrender.com/api/users`
- **About Service:** `https://costmanager-about-2r6u.onrender.com/api/about`
- **Costs & Report Service:** `https://costmanager-costs-fljc.onrender.com/api/report?id=123123&year=2026&month=5`
- **Logs Service:** `https://costmanager-logs-mu5w.onrender.com/api/logs`

---

## 🚀 Services

### 👤 Users Service (Port 3001)

Handles user management and database operations:

- `POST /api/add`  
  Create a new user  
  **Required fields:** `id`, `first_name`, `last_name`, `birthday`

- `GET /api/users`  
  Get a list of all users

- `GET /api/users/:id`  
  Get details of a specific user, including total cost calculation

---

### ℹ️ About Service (Port 3002)

Provides information about the development team:

- `GET /api/about`  
  Returns a JSON array with team members' first and last names only

---

### 💰 Costs Service (Port 3003)

Handles cost management and reporting:

- `POST /api/add`  
  Add a new cost item (validates that the user exists)  
  **Required fields:** `userid`, `description`, `category`, `sum`  
  **Supported categories:** `food`, `health`, `housing`, `sports`, `education`

- `GET /api/report?id=:id&year=:year&month=:month`  
  Get a monthly cost report grouped by categories  
  **Required parameters:** `id`, `year`, `month`

  > **Computed Design Pattern:** Reports for past months are calculated once and cached
  > in the database. Subsequent requests for the same month return the cached result
  > immediately, without recalculating.

---

### 📜 Logs Service (Port 3004)

Handles system logging:

- `GET /api/logs`  
  Retrieve all system logs from the database  
  *(Every HTTP request to any service is automatically logged)*

---

## 🛠 Setup & Installation

### 1. Clone the repository

```bash
git clone [https://github.com/AgnetaGavrielov/CostManager_HIT.git](https://github.com/AgnetaGavrielov/CostManager_HIT.git)
cd CostManager_HIT

```

### 2. Install dependencies

```bash
npm install

```

### 3. Environment Variables

Create a `.env` file in the root directory:

```env
MONGO_URI=your_mongodb_connection_string_here
USERS_PORT=3001
ABOUT_PORT=3002
COST_PORT=3003
LOG_PORT=3004

```

> **🎓 Note for the Lecturer:** The actual `MONGO_URI` connection string is provided securely in the submitted PDF document. You can copy it directly from there to run the project locally.

---

### 4. Run the services

Open a separate terminal for each service:

```bash
node users_service.js
node about_service.js
node cost_service.js
node log_service.js

```

---

## 🧪 Testing

### 🌐 Cloud Testing (Postman & Python)

To easily test the live API endpoints, you can use **Postman** or the included Python script:

* **Postman:** Send requests directly to the Render URLs listed at the top of this document.
* **Python Script:** Run the included `test_project.py` script to perform an automated integration test directly against the live cloud servers.

### 💻 Local Testing (Mocha & Chai)

The project also includes automated unit tests using **Mocha**, **Chai**, and **Supertest**.

1. Make sure **all 4 services are running** locally.
2. Run:

```bash
npm test

```

---

## 📌 Notes

* Each service runs independently on its own port
* Make sure MongoDB Atlas is accessible before running the services

---

## 👩‍💻 Authors

This project was developed by **Agneta Gavrielov** and **Tal Sujaz** as part of the *Asynchronous Server-Side Development* course at HIT (Holon Institute of Technology).
