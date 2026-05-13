from pydantic import BaseModel, Field


class TrendRequest(BaseModel):
    records: list[dict] = Field(..., description="List of {year, value} dicts")
    project_years: int = Field(5, ge=1, le=20)


class CorrelateRequest(BaseModel):
    x_records: list[dict] = Field(..., description="List of {country, year, value} for indicator X")
    y_records: list[dict] = Field(..., description="List of {country, year, value} for indicator Y")


class BurdenRequest(BaseModel):
    records: list[dict] = Field(..., description="List of {country, indicator, value} dicts")
    weights: dict[str, float] | None = None
    invert: list[str] | None = None


class AnomalyRequest(BaseModel):
    records: list[dict] = Field(..., description="List of {year, value} dicts")
    window: int = Field(5, ge=2, le=20)


class ClusterRequest(BaseModel):
    records: list[dict] = Field(..., description="List of {country, year, value} dicts")
    n_clusters: int = Field(4, ge=2, le=10)
