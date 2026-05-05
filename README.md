

# Cost Manager Project - Phase 1

This project is a multi-process system for managing costs and users, built with **Node.js**, **Express**, and **MongoDB Atlas**. It follows a microservices-like architecture where each service runs as a separate process.

## 🚀 Services Developed (Partner A - Agneta Gavrielov)

### 1. Users Service (Port 3001)
Handles user management and database integration:
* `POST /api/add`: Creates a new user in the database (required fields: id, first_name, last_name, birthday).
* `GET /api/users`: Retrieves a full list of all registered users.
* `GET /api/users/:id`: Retrieves specific user details, including a placeholder for total costs.

### 2. About Service (Port 3002)
A dedicated process providing team information:
* `GET /api/about`: Returns a JSON array with team members' names.

## 🛠 Setup & Installation

1. **Clone the repository**:
   ```bash
   git clone [https://github.com/AgnetaGavrielov/CostManager_HIT.git](https://github.com/AgnetaGavrielov/CostManager_HIT.git)
   ```
2. **Install dependencies**:
   ```bash
   npm install
   ```
3. **Environment Variables**:
   Create a `.env` file in the root directory and paste the connection string (MONGO_URI) and port definitions provided via WhatsApp.

4. **Run the services**:
   Open separate terminals for each service to run them simultaneously:
   ```bash
   node usersService.js
   node aboutService.js

```

## 🧪 Testing
The project includes automated unit tests using **Mocha**, **Chai**, and **Supertest**.
To run the tests, ensure the Users Service is running on port 3001, then use:
```bash
npx mocha tests/userTests.js
```

## 📅 Next Steps for Partner B - Tal Sujez
* **Costs Model**: Define the schema in `models/Cost.js`.
* **Costs Service**: Develop the process on Port 3003, including the monthly report using the **Computed Design Pattern**.
* **Logs Service**: Develop the process on Port 3004 to retrieve Pino logs from the database.
```

```