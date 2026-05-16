# Cost Manager Project

This project is a multi-process system for managing costs and users, built with **Node.js**, **Express**, and **MongoDB Atlas**. It follows a microservices-like architecture where each service runs as a separate process.

## 🚀 Services Developed

### 1. Users Service (Port 3001)

Handles user management and database integration:

* `POST /api/add`: Creates a new user in the database (required fields: id, first_name, last_name, birthday).
* `GET /api/users`: Retrieves a full list of all registered users.
* `GET /api/users/:id`: Retrieves specific user details, including a placeholder for total costs.

### 2. About Service (Port 3002)

A dedicated process providing team information:

* `GET /api/about`: Returns a JSON array with team members' names.

### 3. Costs Service (Port 3003)

Handles cost management and reporting (Partner B - Tal Sujez):

* `POST /api/add`: Adds a new cost item to the database.
* `GET /api/report`: Retrieves a monthly report of costs grouped by categories (using the Computed Design Pattern).

### 4. Logs Service (Port 3004)

Handles logging:

* `GET /api/logs`: Retrieves system logs from the database.

## 🛠 Setup & Installation

1. **Clone the repository**:

   ```bash
   git clone https://github.com/AgnetaGavrielov/CostManager_HIT.git
   ```

2. **Install dependencies**:

   ```bash
   npm install
   ```

3. **Environment Variables**:
   Create a `.env` file in the root directory and add:

   * `MONGO_URI`
   * Port variables 
   USERS_PORT=3001
ABOUT_PORT=3002
COST_PORT=3003
LOG_PORT=3004

4. **Run the services**:
   Open separate terminals for each service:

   ```bash
   node usersService.js
   node aboutService.js
   node costService.js
   node logService.js
   ```

## 🧪 Testing

The project includes automated tests using **Mocha**, **Chai**, and **Supertest**.

### How to run tests:

1. Make sure the **Users Service** is running on port `3001`.
2. Run the tests with:

   ```bash
   npx mocha tests/userTests.js
   ```


