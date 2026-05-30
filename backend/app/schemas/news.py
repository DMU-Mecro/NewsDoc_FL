from datetime import datetime

from pydantic import BaseModel, Field, HttpUrl


class NewsSearchItem(BaseModel):
    title: str
    url: str
    source: str | None = None
    summary: str | None = None
    ticker: str | None = None
    query: str | None = None
    published_at: datetime | None = None


class NewsSearchResponse(BaseModel):
    count: int
    items: list[NewsSearchItem]


class NewsSaveRequest(BaseModel):
    title: str = Field(..., min_length=1, max_length=500)
    url: HttpUrl
    source: str | None = Field(default=None, max_length=100)
    summary: str | None = None
    ticker: str | None = Field(default=None, max_length=20)
    query: str | None = Field(default=None, max_length=255)
    published_at: datetime | None = None


class NewsArticleResponse(BaseModel):
    id: int
    user_id: int
    title: str
    url: str
    source: str | None = None
    summary: str | None = None
    ticker: str | None = None
    query: str | None = None
    published_at: datetime | None = None
    saved_at: datetime

    model_config = {
        "from_attributes": True
    }