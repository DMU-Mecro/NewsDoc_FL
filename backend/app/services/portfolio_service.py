from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.portfolio import Portfolio
from app.repositories.portfolio_repository import (
    create_portfolio,
    delete_portfolio,
    get_portfolio_by_id,
    get_portfolios_by_user_id,
    update_portfolio,
)
from app.schemas.portfolio import (
    PortfolioCreate,
    PortfolioSummaryItem,
    PortfolioSummaryResponse,
    PortfolioUpdate,
)
from app.services.market_service import get_current_price_for_ticker


def _round_money(value: float | None) -> float | None:
    if value is None:
        return None

    return round(value, 2)


def _round_rate(value: float | None) -> float | None:
    if value is None:
        return None

    return round(value, 2)


def create_my_portfolio(
    db: Session,
    user_id: int,
    portfolio_create: PortfolioCreate,
) -> Portfolio:
    return create_portfolio(
        db=db,
        user_id=user_id,
        portfolio_create=portfolio_create,
    )


def get_my_portfolios(
    db: Session,
    user_id: int,
) -> list[Portfolio]:
    return get_portfolios_by_user_id(
        db=db,
        user_id=user_id,
    )


def get_my_portfolio_detail(
    db: Session,
    user_id: int,
    portfolio_id: int,
) -> Portfolio:
    portfolio = get_portfolio_by_id(
        db=db,
        portfolio_id=portfolio_id,
    )

    if portfolio is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="포트폴리오 항목을 찾을 수 없습니다.",
        )

    if portfolio.user_id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="해당 포트폴리오 항목에 접근할 권한이 없습니다.",
        )

    return portfolio


def update_my_portfolio(
    db: Session,
    user_id: int,
    portfolio_id: int,
    portfolio_update: PortfolioUpdate,
) -> Portfolio:
    portfolio = get_my_portfolio_detail(
        db=db,
        user_id=user_id,
        portfolio_id=portfolio_id,
    )

    return update_portfolio(
        db=db,
        portfolio=portfolio,
        portfolio_update=portfolio_update,
    )


def delete_my_portfolio(
    db: Session,
    user_id: int,
    portfolio_id: int,
) -> None:
    portfolio = get_my_portfolio_detail(
        db=db,
        user_id=user_id,
        portfolio_id=portfolio_id,
    )

    delete_portfolio(
        db=db,
        portfolio=portfolio,
    )


def get_my_portfolio_summary(
    db: Session,
    user_id: int,
) -> PortfolioSummaryResponse:
    portfolios = get_portfolios_by_user_id(
        db=db,
        user_id=user_id,
    )

    items: list[PortfolioSummaryItem] = []

    total_invested_amount = 0.0
    total_current_value = 0.0

    for portfolio in portfolios:
        invested_amount = portfolio.quantity * portfolio.average_price
        current_price = get_current_price_for_ticker(portfolio.ticker)

        current_value: float | None = None
        profit_loss: float | None = None
        profit_loss_rate: float | None = None

        if current_price is not None:
            current_value = portfolio.quantity * current_price
            profit_loss = current_value - invested_amount

            if invested_amount > 0:
                profit_loss_rate = (profit_loss / invested_amount) * 100

            total_current_value += current_value

        total_invested_amount += invested_amount

        items.append(
            PortfolioSummaryItem(
                portfolio_id=portfolio.id,
                ticker=portfolio.ticker,
                company_name=portfolio.company_name,
                quantity=portfolio.quantity,
                average_price=portfolio.average_price,
                current_price=_round_money(current_price),
                invested_amount=_round_money(invested_amount) or 0.0,
                current_value=_round_money(current_value),
                profit_loss=_round_money(profit_loss),
                profit_loss_rate=_round_rate(profit_loss_rate),
                currency=portfolio.currency,
            )
        )

    total_profit_loss = total_current_value - total_invested_amount

    total_profit_loss_rate: float | None = None

    if total_invested_amount > 0:
        total_profit_loss_rate = (
            total_profit_loss / total_invested_amount
        ) * 100

    return PortfolioSummaryResponse(
        total_invested_amount=_round_money(total_invested_amount) or 0.0,
        total_current_value=_round_money(total_current_value) or 0.0,
        total_profit_loss=_round_money(total_profit_loss) or 0.0,
        total_profit_loss_rate=_round_rate(total_profit_loss_rate),
        items=items,
    )