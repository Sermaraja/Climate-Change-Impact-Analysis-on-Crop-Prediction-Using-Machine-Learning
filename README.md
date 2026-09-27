# Climate Change Impact Analysis on Crop Prediction Using Machine Learning

[![Frontend Deployment](https://img.shields.io/badge/Frontend-Vercel-success?style=flat&logo=vercel)](https://cropclimate.vercel.app)
[![Backend API](https://img.shields.io/badge/Backend-Render-blue?style=flat&logo=fastapi)](https://cropclimate-ai-backend.onrender.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Python 3.10+](https://img.shields.io/badge/Python-3.10%2B-blue.svg?logo=python)](https://www.python.org/)
[![Node.js 18+](https://img.shields.io/badge/Node.js-18%2B-green.svg?logo=node.js)](https://nodejs.org/)

An intelligent agronomic decision-support platform designed to assess extreme rainfall severity, waterlogging likelihood, crop growth-stage damage, survival probability, and localized post-rain recovery protocols for agricultural plots.

---

## 🌐 Live Production Links

- **Web Application**: [https://cropclimate.vercel.app](https://cropclimate.vercel.app)
- **Backend API**: [https://cropclimate-ai-backend.onrender.com](https://cropclimate-ai-backend.onrender.com)
- **Interactive API Swagger Docs**: [https://cropclimate-ai-backend.onrender.com/docs](https://cropclimate-ai-backend.onrender.com/docs)
- **API Health Check**: [https://cropclimate-ai-backend.onrender.com/api/health](https://cropclimate-ai-backend.onrender.com/api/health)

---

## 🏗️ Project Architecture & Structure

```text
climate-crop-impact/
├── frontend/             # React 19 + TypeScript + Vite + Tailwind CSS v4 + Leaflet + Recharts
│   ├── src/
│   │   ├── components/   # Modular UI, Farm GIS Map, Risk Visualizers, Layout
│   │   ├── context/      # AuthContext, LanguageContext (EN / TA)
│   │   ├── i18n/         # Full English & Tamil locale dictionaries
│   │   ├── pages/        # LandingPage, Dashboard, Farms, Risk Assessment, History, Reports
│   │   └── services/     # Axios API integrations
├── backend/              # FastAPI + SQLAlchemy + PostGIS + Scikit-Learn
│   ├── app/
│   │   ├── api/          # Auth, Farms, Weather, Predictions, Reports routes
│   │   ├── models/       # SQLAlchemy ORM models (Users, Farms, Predictions, Audit)
│   │   ├── schemas/      # Pydantic v2 validation contracts
│   │   ├── services/     # Weather engine, Crop impact scanner, Soil analyzer
│   │   └── main.py       # FastAPI application entrypoint & CORS middleware
├── ml/                   # ML Models (.joblib), Training Scripts & Encoders
├── docs/                 # Architecture, API specifications, and QA reports
├── data/                 # Sample climate, soil, and crop physiological datasets
├── .env.example          # Environment variable template
└── README.md             # Project documentation & local setup instructions
```

---

## 📋 Prerequisites & System Requirements

Before cloning and running the project locally, ensure you have the following installed:

| Requirement | Minimum Version | Recommended Version | Purpose |
| :--- | :--- | :--- | :--- |
| **Git** | `v2.30+` | Latest | Source control & cloning |
| **Node.js** | `v18.0.0+` | `v22.x LTS` | Frontend runtime environment |
| **npm** | `v9.0.0+` | `v10.x+` | Frontend package manager |
| **Python** | `v3.10` | `v3.11` / `v3.12` / `v3.13` | Backend REST API & ML inference engine |
| **PostgreSQL** | `v14+` | `v16+` with PostGIS | Production geospatial relational database (or SQLite for local dev) |
| **pip** | `v23.0+` | Latest | Python package installer |

---

## 📦 Required Packages & Dependencies

### Backend Packages (`backend/requirements.txt`)

| Package | Minimum Version | Functionality |
| :--- | :--- | :--- |
| `fastapi` | `>=0.110.0` | Modern, high-performance async web framework for building APIs |
| `uvicorn[standard]` | `>=0.28.0` | Lightning-fast ASGI server implementation |
| `pydantic` | `>=2.6.0` | Data parsing, serialization, and strict schema validation |
| `pydantic-settings` | `>=2.2.0` | Environment settings management via `.env` |
| `email-validator` | `>=2.1.0` | Robust email address validation for authentication |
| `sqlalchemy` | `>=2.0.28` | Python SQL toolkit and Object-Relational Mapper (ORM) |
| `alembic` | `>=1.13.1` | Database schema migrations management |
| `psycopg[binary]` | `>=3.1.18` | Next-generation PostgreSQL database adapter |
| `psycopg2-binary` | `>=2.9.9` | PostgreSQL driver compatibility layer |
| `geoalchemy2` | `>=0.14.0` | PostGIS spatial extensions for SQLAlchemy |
| `shapely` | `>=2.0.0` | Manipulation and analysis of geometric spatial shapes |
| `pyjwt` | `>=2.8.0` | JSON Web Token (JWT) encode and decode for auth sessions |
| `bcrypt` | `>=4.1.0` | Modern cryptographic password hashing |
| `passlib[bcrypt]` | `>=1.7.4` | Password hashing context and verification utilities |
| `python-dotenv` | `>=1.0.1` | Reads key-value pairs from `.env` files |
| `requests` | `>=2.31.0` | Synchronous HTTP client |
| `httpx` | `>=0.27.0` | High-performance async HTTP client for external weather APIs |
| `pandas` | `>=2.2.1` | Powerful data manipulation and analysis structures |
| `numpy` | `>=1.26.4` | Scientific computing and multi-dimensional array operations |
| `scikit-learn` | `>=1.4.1` | Machine learning classification, regression, and pipelines |
| `joblib` | `>=1.3.2` | Efficient serialization of trained ML model pipelines |

### Frontend Packages (`frontend/package.json`)

| Package | Version | Functionality |
| :--- | :--- | :--- |
| `react` & `react-dom` | `^19.2.8` | Core UI library for reactive component trees |
| `vite` | `^8.3.0` | Ultra-fast frontend build tooling and local dev server |
| `typescript` | `~6.0.2` | Comprehensive static typing and compile-time verification |
| `@tanstack/react-query`| `^5.104.0` | Async server-state management, automated cache invalidation |
| `react-router-dom` | `^7.18.4` | Client-side routing and protected navigation |
| `tailwindcss` | `^4.3.3` | Next-gen utility-first CSS styling engine |
| `@tailwindcss/vite` | `^4.3.3` | Native Vite integration plugin for Tailwind CSS |
| `leaflet` & `react-leaflet`| `^1.9.4` / `^5.0.0` | Interactive maps, polygon layers, and satellite overlays |
| `lucide-react` | `^1.48.0` | Modern, consistent SVG iconography |
| `recharts` | `^3.10.1` | Responsive chart rendering (bar, radar, area, line) |
| `i18next` & `react-i18next`| `^26.4.2` / `^17.0.15` | Internationalization engine supporting English & 100% Tamil |
| `react-hook-form` | `^7.89.0` | Performant form state management without re-rendering |
| `zod` & `@hookform/resolvers`| `^4.6.5` / `^5.9.1` | TypeScript-first schema declaration and form validation |
| `axios` | `^1.20.0` | Promise-based HTTP client for API communication |

---

## 🚀 Step-by-Step Installation & Local Setup

### 1. Clone the Repository

```bash
git clone https://github.com/Sermaraja/Climate-Change-Impact-Analysis-on-Crop-Prediction-Using-Machine-Learning.git
cd Climate-Change-Impact-Analysis-on-Crop-Prediction-Using-Machine-Learning
```

---

### 2. Backend Setup (FastAPI & Python)

1. Open a terminal and navigate to `backend/`:
   ```bash
   cd backend
   ```

2. Create and activate a Python virtual environment:
   - **Windows (PowerShell)**:
     ```powershell
     python -m venv venv
     .\venv\Scripts\Activate.ps1
     ```
   - **Linux / macOS**:
     ```bash
     python3 -m venv venv
     source venv/bin/activate
     ```

3. Upgrade `pip` and install all required packages:
   ```bash
   pip install --upgrade pip
   pip install -r requirements.txt
   ```

4. Configure Environment Variables:
   Create a `.env` file inside `backend/` (or copy from `.env.example`):
   ```env
   DATABASE_URL=sqlite:///./sql_app.db
   # For PostgreSQL: postgresql://username:password@localhost:5432/crop_climate_db
   SECRET_KEY=your-super-secure-jwt-secret-key-32-chars-minimum
   ALGORITHM=HS256
   ACCESS_TOKEN_EXPIRE_MINUTES=1440
   ENVIRONMENT=development
   ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
   ```

5. Run database migrations & seed initial demo data:
   ```bash
   # Run Alembic migrations (creates tables)
   alembic upgrade head

   # Seed default crops, physiological profiles & demo accounts
   python -m app.seed_demo
   ```

6. Start the FastAPI development server:
   ```bash
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```
   - API will be accessible at: `http://localhost:8000`
   - Interactive Swagger documentation: `http://localhost:8000/docs`

---

### 3. Frontend Setup (React, Vite & TypeScript)

1. Open a **new terminal** and navigate to `frontend/`:
   ```bash
   cd frontend
   ```

2. Install all Node.js dependencies:
   ```bash
   npm install
   ```

3. Configure Frontend Environment Variables:
   Create a `.env` file inside `frontend/`:
   ```env
   VITE_API_BASE_URL=http://localhost:8000/api
   ```
   *(For testing against the live cloud backend, use `VITE_API_BASE_URL=https://cropclimate-ai-backend.onrender.com/api`)*

4. Start the Vite development server:
   ```bash
   npm run dev
   ```
   The application will launch at `http://localhost:5173`.

---

## 👥 Demo User Accounts (Pre-configured)

For evaluation and demonstration purposes, the database includes pre-configured demo farmer and research accounts:

| User Name | Email | Password | Primary Location | Pre-Configured Farms |
| :--- | :--- | :--- | :--- | :--- |
| **Veeramani** | `veeramani@gmail.com` | `123456789` | Madurai, Tamil Nadu | 4 Farms (Vaigai Paddy, Green Field Banana, South Groundnut, Marutham Chilli) |
| **Manikandan** | `manikandan@gmail.com` | `123456789` | Theni, Tamil Nadu | 2 Farms (Theni Banana, Western Farm) |
| **Dr. Swaminathan** | `swaminathan@agri.edu` | `123456789` | Thanjavur, Tamil Nadu | Cauvery Delta Research Station (Paddy) |

---

## 🌍 Multilingual Support (English & 100% Tamil)

The platform features complete bilingual localization:
- **English**: Standard international agronomic nomenclature.
- **தமிழ் (Tamil)**: Native agricultural terminology tailored for farmers in Tamil Nadu (e.g., பயிர் வகை, அதிக மழை தீவிர எச்சரிக்கை, வடிகால் மேலாண்மை, மண்ணின் ஈரப்பதம்).
- Seamless instant language toggling across Landing Page, Dashboard, Farm Management, and Scientific Reports without page reloads.

---

## 🛡️ Core Capabilities

- **Rainfall Severity Index**: Real-time integration with Open-Meteo API assessing 72-hour precipitation volume against historical thresholds.
- **Waterlogging Risk Engine**: PostGIS spatial slope analysis combined with soil percolation coefficients (Clay, Loam, Sandy).
- **Crop Stage Sensitivity**: Matrix evaluating physiological damage risk across critical growth stages (Vegetative, Flowering, Grain Filling, Maturity).
- **Post-Rain Recovery Pipeline**: Actionable, phased recovery protocols (foliar nutrition, anti-fungal application, sub-surface drainage).
- **Audit History**: Cryptographically verifiable timestamped audit trail of all historical assessments.

---

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.
