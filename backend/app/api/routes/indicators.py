from fastapi import APIRouter, HTTPException

from app.services.who_client import fetch_indicator_data, fetch_indicators

router = APIRouter(prefix="/indicators", tags=["indicators"])


@router.get("")
def list_indicators():
    """Return all WHO GHO indicators."""
    return fetch_indicators()


@router.get("/{code}/data")
def get_indicator_data(code: str):
    """Return country-level data for one indicator."""
    try:
        records = fetch_indicator_data(code)
    except Exception:
        raise HTTPException(status_code=502, detail=f"Failed to fetch data for indicator {code}")
    if not records:
        raise HTTPException(status_code=404, detail=f"No country-level data found for indicator {code}")
    return records
