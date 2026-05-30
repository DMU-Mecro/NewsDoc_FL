from sqlalchemy.orm import Session

from app.models.report import Report


def create_report(
    db: Session,
    user_id: int,
    title: str,
    report_type: str,
    content: str,
    source_ticker: str | None = None,
    topic: str | None = None,
    marketecho_index: float | None = None,
    status: str = "completed",
) -> Report:
    report = Report(
        user_id=user_id,
        title=title,
        report_type=report_type,
        source_ticker=source_ticker.upper() if source_ticker else None,
        topic=topic,
        marketecho_index=str(marketecho_index)
        if marketecho_index is not None
        else None,
        content=content,
        status=status,
    )

    db.add(report)
    db.commit()
    db.refresh(report)

    return report


def get_reports_by_user_id(
    db: Session,
    user_id: int,
) -> list[Report]:
    return (
        db.query(Report)
        .filter(Report.user_id == user_id)
        .order_by(Report.created_at.desc())
        .all()
    )


def get_report_by_id(
    db: Session,
    report_id: int,
) -> Report | None:
    return (
        db.query(Report)
        .filter(Report.id == report_id)
        .first()
    )


def delete_report(
    db: Session,
    report: Report,
) -> None:
    db.delete(report)
    db.commit()