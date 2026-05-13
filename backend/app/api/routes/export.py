from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import Response
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db
from app.models.analysis import Analysis
from app.models.annotation import Annotation
from app.models.user import User
from app.services.pdf_generator import generate_pdf

router = APIRouter(prefix="/export", tags=["export"])


class ExportRequest(BaseModel):
    analysis_id: UUID
    chart_image: str  # base64-encoded PNG


def _get_owned_analysis(analysis_id: UUID, current_user: User, db: Session) -> Analysis:
    analysis = db.query(Analysis).filter(Analysis.id == analysis_id).first()
    if analysis is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Analysis not found")
    if analysis.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not your analysis")
    return analysis


@router.post("/pdf")
def export_pdf(
    body: ExportRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    analysis = _get_owned_analysis(body.analysis_id, current_user, db)
    annotations = (
        db.query(Annotation)
        .filter(Annotation.analysis_id == analysis.id)
        .order_by(Annotation.country_code, Annotation.year)
        .all()
    )

    try:
        pdf_bytes = generate_pdf(analysis, annotations, body.chart_image)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"PDF generation failed: {exc}")

    filename = f"epilens-{analysis.indicator_code}-{analysis.id}.pdf"
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename={filename}"},
    )
