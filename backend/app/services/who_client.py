import json
from datetime import datetime, timedelta

import httpx
import pandas as pd

_BASE = "https://ghoapi.azureedge.net/api"
_TTL = timedelta(hours=24)

_cache: dict[str, dict] = {}


def _is_fresh(key: str) -> bool:
    entry = _cache.get(key)
    return entry is not None and datetime.utcnow() - entry["fetched_at"] < _TTL


def fetch_indicators() -> list[dict]:
    """Return all WHO GHO indicators as [{code, name}]."""
    if _is_fresh("indicators"):
        return _cache["indicators"]["data"]

    resp = httpx.get(f"{_BASE}/Indicator", timeout=20)
    resp.raise_for_status()

    records = [
        {"code": r["IndicatorCode"], "name": r["IndicatorName"]}
        for r in resp.json()["value"]
        if r.get("Language") == "EN"
    ]

    _cache["indicators"] = {"data": records, "fetched_at": datetime.utcnow()}
    return records


def fetch_indicator_data(code: str) -> list[dict]:
    """Return country-level records for one indicator as a list of dicts."""
    cache_key = f"data:{code}"
    if _is_fresh(cache_key):
        return _cache[cache_key]["data"]

    resp = httpx.get(
        f"{_BASE}/{code}",
        params={"$filter": "SpatialDimType eq 'COUNTRY'"},
        timeout=30,
    )
    resp.raise_for_status()

    raw = resp.json()["value"]
    if not raw:
        return []

    df = pd.DataFrame(raw)[
        ["SpatialDim", "TimeDim", "NumericValue", "Low", "High", "Dim1", "ParentLocation", "ParentLocationCode"]
    ].rename(columns={
        "SpatialDim": "country",
        "TimeDim": "year",
        "NumericValue": "value",
        "Low": "low",
        "High": "high",
        "Dim1": "sex",
        "ParentLocation": "region",
        "ParentLocationCode": "region_code",
    })

    df = df.dropna(subset=["value"]).sort_values(["country", "year"])
    # JSON round-trip converts numpy int64/float64 to native Python types
    records = json.loads(df.to_json(orient="records"))

    _cache[cache_key] = {"data": records, "fetched_at": datetime.utcnow()}
    return records
