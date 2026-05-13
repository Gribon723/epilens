from datetime import datetime
from uuid import UUID

from pydantic import BaseModel


class AnalysisCreate(BaseModel):
    title: str
    description: str | None = None
    indicator_code: str
    countries: list[str] | None = None
    year_start: int | None = None
    year_end: int | None = None
    config: dict | None = None


class AnalysisOut(BaseModel):
    id: UUID
    user_id: UUID
    title: str
    description: str | None
    indicator_code: str
    countries: list[str] | None
    year_start: int | None
    year_end: int | None
    config: dict | None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class AnnotationCreate(BaseModel):
    country_code: str
    year: int
    note: str


class AnnotationOut(BaseModel):
    id: UUID
    analysis_id: UUID
    country_code: str
    year: int
    note: str
    created_at: datetime

    model_config = {"from_attributes": True}
