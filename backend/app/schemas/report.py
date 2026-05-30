from datetime import datetime

from pydantic import BaseModel, Field


class ReportGenerateRequest(BaseModel):
    title: str | None = Field(
        default=None,
        max_length=255,
    )
    report_type: str = Field(
        default="rag_marketecho",
        max_length=50,
    )
    topic: str = Field(
        default="macro economy",
        min_length=1,
        max_length=100,
    )
    ticker: str | None = Field(
        default=None,
        max_length=20,
    )
    saved_news_limit: int = Field(
        default=5,
        ge=0,
        le=20,
    )
    include_rag_context: bool = True
    include_portfolio_summary: bool = True
    include_saved_news: bool = True


class ReportResponse(BaseModel):
    id: int
    user_id: int
    title: str
    report_type: str
    source_ticker: str | None = None
    topic: str | None = None
    marketecho_index: str | None = None
    content: str
    status: str
    created_at: datetime

    model_config = {
        "from_attributes": True
    }


class ReportListItem(BaseModel):
    id: int
    title: str
    report_type: str
    source_ticker: str | None = None
    topic: str | None = None
    marketecho_index: str | None = None
    status: str
    created_at: datetime

    model_config = {
        "from_attributes": True
    }