from pydantic import BaseModel


class MarketQuoteResponse(BaseModel):
    ticker: str
    name: str | None = None
    currency: str | None = None
    current_price: float | None = None
    previous_close: float | None = None
    open_price: float | None = None
    day_high: float | None = None
    day_low: float | None = None
    market_cap: float | None = None
    fifty_two_week_high: float | None = None
    fifty_two_week_low: float | None = None