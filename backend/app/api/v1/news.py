from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.api.v1.auth import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.schemas.news import (
    NewsArticleResponse,
    NewsSaveRequest,
    NewsSearchResponse,
)
from app.services.news_service import (
    delete_my_saved_news,
    get_my_saved_news,
    get_my_saved_news_detail,
    save_news_article,
    search_news_by_query,
    search_news_by_ticker,
)


router = APIRouter(
    prefix="/news",
    tags=["News"],
)


@router.get(
    "/search",
    response_model=NewsSearchResponse,
)
def search_news(
    query: str = Query(..., min_length=1, max_length=255),
    limit: int = Query(default=10, ge=1, le=30),
    current_user: User = Depends(get_current_user),
):
    return search_news_by_query(
        query=query,
        limit=limit,
    )


@router.get(
    "/ticker/{ticker}",
    response_model=NewsSearchResponse,
)
def search_ticker_news(
    ticker: str,
    limit: int = Query(default=10, ge=1, le=30),
    current_user: User = Depends(get_current_user),
):
    return search_news_by_ticker(
        ticker=ticker,
        limit=limit,
    )


@router.post(
    "/save",
    response_model=NewsArticleResponse,
    status_code=status.HTTP_201_CREATED,
)
def save_news(
    news_save_request: NewsSaveRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return save_news_article(
        db=db,
        user_id=current_user.id,
        news_save_request=news_save_request,
    )


@router.get(
    "/saved",
    response_model=list[NewsArticleResponse],
)
def read_my_saved_news(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return get_my_saved_news(
        db=db,
        user_id=current_user.id,
    )


@router.get(
    "/saved/{news_id}",
    response_model=NewsArticleResponse,
)
def read_my_saved_news_detail(
    news_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return get_my_saved_news_detail(
        db=db,
        user_id=current_user.id,
        news_id=news_id,
    )


@router.delete(
    "/saved/{news_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_saved_news(
    news_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    delete_my_saved_news(
        db=db,
        user_id=current_user.id,
        news_id=news_id,
    )
    return None