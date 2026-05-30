from datetime import datetime

from pydantic import BaseModel, Field


class PortfolioCreate(BaseModel):
    ticker: str = Field(..., min_length=1, max_length=20)
    company_name: str | None = Field(default=None, max_length=255)
    quantity: float = Field(..., ge=0)
    average_price: float = Field(..., ge=0)
    currency: str = Field(default="USD", max_length=10)
    memo: str | None = Field(default=None, max_length=500)


class PortfolioUpdate(BaseModel):
    ticker: str | None = Field(default=None, min_length=1, max_length=20)
    company_name: str | None = Field(default=None, max_length=255)
    quantity: float | None = Field(default=None, ge=0)
    average_price: float | None = Field(default=None, ge=0)
    currency: str | None = Field(default=None, max_length=10)
    memo: str | None = Field(default=None, max_length=500)


class PortfolioResponse(BaseModel):
    id: int
    user_id: int
    ticker: str
    company_name: str | None = None
    quantity: float
    average_price: float
    currency: str
    memo: str | None = None
    created_at: datetime
    updated_at: datetime

    model_config = {
        "from_attributes": True
    }


class PortfolioSummaryItem(BaseModel):
    portfolio_id: int
    ticker: str
    company_name: str | None = None
    quantity: float
    average_price: float
    current_price: float | None = None
    invested_amount: float
    current_value: float | None = None
    profit_loss: float | None = None
    profit_loss_rate: float | None = None
    currency: str


class PortfolioSummaryResponse(BaseModel):
    total_invested_amount: float
    total_current_value: float
    total_profit_loss: float
    total_profit_loss_rate: float | None = None
    items: list[PortfolioSummaryItem]