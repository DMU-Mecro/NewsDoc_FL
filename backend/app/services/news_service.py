from datetime import datetime
from email.utils import parsedate_to_datetime
from urllib.parse import quote_plus

import feedparser
from fastapi import HTTPException, status
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.models.news import NewsArticle
from app.repositories.news_repository import (
    create_saved_news,
    delete_saved_news,
    get_saved_news_by_id,
    get_saved_news_by_user_and_url,
    get_saved_news_by_user_id,
)
from app.schemas.news import (
    NewsArticleResponse,
    NewsSaveRequest,
    NewsSearchItem,
    NewsSearchResponse,
)


def _parse_datetime(value: str | None) -> datetime | None:
    if not value:
        return None

    try:
        parsed = parsedate_to_datetime(value)

        if parsed.tzinfo is not None:
            return parsed.replace(tzinfo=None)

        return parsed

    except Exception:
        return None


def _clean_text(value: str | None) -> str | None:
    if value is None:
        return None

    cleaned = " ".join(value.split())

    if not cleaned:
        return None

    return cleaned


def search_news_by_query(
    query: str,
    limit: int = 10,
) -> NewsSearchResponse:
    keyword = query.strip()

    if not keyword:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="검색어를 입력해야 합니다.",
        )

    safe_limit = max(1, min(limit, 30))
    encoded_query = quote_plus(keyword)

    rss_url = (
        "https://news.google.com/rss/search"
        f"?q={encoded_query}"
        "&hl=en-US"
        "&gl=US"
        "&ceid=US:en"
    )

    feed = feedparser.parse(rss_url)

    items: list[NewsSearchItem] = []

    for entry in feed.entries[:safe_limit]:
        title = _clean_text(entry.get("title"))
        url = entry.get("link")
        summary = _clean_text(entry.get("summary"))
        published_at = _parse_datetime(entry.get("published"))

        if not title or not url:
            continue

        source = None

        if hasattr(entry, "source"):
            source = entry.source.get("title")

        items.append(
            NewsSearchItem(
                title=title,
                url=url,
                source=source,
                summary=summary,
                ticker=None,
                query=keyword,
                published_at=published_at,
            )
        )

    return NewsSearchResponse(
        count=len(items),
        items=items,
    )


def search_news_by_ticker(
    ticker: str,
    limit: int = 10,
) -> NewsSearchResponse:
    symbol = ticker.upper().strip()

    if not symbol:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="티커를 입력해야 합니다.",
        )

    safe_limit = max(1, min(limit, 30))

    rss_url = (
        "https://feeds.finance.yahoo.com/rss/2.0/headline"
        f"?s={symbol}"
        "&region=US"
        "&lang=en-US"
    )

    feed = feedparser.parse(rss_url)

    items: list[NewsSearchItem] = []

    for entry in feed.entries[:safe_limit]:
        title = _clean_text(entry.get("title"))
        url = entry.get("link")
        summary = _clean_text(entry.get("summary"))
        published_at = _parse_datetime(entry.get("published"))

        if not title or not url:
            continue

        items.append(
            NewsSearchItem(
                title=title,
                url=url,
                source="Yahoo Finance",
                summary=summary,
                ticker=symbol,
                query=None,
                published_at=published_at,
            )
        )

    return NewsSearchResponse(
        count=len(items),
        items=items,
    )


def save_news_article(
    db: Session,
    user_id: int,
    news_save_request: NewsSaveRequest,
) -> NewsArticle:
    existing_article = get_saved_news_by_user_and_url(
        db=db,
        user_id=user_id,
        url=str(news_save_request.url),
    )

    if existing_article is not None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="이미 저장한 뉴스입니다.",
        )

    try:
        return create_saved_news(
            db=db,
            user_id=user_id,
            news_save_request=news_save_request,
        )

    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="이미 저장한 뉴스입니다.",
        )


def get_my_saved_news(
    db: Session,
    user_id: int,
) -> list[NewsArticle]:
    return get_saved_news_by_user_id(
        db=db,
        user_id=user_id,
    )


def get_my_saved_news_detail(
    db: Session,
    user_id: int,
    news_id: int,
) -> NewsArticle:
    article = get_saved_news_by_id(
        db=db,
        news_id=news_id,
    )

    if article is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="저장된 뉴스를 찾을 수 없습니다.",
        )

    if article.user_id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="해당 뉴스에 접근할 권한이 없습니다.",
        )

    return article


def delete_my_saved_news(
    db: Session,
    user_id: int,
    news_id: int,
) -> None:
    article = get_my_saved_news_detail(
        db=db,
        user_id=user_id,
        news_id=news_id,
    )

    delete_saved_news(
        db=db,
        article=article,
    )