from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db
from app.models.analysis import Analysis
from app.models.annotation import Annotation
from app.models.user import User
from app.schemas.analysis import AnalysisCreate, AnalysisOut, AnnotationCreate, AnnotationOut

router = APIRouter(prefix="/analyses", tags=["analyses"])


def _get_owned_analysis(analysis_id: UUID, current_user: User, db: Session) -> Analysis:
    analysis = db.query(Analysis).filter(Analysis.id == analysis_id).first()
    if analysis is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Analysis not found")
    if analysis.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not your analysis")
    return analysis


@router.post("", response_model=AnalysisOut, status_code=status.HTTP_201_CREATED)
def create_analysis(
    body: AnalysisCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    analysis = Analysis(
        user_id=current_user.id,
        title=body.title,
        description=body.description,
        indicator_code=body.indicator_code,
        countries=body.countries,
        year_start=body.year_start,
        year_end=body.year_end,
        config=body.config,
    )
    db.add(analysis)
    db.commit()
    db.refresh(analysis)
    return analysis


@router.get("", response_model=list[AnalysisOut])
def list_analyses(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return db.query(Analysis).filter(Analysis.user_id == current_user.id).all()


@router.get("/{analysis_id}", response_model=AnalysisOut)
def get_analysis(
    analysis_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return _get_owned_analysis(analysis_id, current_user, db)


@router.delete("/{analysis_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_analysis(
    analysis_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    analysis = _get_owned_analysis(analysis_id, current_user, db)
    db.delete(analysis)
    db.commit()


@router.post("/{analysis_id}/annotations", response_model=AnnotationOut, status_code=status.HTTP_201_CREATED)
def create_annotation(
    analysis_id: UUID,
    body: AnnotationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    _get_owned_analysis(analysis_id, current_user, db)
    annotation = Annotation(
        analysis_id=analysis_id,
        country_code=body.country_code,
        year=body.year,
        note=body.note,
    )
    db.add(annotation)
    db.commit()
    db.refresh(annotation)
    return annotation


@router.get("/{analysis_id}/annotations", response_model=list[AnnotationOut])
def list_annotations(
    analysis_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    _get_owned_analysis(analysis_id, current_user, db)
    return db.query(Annotation).filter(Annotation.analysis_id == analysis_id).all()


@router.delete("/{analysis_id}/annotations/{annotation_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_annotation(
    analysis_id: UUID,
    annotation_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    _get_owned_analysis(analysis_id, current_user, db)
    annotation = db.query(Annotation).filter(Annotation.id == annotation_id).first()
    if annotation is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Annotation not found")
    db.delete(annotation)
    db.commit()
