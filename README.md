🚀 A/B Testing Agent

An AI-powered A/B Testing SaaS platform designed for digital marketing agencies to maximize conversions intelligently.

This platform goes beyond traditional 50/50 split testing by using a Multi-Armed Bandit (Thompson Sampling) algorithm to dynamically allocate more traffic to the best-performing variation — minimizing wasted ad spend and maximizing ROI.

🌐 Live Demo: https://tangerine-lily-5aaf71.netlify.app

✨ Features
🧠 Intelligent A/B Testing

Uses Thompson Sampling (via jStat) for adaptive variation selection.

Continuously learns from live data to prioritize winning variants in real-time.

🧩 Multi-Tenant Architecture

Agencies can manage multiple clients/projects within one secure account.

Each project is fully isolated using a tenant-aware data model.

📊 Real-Time Analytics Dashboard

"Winner" banner for top-performing variation.

Summary cards for Total Traffic, Conversions, and Conversion Rate.

Bar chart for comparing conversion rates.

Line chart to visualize performance trends over time.

Detailed report table for raw experiment data.

🔐 Authentication & Security

User registration and login with JWT-based stateless authentication.

Password encryption with bcrypt.

Admin-only dashboard to manage all users and projects.

💡 Simple Client Integration

Clients can install the testing agent by adding a single <script> tag:

<script async src="https://backend-service-url.com/agent.js" data-exp-id="YOUR_EXPERIMENT_ID"></script>


The agent.js script automatically handles variation assignment, tracking, and data sync with the backend.

🏗️ Architecture & Tech Stack
Frontend (Dashboard)

Framework: React

Styling: Tailwind CSS

Routing: React Router

Charts: Chart.js

Deployment: Netlify

Backend (API & Logic Layer)

Framework: Node.js & Express

Database: MongoDB Atlas (via Mongoose)

Authentication: JWT & bcrypt

Algorithm: Thompson Sampling implemented using jStat

Deployment: Render

Agent (Client Script)

Lightweight vanilla JavaScript file served by the backend.

Communicates with the API to fetch variations and send conversion data.

⚙️ Getting Started (Local Setup)

Follow these steps to run the project locally.

1️⃣ Prerequisites

Make sure you have:

Node.js (v18+)

npm

A MongoDB Atlas account (or local MongoDB server)

2️⃣ Backend Setup
# 1. Go to the backend folder
cd backend

# 2. Install dependencies
npm install

# 3. Create an .env file in the backend folder (refer to .env.example)
# Required environment variables:
# MONGODB_URI=your_mongodb_connection_string
# JWT_SECRET=your_secret_key

# 4. Start the backend server
npm run dev

3️⃣ Frontend Setup
# 1. Go to the frontend folder
cd frontend

# 2. Install dependencies
npm install

# 3. Run the development server
npm run dev

4️⃣ Access the App

Once both servers are running:

Frontend: http://localhost:5173 (default Vite port)

Backend: http://localhost:5000 (or the port set in your .env)

🧮 Algorithm Overview — Thompson Sampling

The Thompson Sampling algorithm dynamically balances exploration and exploitation.
Each time a visitor arrives:

A random beta distribution sample is drawn for each variation.

The variation with the highest sample value is displayed.

Conversion results are fed back to update the beta parameters.

Over time, the algorithm converges to the best-performing variation.

🧑‍💼 Admin Features

View all registered users and projects.

Monitor performance across multiple agencies.

Manage authentication and data securely.

🚀 Deployment

Frontend: Deployed via Netlify

Backend: Hosted on Render

Database: MongoDB Atlas (Cloud Database)

🧰 Tech Summary
Layer	Technology
Frontend	React, Tailwind CSS, Chart.js
Backend	Node.js, Express, jStat
Database	MongoDB Atlas
Auth	JWT, bcrypt
Deployment	Netlify, Render
AI/ML	Thompson Sampling
📄 License

This project is released under the MIT License — free to use, modify, and distribute.

👨‍💻 Author

Bhanu Mahesh
Machine Learning & AI |Full-Stack Developer | Data Science & AI | NLP & ML Engineer | 
📧 Contact

🌐 Portfolio/LinkedIn
https://www.linkedin.com/in/bhanu-mahesh-bathula-559275256/
