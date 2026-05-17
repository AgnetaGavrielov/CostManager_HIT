# Cost Manager Project

A multi-process system for managing users and costs, built with **Node.js**, **Express**, and **MongoDB Atlas**.

The system follows a **microservices-like architecture**, where each service runs as a separate process.

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
  Returns a JSON array with team members' names

---

### 💰 Costs Service (Port 3003)

Handles cost management and reporting  
*(Partner B - Tal Sujaz)*

- `POST /api/add`  
  Add a new cost item (validates that the user exists)

- `GET /api/report`  
  Get a monthly cost report grouped by categories  
  *(Uses the Computed Design Pattern)*

---

### 📜 Logs Service (Port 3004)

Handles system logging:

- `GET /api/logs`  
  Retrieve system logs from the database

---

## 🛠 Setup & Installation

### 1. Clone the repository

```bash
git clone https://github.com/AgnetaGavrielov/CostManager_HIT.git
cd CostManager_HIT
````

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

The project includes automated tests using:

* **Mocha**
* **Chai**
* **Supertest**

### ▶️ Run tests

1. Make sure **all 4 services are running**
2. Run:

```bash
npx mocha tests/*.js
```

---

## 📌 Notes

* Each service runs independently on its own port
* Make sure MongoDB Atlas is accessible before running the services

---

## 👩‍💻 Authors

This project was developed by **Agneta Gavrielov** and **Tal Sujaz**
as part of the *Asynchronous Server-Side Development* course at HIT (Holon Institute of Technology).

```
