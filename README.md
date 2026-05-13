# EpiLens

A full-stack epidemiological analysis platform for exploring global health data from the WHO Global Health Observatory. Registered users can explore, analyse, and save insights across six analysis modules — all backed by real WHO data, with no Python or data-science tooling required.

**Live app:** [epilens.vercel.app](https://epilens.vercel.app) &nbsp;|&nbsp; **API docs:** [epilens-api.onrender.com/docs](https://epilens-api.onrender.com/docs)

---

## Features

| Module | What it does |
|---|---|
| **Explorer** | Pick any of 2 000+ WHO indicators, select countries, run trend analysis with a 5-year linear projection |
| **Compare** | Plot multiple countries on a single chart; includes a stats table and burden-of-disease index |
| **Correlate** | Find Pearson and Spearman correlation between two indicators across 194 countries |
| **Cluster** | Group countries by epidemiological similarity using K-Means (2-8 clusters, interactive D3 world map) |
| **Anomaly detection** | Flag years that deviate significantly from a rolling 5-year baseline |
| **Dashboard** | Save and revisit any analysis with a title and description |

---

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | React 19 + Vite 8 |
| Styling | Tailwind CSS v4 |
| Charts | Recharts v3 + D3.js v7 |
| Animation | Framer Motion v12 |
| State | Zustand v5 |
| HTTP client | Axios |
| Backend | FastAPI (Python 3.11) |
| ORM | SQLAlchemy + Alembic |
| Database | SQLite (dev) · PostgreSQL via Supabase (prod) |
| Auth | JWT (python-jose) + bcrypt (passlib) |
| Stats engine | NumPy · SciPy · Pandas · scikit-learn |
| Data source | WHO GHO OData v2 API |
| Hosting | Vercel (frontend) · Render (backend) · Supabase (database) |

---

## Running locally

### Prerequisites

- Python 3.11+
- Node 20+

### Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # macOS / Linux
pip install -r requirements.txt
cp .env.example .env         # edit .env: set SECRET_KEY to any 32+ char string
alembic upgrade head         # creates the SQLite database and all tables
uvicorn app.main:app --reload
```

API docs: http://localhost:8000/docs

### Frontend

```bash
cd frontend
npm install
cp .env.example .env.local   # VITE_API_URL=http://localhost:8000
npm run dev
```

App: http://localhost:5173

---

## Project structure

```
epilens/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   └── routes/      # auth, indicators, stats, analyses, export
│   │   ├── core/            # config, database, security
│   │   ├── models/          # SQLAlchemy ORM models
│   │   ├── schemas/         # Pydantic request/response schemas
│   │   └── services/        # WHO client, stats engine, PDF generator
│   ├── alembic/             # database migrations
│   ├── tests/
│   ├── requirements.txt
│   └── .env.example
└── frontend/
    ├── src/
    │   ├── api/             # Axios wrappers (auth, indicators, stats, analyses)
    │   ├── components/      # charts/, ui/, AppLayout, Sidebar
    │   ├── hooks/           # useAuth, useIndicators, useAnalysis, useDebounce
    │   ├── pages/           # Landing, Login, Register, Dashboard, Explorer, Compare, Correlate, Cluster
    │   └── store/           # Zustand auth store
    ├── public/
    └── .env.example
```

---

## Deploying your own instance

### 1 — Supabase (database)

1. Create a free project at [supabase.com](https://supabase.com)
2. From **Settings → Database**, copy the **Connection string (URI)** — it looks like `postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres`
3. In `backend/.env`, set `DATABASE_URL=<your connection string>`
4. Run `alembic upgrade head` to create all tables in Supabase

### 2 — Render (backend API)

1. Create a new **Web Service** at [render.com](https://render.com), connect this repository
2. Set **Root Directory** to `backend`
3. **Build command:** `pip install -r requirements.txt`
4. **Start command:** `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
5. Add environment variables: `DATABASE_URL`, `SECRET_KEY`, `ALGORITHM=HS256`, `ACCESS_TOKEN_EXPIRE_MINUTES=10080`
6. Deploy — note the service URL (e.g. `https://epilens-api.onrender.com`)

### 3 — Vercel (frontend)

1. Import this repository at [vercel.com](https://vercel.com)
2. Set **Root Directory** to `frontend`
3. Add environment variable: `VITE_API_URL=<your Render service URL>`
4. Deploy

---

## Developer

**Gribon Mwebi** — built as a portfolio project demonstrating full-stack engineering, epidemiological data analysis, and modern React patterns.
