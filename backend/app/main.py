from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

import app.models  # noqa: F401 — registers all models with SQLAlchemy
from app.api.routes import auth, indicators

app = FastAPI(
    title="EpiLens API",
    description="Epidemiological analysis platform backed by WHO Global Health Observatory data",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(auth.router)
app.include_router(indicators.router)


@app.get("/health")
def health_check():
    return {"status": "ok"}
