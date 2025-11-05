🚀 A/B Testing Agent

AI-Powered Conversion Optimization as a Service (SaaS)

A full-stack, AI-driven platform for digital marketing agencies to automate, manage, and optimize A/B testing campaigns with real-time intelligence using the Thompson Sampling algorithm.

🧠 Project Purpose

To build a full-stack, AI-powered A/B Testing Platform offered as a SaaS application for digital marketing agencies.
Traditional A/B testing splits traffic 50/50, wasting budget and time. This agent dynamically reallocates traffic toward the better-performing variation in real time, achieving faster and more profitable results.

🌟 Core Features
🏢 Multi-Tenant Agency System

Full authentication system for agencies (users) to sign up, log in, and manage multiple client "Projects."

Each user’s data is isolated — agencies can only view and manage their own projects.

🧰 Secure, Project-Based Dashboard

Each agency sees only their associated projects and experiments.

Data isolation implemented at the API level for enhanced security.

🧪 Experiment Management

Full CRUD operations for A/B test management.

Example: “Blue Button” vs “Green Button”, “100kg” vs “200kg” variations.

💡 Dynamic Client-Side Agent

A single <script> tag that customers paste onto their websites.

This agent fetches the best-performing variation from the backend in real time.

📊 Real-Time Analytics Dashboard

Winner Banner: Displays top-performing variation.

Summary Cards: Shows Total Traffic, Total Conversions, and Overall Conversion Rate.

Bar Chart: Variation performance comparison.

Line Graph: Daily conversion rate trends.

Detailed Report Table: Raw experiment stats (trials, successes, conversion rates).

🛡️ Admin Dashboard

Admin-only section (secured via isAdmin: true flag in the database).

View all registered users and projects platform-wide.

📱 Responsive, Mobile-First Design

Sidebar collapses into a hamburger menu on mobile.

Built with Tailwind CSS for clean, modern, and adaptive UI.

⚙️ Technology Stack
Category	Technology	Key Libraries / Tools
Frontend	React	Vite, React Router, Tailwind CSS, Chart.js, Heroicons, Axios
Backend	Node.js	Express, Mongoose, JWT, bcryptjs, jStat (ML), cors, helmet, morgan
Database	NoSQL	MongoDB Atlas
Deployment / CI-CD	Git, GitHub	Render (Backend), Vercel (Frontend)
🧮 ML / AI Component — The "Brain"

Goal: Implement a Multi-Armed Bandit (MAB) algorithm to power intelligent traffic allocation.

Algorithm: Thompson Sampling
Implementation Steps:

Initially implemented as a Python microservice using FastAPI and NumPy (np.random.beta).

Diagnosed a 429 Too Many Requests issue between Render microservices.

Pivoted to JavaScript: Rewrote ML logic in Node.js using jStat.beta.sample.

Fully integrated Thompson Sampling into the backend for real-time decision-making.

Result:
The platform can make data-driven allocation decisions without needing separate ML services.

🧩 Backend — The "Manager"
🗃️ Database Design

Created 4 Mongoose Schemas:

User: Agency accounts and admin role flag.

Project: Client-level containers for experiments.

Experiment: Stores variations, conversions, and statistics.

DailyStat: Logs daily conversion rate trends for graphing.

🔐 Security & API

JWT-based authentication and authorization.

Password hashing using bcryptjs (one-way encryption).

Middleware authMiddleware.js ensures data isolation by user ID.

Secure REST API architecture using Express.js.

⚙️ Business Logic

The experimentController.js:

Receives experiment requests from the client <script> tag.

Runs the Thompson Sampling (jStat) function to decide variation.

Updates:

Experiment stats: Trials, successes.

Daily stats: For trend visualization.

Returns variation data to the browser for rendering.

👑 Admin Panel

Added isAdmin flag to User schema.

adminController.js + adminRoutes.js handle secure admin-only routes.

Admins can view all users and projects across the platform.

💻 Frontend — The "Dashboard"
⚙️ Framework & Styling

Built with React + Vite for lightning-fast development.

Styled entirely with Tailwind CSS for a modern, responsive look.

🔐 State & Routing

Global auth state via React Context API (AuthContext.jsx).

Routing powered by React Router:

Public pages: Login, Signup.

Protected routes: Dashboard, Projects, Experiments.

Admin-only routes: Admin Panel.

📊 Data Visualization

Built with Chart.js:

Bar Chart: Variation Performance.

Line Graph: Performance Over Time.

Summary Cards: Key metrics.

Winner Banner: Highlights top variation.

Setup Page: Dynamic auto-generated code snippet for customers.

🚀 Deployment & Debugging
🧭 Version Control

Full Git repository with commits for each milestone.

Hosted on GitHub for CI/CD integration.

🌐 Backend Deployment (Render)

Hosted Node.js backend on Render.

Configured environment variables:

MONGODB_URI

JWT_SECRET

Debugged and resolved “spin-down” & 429 rate limit issues.

💻 Frontend Deployment (Vercel)

Initially deployed to Netlify, later migrated to Vercel for reliability and speed.

Integrated continuous deployment from GitHub.

🔧 CORS Debugging

Fixed major CORS issues by dynamically whitelisting allowed origins (Vercel + localhost) in backend/index.js.

🧪 Local Testing

Simulated client websites using local static servers (serve / python3 -m http.server).

Tested the full request flow of the client <script> to backend and back.

🗺️ Folder Structure (Simplified)
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

🔮 Future Roadmap

💳 Subscription Management: Integrate Stripe for Pro/Enterprise billing.

🔑 Forgot Password Workflow: Secure email-based reset (SendGrid/Nodemailer).

⏸️ Experiment Controls: Pause/End test manually.

🌍 Custom Domain Mapping: Enable agency-specific subdomains.

📈 Enhanced Analytics: Add deeper conversion funnel metrics.

🧑‍💻 Author

Name: [Bhanu Mahesh B]
GitHub: [Your GitHub Link]
Live Demo: https://ab-agent-project.vercel.app

✅ This project demonstrates the ability to design, develop, secure, and deploy a full-stack AI-powered SaaS platform integrating ML, analytics, and user management in production.




