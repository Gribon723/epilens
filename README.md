# EpiLens

A full-stack epidemiological analysis platform for exploring global health data from the WHO Global Health Observatory.

Registered users can explore, analyse, and save epidemiological insights: trend analysis, country comparison, correlation discovery, burden-of-disease scoring, anomaly detection, and country clustering, all backed by real WHO data.

---

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite |
| Styling | Tailwind CSS |
| Charts | Recharts + D3.js |
| Animation | Framer Motion |
| State | Zustand |
| HTTP client | Axios |
| Backend | FastAPI (Python) |
| ORM | SQLAlchemy + Alembic |
| Database | PostgreSQL |
| Auth | JWT + bcrypt |
| Stats engine | NumPy · SciPy · Pandas · scikit-learn |
| PDF export | ReportLab |
| Data source | WHO GHO OData API |
| Hosting | Vercel · Render · Supabase |

---

## Running locally

### Prerequisites
- Python 3.11+
- Node 20+
- A running PostgreSQL instance (or a free Supabase project)

### Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
pip install -r requirements.txt
cp .env.example .env         # then fill in your real values
alembic upgrade head         # creates all database tables
uvicorn app.main:app --reload
```

API docs available at http://localhost:8000/docs

### Frontend

```bash
cd frontend
npm install
cp .env.example .env.local   # then fill in VITE_API_URL
npm run dev
```

App available at http://localhost:5173

---

## Project structure

```
epilens/
├── frontend/        # React app
├── backend/         # FastAPI app
└── README.md
```

-

## Developer
Gribon Osoro, built as a portfolio project demonstrating full-stack engineering and epidemiological data analysis.
