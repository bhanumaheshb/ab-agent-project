# A/B Testing Agent 🚀

A full-stack, AI-powered A/B testing platform built as a SaaS (Software as a Service) application for digital marketing agencies.

This platform goes beyond traditional 50/50 split testing by using a **Multi-Armed Bandit (Thompson Sampling) algorithm**. This allows the agent to dynamically allocate more traffic to the "winning" variation in real-time, minimizing wasted ad spend and maximizing conversions for clients.

**Live Demo URL:** `https://tangerine-lily-5aaf71.netlify.app`

---

## ✨ Core Features

* **Multi-Tenant Agency Dashboard:** Agencies can sign up for an account and manage multiple clients, each as a separate, secure "Project".
* **Dynamic A/B Testing:** Uses a Thompson Sampling algorithm (via `jstat`) to intelligently decide which variation to show.
* **Real-time Analytics:** A rich dashboard for each experiment, showing:
    * A "Winner" banner for the best-performing variation.
    * Side-by-side summary cards for Total Traffic, Total Conversions, and Overall Rate.
    * A bar chart for visual comparison of conversion rates.
    * A line graph to track "Performance Over Time."
    * A detailed report table with raw numbers.
* **Secure Authentication:** Full user signup, login, and stateless authentication using JSON Web Tokens (JWT).
* **Admin Dashboard:** A private, admin-only section to view all registered users and projects in the system.
* **Simple Client-Side Setup:** Customers just copy/paste a single `<script>` tag to install the agent on their website.

---

## 🏗️ Architecture & Tech Stack

This project is built with a modern microservice-inspired architecture, deployed on a blazing-fast, serverless infrastructure.

* **Frontend (Dashboard):**
    * **Framework:** React
    * **Styling:** Tailwind CSS
    * **Routing:** React Router
    * **Charts:** Chart.js
    * **Deployment:** Netlify

* **Backend (API & "Brain"):**
    * **Framework:** Node.js & Express
    * **Database:** MongoDB Atlas (using Mongoose)
    * **Authentication:** JSON Web Tokens (JWT) & bcrypt
    * **AI/ML:** Thompson Sampling logic implemented in JavaScript using **jStat**.
    * **Deployment:** Render

* **Agent (`agent.js`):**
    * A lightweight, vanilla JavaScript file served by the backend. It runs on the end-user's site, communicates with the API, and performs dynamic content changes.

---

## ⚙️ Getting Started

To run this project on your local machine, you will need to run all three services in separate terminals.

### 1. Prerequisites

* Node.js (v18+)
* npm
* A MongoDB Atlas account (or local MongoDB server)

### 2. Backend Setup

The backend server handles all API logic, authentication, and database connections.

```bash
# 1. Go to the backend folder
cd backend

# 2. Install dependencies
npm install

# 3. Create a .env file in the /backend folder
#    (See .env.example)
#    You must add your MONGODB_URI and JWT_SECRET
touch .env

# 4. Run the server
npm run dev
