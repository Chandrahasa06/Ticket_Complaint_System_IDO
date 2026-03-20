# 📦 Infrastructure Ticket Complaint System

> The purpose of this software specification is to outline the requirements for the development of a Ticket-Based Complaint Management System intended for college use. The objective of the system is to provide a structured platform for registering complaints, managing tickets, assigning technicians, and tracking the resolution of complaints across different departments.
The system aims to replace the existing informal and manual complaint handling process with an automated and centralized solution, thereby improving efficiency, transparency, and accountability in complaint management and resolution


---

## 🗂️ Project Structure

```
root/
├── frontend/
│   ├── node_modules/
│   ├── public/
│   ├── src/
│   ├── .env
│   ├── .gitignore
│   ├── package.json
│   ├── package-lock.json
│   ├── postcss.config.js
│   ├── tailwind.config.js
│   └── README.md
│
└── backend/
    ├── cron/
    ├── generated/
    ├── middlewares/
    ├── node_modules/
    ├── prisma/
    ├── routes/
    ├── .env
    ├── .gitignore
    ├── package.json
    ├── package-lock.json
    ├── prisma.config.ts
    └── server.js
```

---

## ⚙️ Prerequisites

Make sure you have the following installed before running the project:

- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [npm](https://www.npmjs.com/)
- [Git](https://git-scm.com/)

---

## 🚀 Getting Started

### 1. Clone the Repository

**Windows (Command Prompt / PowerShell) | macOS | Linux:**
```bash
[git clone https://github.com/your-username/your-repo-name.git](https://github.com/Chandrahasa06/Ticket_Complaint_System_IDO.git)
cd Ticket_Complaint_System_IDO
```

---

> ⚠️ **Important:** The frontend and backend must be run in **two separate terminal windows** at the same time. Do not run both in the same terminal.

---

### 2. Terminal 1 — Run the Frontend

**Windows | macOS | Linux:**
```bash
cd frontend
npm install
npm run dev
```

> The frontend dev server should now be running at `http://localhost:5173` (or whichever port Vite/your framework uses).

---

### 3. Terminal 2 — Run the Backend

Open a **new/second terminal window**, then:

**Windows | macOS | Linux:**
```bash
cd backend
npm install
npx prisma generate
npx nodemon server.js
```

> The backend server should now be running at `http://localhost:3000` (or whichever port you've configured).

---

## 🔑 Environment Variables

### Frontend (`/frontend`)

Create a `.env` file inside the `frontend/` folder:

```dotenv
PORT=5173
```

### Backend (`/backend`)

Create a `.env` file inside the `backend/` folder:

```dotenv
DATABASE_URL="postgresql://<db_user>:<db_password>@<db_host>/<db_name>?sslmode=require&channel_binding=require"
JWT_SECRET="your_jwt_secret_key_here"
```
---

## 📋 Available Scripts

### Frontend (`/frontend`)

| Command         | Description                  |
|-----------------|------------------------------|
| `npm run dev`   | Start the development server |
| `npm run build` | Build for production         |

### Backend (`/backend`)

| Command                  | Description                              |
|--------------------------|------------------------------------------|
| `npx prisma generate`    | Generate Prisma client from schema       |
| `npx nodemon server.js`  | Start the backend server with auto-reload|

---

## 🛠️ Tech Stack

- **Frontend:**  React, Tailwind CSS
- **Backend:** Node.js, Express
- **ORM:** Prisma
- **Database:**  PostgreSQL, MySQL, SQLite

