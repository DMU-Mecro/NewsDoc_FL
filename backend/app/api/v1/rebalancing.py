from fastapi import APIRouter, Depends

from app.api.v1.auth import get_current_user
from app.models.user import User
from app.schemas.rebalancing import RebalancingRequest, RebalancingResponse
from app.services.rebalancing_service import run_rebalancing


router = APIRouter(
    prefix="/rebalancing",
    tags=["Rebalancing"],
)


@router.post(
    "/recommendation",
    response_model=RebalancingResponse,
)
def create_rebalancing_recommendation(
    rebalancing_request: RebalancingRequest,
    current_user: User = Depends(get_current_user),
):
    return run_rebalancing(rebalancing_request)