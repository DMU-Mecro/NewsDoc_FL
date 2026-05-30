from fastapi import APIRouter, Depends

from app.api.v1.auth import get_current_user
from app.models.user import User
from app.schemas.market import MarketQuoteResponse
from app.services.market_service import get_market_quote


router = APIRouter(
    prefix="/market",
    tags=["Market"],
)


@router.get(
    "/quote/{ticker}",
    response_model=MarketQuoteResponse,
)
def read_market_quote(
    ticker: str,
    current_user: User = Depends(get_current_user),
):
    return get_market_quote(ticker)