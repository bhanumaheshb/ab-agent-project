# AB_AI_AGENT Startup Guide

To run this project, you must start all three services in separate terminals.

---

### ## Terminal 1: ML-Service (The "Brain")

`cd ml-service`
`source venv/bin/activate`
`uvicorn ml:app --reload`

---

### ## Terminal 2: Backend (The "Manager")

`cd backend`
`npm run dev`

---

### ## Terminal 3: Frontend (The "Dashboard")

`cd frontend`
`npm run dev`