from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.api.v1.auth import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.schemas.portfolio import (
    PortfolioCreate,
    PortfolioResponse,
    PortfolioSummaryResponse,
    PortfolioUpdate,
)
from app.services.portfolio_service import (
    create_my_portfolio,
    delete_my_portfolio,
    get_my_portfolio_detail,
    get_my_portfolio_summary,
    get_my_portfolios,
    update_my_portfolio,
)


router = APIRouter(
    prefix="/portfolio",
    tags=["Portfolio"],
)


@router.post(
    "",
    response_model=PortfolioResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_portfolio_item(
    portfolio_create: PortfolioCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return create_my_portfolio(
        db=db,
        user_id=current_user.id,
        portfolio_create=portfolio_create,
    )


@router.get(
    "",
    response_model=list[PortfolioResponse],
)
def read_my_portfolios(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return get_my_portfolios(
        db=db,
        user_id=current_user.id,
    )


@router.get(
    "/summary",
    response_model=PortfolioSummaryResponse,
)
def read_my_portfolio_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return get_my_portfolio_summary(
        db=db,
        user_id=current_user.id,
    )


@router.get(
    "/{portfolio_id}",
    response_model=PortfolioResponse,
)
def read_my_portfolio_detail(
    portfolio_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return get_my_portfolio_detail(
        db=db,
        user_id=current_user.id,
        portfolio_id=portfolio_id,
    )


@router.patch(
    "/{portfolio_id}",
    response_model=PortfolioResponse,
)
def update_portfolio_item(
    portfolio_id: int,
    portfolio_update: PortfolioUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return update_my_portfolio(
        db=db,
        user_id=current_user.id,
        portfolio_id=portfolio_id,
        portfolio_update=portfolio_update,
    )


@router.delete(
    "/{portfolio_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_portfolio_item(
    portfolio_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    delete_my_portfolio(
        db=db,
        user_id=current_user.id,
        portfolio_id=portfolio_id,
    )
    return None