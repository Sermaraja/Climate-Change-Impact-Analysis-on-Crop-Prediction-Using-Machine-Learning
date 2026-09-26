# Climate Change Impact Analysis on Crop Prediction Using Machine Learning

**MSc Final-Year Project Monorepo**

An intelligent decision-support application assessing extreme rainfall severity, waterlogging likelihood, crop stage damage risk, survival probability, and post-rain recovery recommendations for active agricultural plots.

---

## 🏗️ Project Architecture & Structure

```text
climate-crop-impact/
├── frontend/             # React + TypeScript + Vite + Tailwind CSS + Leaflet + Recharts
├── backend/              # FastAPI + SQLAlchemy + Pydantic + Clean Architecture
├── ml/                   # Machine Learning Models, Training Scripts & Feature Encoders
├── docs/                 # Project Documentation, viva diagrams & schemas
├── data/                 # Sample climate, soil, and crop physiological datasets
├── .env.example          # Root environment variable template
├── .gitignore            # Git ignore definitions
└── README.md             # Project documentation & local startup instructions
```

---

## 📋 Prerequisites

Before running the application, ensure the following are installed:

1. **Node.js**: v18.0.0 or higher (v22.x recommended)
2. **Python**: v3.10 or higher (v3.13 tested)
3. **PostgreSQL / PostGIS** (Optional for Stage 1 foundation; required for future PostGIS spatial queries)

---

## 🚀 Quick Startup Instructions

### 1. Backend Setup (FastAPI)

Navigate to the `backend` directory, create a virtual environment, install requirements, and run Uvicorn:

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows (PowerShell):
.\venv\Scripts\Activate.ps1
# Linux/macOS:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start FastAPI development server
uvicorn app.main:app --reload --port 8000
```

The backend server will start at `http://localhost:8000`.  
- **Health Check Endpoint**: `http://localhost:8000/api/health`
- **Interactive Swagger Docs**: `http://localhost:8000/docs`

---

## 2. Frontend Setup (React + Vite + TypeScript)

In a separate terminal, navigate to the `frontend` directory:

```bash
cd frontend

# Install node dependencies
npm install

# Start Vite development server
npm run dev
```

The frontend application will be available at `http://localhost:5173`.

---

## 🧪 Stage 1 Verification Endpoints

- **Frontend Application**: `http://localhost:5173/`
- **Backend API Health**: `http://localhost:8000/api/health`

### Expected Health Response:
```json
{
  "status": "healthy",
  "application": "Climate Change Impact Analysis on Crop Prediction Using Machine Learning"
}
```

---

## 🔒 Data Integrity & Risk Level Standard

- **Internal Risk Classifications**: `LOW`, `MODERATE`, `HIGH`, `EXTREME`
- **Soil Source Provenance**: `LAB_VERIFIED`, `FARMER_VERIFIED`, `ESTIMATED` (Verified sources take priority in calculations).
- **Weather Source**: Open-Meteo (Free & open API integration).
