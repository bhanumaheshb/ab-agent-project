# 🚀 A/B Testing Agent

### AI-Powered Conversion Optimization as a Service (SaaS)

An **AI-driven, full-stack A/B testing platform** for digital marketing agencies to automate, manage, and optimize experiments using **real-time intelligence** powered by the **Thompson Sampling** algorithm.

---

## 🧠 Project Purpose

To build a full-stack, AI-powered **A/B Testing SaaS Platform** for digital marketing agencies.

Traditional A/B testing splits traffic 50/50, wasting time and budget.
This system **dynamically reallocates traffic** toward the better-performing variation in real time, achieving **faster and more profitable results**.

---

## 🌟 Core Features

### 🏢 Multi-Tenant Agency System

* User authentication (signup/login).
* Agencies can manage multiple client **Projects**.
* **Strict data isolation** — users can only access their own data.

### 🧰 Secure Project-Based Dashboard

* Each agency sees only its own projects and experiments.
* Data isolation enforced at the API level.

### 🧪 Experiment Management

* Full CRUD operations for experiments.
* Example variations:

  * “Blue Button” vs “Green Button”
  * “100kg” vs “200kg”

### 💡 Dynamic Client-Side Agent

* A single `<script>` tag pasted into client websites.
* Fetches best-performing variation from backend in real time.

### 📊 Real-Time Analytics Dashboard

* **Winner Banner** – Top-performing variation.
* **Summary Cards** – Total Traffic, Conversions, Conversion Rate.
* **Bar Chart** – Variation performance comparison.
* **Line Graph** – Daily conversion trends.
* **Detailed Table** – Raw experiment stats.

### 🛡️ Admin Dashboard

* Admin-only section using `isAdmin: true`.
* View all users and projects platform-wide.

### 📱 Responsive, Mobile-First UI

* Sidebar collapses into hamburger menu.
* Built with Tailwind CSS.

---

## ⚙️ Technology Stack

| Category   | Technology | Libraries / Tools                                             |
| ---------- | ---------- | ------------------------------------------------------------- |
| Frontend   | React      | Vite, React Router, Tailwind CSS, Chart.js, Heroicons, Axios  |
| Backend    | Node.js    | Express, Mongoose, JWT, bcryptjs, jStat, cors, helmet, morgan |
| Database   | NoSQL      | MongoDB Atlas                                                 |
| Deployment | CI/CD      | Git, GitHub, Render (Backend), Vercel (Frontend)              |

---

## 🧮 ML / AI Component — The Brain

**Goal:** Intelligent traffic allocation using a Multi-Armed Bandit (MAB) algorithm.

**Algorithm:** Thompson Sampling

### Evolution:

* Initially built as Python microservice (FastAPI + NumPy).
* Faced `429 Too Many Requests` between microservices.
* Migrated ML logic into Node.js using `jStat.beta.sample`.

### Result:

* Fully integrated ML logic inside backend.
* Real-time data-driven decision-making.

---

## 🧩 Backend — The Manager

### 🗃️ Database Schemas

* **User** – Agency accounts + admin role.
* **Project** – Client containers.
* **Experiment** – Variations, trials, successes.
* **DailyStat** – Trend tracking for graphs.

### 🔐 Security

* JWT authentication & authorization.
* Password hashing with bcryptjs.
* Middleware ensures user-level data isolation.

### ⚙️ Business Logic

`experimentController.js`:

* Receives requests from client `<script>`.
* Runs Thompson Sampling decision logic.
* Updates:

  * Experiment stats.
  * Daily stats.
* Returns best variation.

### 👑 Admin Panel

* Controlled using `isAdmin` flag.
* Admin can view all users and projects.

---

## 💻 Frontend — The Dashboard

### ⚙️ Framework & Styling

* React + Vite.
* Tailwind CSS.

### 🔐 State & Routing

* Global auth using Context API.
* Routes:

  * Public: Login, Signup
  * Protected: Dashboard, Projects, Experiments
  * Admin-only: Admin Panel

### 📊 Visualization

* Chart.js:

  * Bar chart (variation performance)
  * Line chart (daily trends)
* Winner banner
* Summary cards
* Dynamic setup code snippet for clients

---

## 🚀 Deployment & Debugging

### 🧭 Version Control

* Full GitHub repo with milestone commits.

### 🌐 Backend (Render)

* Env variables:

  * `MONGODB_URI`
  * `JWT_SECRET`
* Fixed spin-down & 429 errors.

### 💻 Frontend (Vercel)

* Continuous deployment from GitHub.

### 🔧 CORS Fix

* Dynamic origin whitelisting (Vercel + localhost).

### 🧪 Local Testing

* Simulated client sites using:

  * `serve`
  * `python3 -m http.server`
* Verified full request flow.

---

## 🗺️ Folder Structure

```
A-B-Testing-Agent/
│
├── backend/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── utils/
│   ├── index.js
│   └── app.js
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── context/
│   │   ├── services/
│   │   └── App.jsx
│   └── vite.config.js
│
└── agent/
    └── agent.js
```

---

## 🔮 Future Roadmap

* 💳 Stripe Subscription Billing
* 🔑 Forgot Password Workflow
* ⏸️ Pause / End Experiments
* 🌍 Custom Domain Mapping
* 📈 Funnel Analytics

---

## 🧑‍💻 Author

**Name:** Bhanu Mahesh B
**GitHub:** *(Add your GitHub link here)*
**Live Demo:** [https://ab-agent-project.vercel.app](https://ab-agent-project.vercel.app)

---

## ✅ Conclusion

This project demonstrates the ability to:

* Design scalable SaaS architecture
* Implement machine learning in production
* Build secure multi-tenant systems
* Develop full-stack dashboards
* Deploy real-world applications

