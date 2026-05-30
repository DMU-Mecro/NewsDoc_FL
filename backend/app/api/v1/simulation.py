from fastapi import APIRouter, Depends

from app.api.v1.auth import get_current_user
from app.models.user import User
from app.schemas.simulation import ScenarioInfo, SimulationRequest, SimulationResponse
from app.services.simulation_service import SCENARIOS, run_investment_simulation


router = APIRouter(
    prefix="/simulation",
    tags=["Simulation"],
)


@router.get(
    "/scenarios",
    response_model=list[ScenarioInfo],
)
def read_simulation_scenarios(
    current_user: User = Depends(get_current_user),
):
    return SCENARIOS


@router.post(
    "/projection",
    response_model=SimulationResponse,
)
def create_simulation_projection(
    simulation_request: SimulationRequest,
    current_user: User = Depends(get_current_user),
):
    return run_investment_simulation(simulation_request)