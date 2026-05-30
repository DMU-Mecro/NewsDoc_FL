from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.api.v1.auth import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.schemas.report import (
    ReportGenerateRequest,
    ReportListItem,
    ReportResponse,
)
from app.services.report_service import (
    delete_my_report,
    generate_report,
    get_my_report_detail,
    get_my_reports,
)


router = APIRouter(
    prefix="/reports",
    tags=["Reports"],
)


@router.post(
    "/generate",
    response_model=ReportResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_ai_report(
    request: ReportGenerateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return generate_report(
        db=db,
        user_id=current_user.id,
        request=request,
    )


@router.get(
    "",
    response_model=list[ReportListItem],
)
def read_my_reports(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return get_my_reports(
        db=db,
        user_id=current_user.id,
    )


@router.get(
    "/{report_id}",
    response_model=ReportResponse,
)
def read_my_report_detail(
    report_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return get_my_report_detail(
        db=db,
        user_id=current_user.id,
        report_id=report_id,
    )


@router.delete(
    "/{report_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_report(
    report_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    delete_my_report(
        db=db,
        user_id=current_user.id,
        report_id=report_id,
    )
    return None