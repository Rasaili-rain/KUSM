# KU Smart Meter Monitoring and Analytics System (KUSM)
*the original codebase is located at https://github.com/Lobic23/KUSM-fend and https://github.com/Lobic23/KUSM-backend




A full-stack real-time Smart Meter Monitoring and Analytics platform developed for Kathmandu University.

This system integrates IoT smart meter APIs, real-time data visualization, billing analytics, and machine learning-based energy forecasting into a unified, scalable platform.


The KU Smart Meter Monitoring and Analytics System enables:

* Real-time smart meter data collection
* Voltage and current analysis
* Billing and cost computation
* Interactive campus energy map
* Machine learning-based power forecasting
* Role-based authentication (Admin / Super Admin)
* Automated meter down email alerts

The system is built with:

* Backend: FastAPI + PostgreSQL
* Frontend: React (Vite + TypeScript)
* ML Model: Random Forest Regression
* Scheduler: Background data collection jobs
* Authentication: JWT-based role access control


# Backend 
## Tech Stack

* FastAPI
* PostgreSQL
* SQLAlchemy
* JWT Authentication
* Random Forest (scikit-learn)
* SMTP Email Alerts
* Scheduler for periodic data collection

## Key Features

* IAMMETER API integration
* Automated data collection
* Meter status monitoring
* Billing calculation engine
* ML-based power prediction
* Admin & Super Admin management
* Email alerts for inactive meters


## Backend Setup

### 1. Install dependencies

Using uv (recommended):

```
cd bkend
uv sync
```


### 2. Configure Environment Variables

Create a `.env` file inside `bkend/`:
and populate according to .env.example

---

### 3. Run Database Migration

```
uv run migrate.py
```

---

### 4. Create Initial SuperAdmin

```
uv run bootstrap.py
```

---

### 5. Start Backend Server

```
uv run main.py
```

Server runs at:

```
http://localhost:8000
```


# Frontend 

## Tech Stack

* React
* TypeScript
* Vite
* Zustand (state management)
* Chart visualizations
* Role-based route protection

---

## Features

* Real-time dashboard
* Voltage & current analysis
* Billing analytics
* Prediction interface
* Campus energy map
* Meter detail views
* Admin dashboard
* Super Admin dashboard



## Frontend Setup

### 1. Install dependencies

Using Bun:

```
cd fend
bun install
```

Or using npm:

```
npm install
```

---

### 2. Start Development Server

```
bun dev
```

Or:

```
npm run dev
```

Frontend runs at:

```
http://localhost:5173
```

---

# Machine Learning Model

Model: Random Forest Regression

Features used:

* Hour of day
* Day of week
* Month
* Historical lag features

Performance:

* MAE: 13.26 kW
* RMSE: 19.65 kW
* R² Score: 0.6777

Model file:

```
bkend/data/power_model.pkl
```

To retrain:

```
python src/train_model.py
```

---

# System Architecture

Smart Meter → IAMMETER API → FastAPI Backend → PostgreSQL
Frontend Dashboard ← REST API ← Backend
ML Model integrated within backend
SMTP Email alerts for meter downtime

---

# User Roles

### Unauthenticated User

* View dashboard
* View analytics
* View prediction

### Admin

* Manage meters
* Enable/disable data collection
* View alerts
* Monitor status

### Super Admin

* Manage users
* Promote/demote admins
* Delete accounts

---

# Documentation

Located in `/docs`:

* Proposal
* Final Report
* Conference Slides
* Semester Defense Slides

---

# Future Improvements

* Real-time anomaly detection
* Mobile app support
* Advanced deep learning forecasting
* Energy optimization recommendations
* Push notification system

---

# License

This project was developed as part of COMP 303
Kathmandu University
Department of Computer Science and Engineering

---

