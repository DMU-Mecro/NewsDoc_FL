from sqlalchemy.orm import Session

from app.models.portfolio import Portfolio
from app.schemas.portfolio import PortfolioCreate, PortfolioUpdate


def create_portfolio(
    db: Session,
    user_id: int,
    portfolio_create: PortfolioCreate,
) -> Portfolio:
    portfolio = Portfolio(
        user_id=user_id,
        ticker=portfolio_create.ticker.upper(),
        company_name=portfolio_create.company_name,
        quantity=portfolio_create.quantity,
        average_price=portfolio_create.average_price,
        currency=portfolio_create.currency.upper(),
        memo=portfolio_create.memo,
    )

    db.add(portfolio)
    db.commit()
    db.refresh(portfolio)

    return portfolio


def get_portfolios_by_user_id(
    db: Session,
    user_id: int,
) -> list[Portfolio]:
    return (
        db.query(Portfolio)
        .filter(Portfolio.user_id == user_id)
        .order_by(Portfolio.created_at.desc())
        .all()
    )


def get_portfolio_by_id(
    db: Session,
    portfolio_id: int,
) -> Portfolio | None:
    return (
        db.query(Portfolio)
        .filter(Portfolio.id == portfolio_id)
        .first()
    )


def update_portfolio(
    db: Session,
    portfolio: Portfolio,
    portfolio_update: PortfolioUpdate,
) -> Portfolio:
    update_data = portfolio_update.model_dump(exclude_unset=True)

    if "ticker" in update_data and update_data["ticker"] is not None:
        update_data["ticker"] = update_data["ticker"].upper()

    if "currency" in update_data and update_data["currency"] is not None:
        update_data["currency"] = update_data["currency"].upper()

    for field, value in update_data.items():
        setattr(portfolio, field, value)

    db.add(portfolio)
    db.commit()
    db.refresh(portfolio)

    return portfolio


def delete_portfolio(
    db: Session,
    portfolio: Portfolio,
) -> None:
    db.delete(portfolio)
    db.commit()