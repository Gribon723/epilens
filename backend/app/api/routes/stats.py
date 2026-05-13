from fastapi import APIRouter, HTTPException

from app.schemas.stats import AnomalyRequest, BurdenRequest, ClusterRequest, CorrelateRequest, TrendRequest
from app.services.stats_engine import (
    cluster_countries,
    compute_burden_index,
    compute_correlation,
    compute_trend,
    detect_anomalies,
)

router = APIRouter(prefix="/stats", tags=["stats"])


def _handle(fn, *args, **kwargs):
    try:
        return fn(*args, **kwargs)
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc))
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Computation error: {exc}")


@router.post("/trend")
def trend(body: TrendRequest):
    return _handle(compute_trend, body.records, body.project_years)


@router.post("/correlate")
def correlate(body: CorrelateRequest):
    return _handle(compute_correlation, body.x_records, body.y_records)


@router.post("/burden")
def burden(body: BurdenRequest):
    return _handle(compute_burden_index, body.records, body.weights, body.invert)


@router.post("/anomalies")
def anomalies(body: AnomalyRequest):
    return _handle(detect_anomalies, body.records, body.window)


@router.post("/cluster")
def cluster(body: ClusterRequest):
    return _handle(cluster_countries, body.records, body.n_clusters)
