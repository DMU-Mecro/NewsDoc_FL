from sqlalchemy.orm import Session

from app.models.news import NewsArticle
from app.schemas.news import NewsSaveRequest


def create_saved_news(
    db: Session,
    user_id: int,
    news_save_request: NewsSaveRequest,
) -> NewsArticle:
    article = NewsArticle(
        user_id=user_id,
        title=news_save_request.title,
        url=str(news_save_request.url),
        source=news_save_request.source,
        summary=news_save_request.summary,
        ticker=news_save_request.ticker.upper()
        if news_save_request.ticker
        else None,
        query=news_save_request.query,
        published_at=news_save_request.published_at,
    )

    db.add(article)
    db.commit()
    db.refresh(article)

    return article


def get_saved_news_by_user_id(
    db: Session,
    user_id: int,
) -> list[NewsArticle]:
    return (
        db.query(NewsArticle)
        .filter(NewsArticle.user_id == user_id)
        .order_by(NewsArticle.saved_at.desc())
        .all()
    )


def get_saved_news_by_id(
    db: Session,
    news_id: int,
) -> NewsArticle | None:
    return (
        db.query(NewsArticle)
        .filter(NewsArticle.id == news_id)
        .first()
    )


def get_saved_news_by_user_and_url(
    db: Session,
    user_id: int,
    url: str,
) -> NewsArticle | None:
    return (
        db.query(NewsArticle)
        .filter(
            NewsArticle.user_id == user_id,
            NewsArticle.url == url,
        )
        .first()
    )


def delete_saved_news(
    db: Session,
    article: NewsArticle,
) -> None:
    db.delete(article)
    db.commit()