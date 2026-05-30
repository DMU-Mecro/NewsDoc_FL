from typing import Literal

from pydantic import BaseModel, Field, field_validator


ScenarioKey = Literal["best", "base", "worst"]


class SimulationRequest(BaseModel):
    initial_amount: float = Field(..., ge=0, description="현재 초기 자산")
    goal_amount: float = Field(..., gt=0, description="목표 금액")
    years: int = Field(..., ge=1, le=50, description="투자 기간")
    monthly_contribution: float = Field(default=0, ge=0, description="매월 추가 투자금")

    @field_validator("initial_amount", "goal_amount", "monthly_contribution", mode="before")
    @classmethod
    def parse_number(cls, value):
        if value is None or value == "":
            return 0
        return value


class ScenarioInfo(BaseModel):
    key: ScenarioKey
    label: str
    annual_return_rate: float
    description: str


class ProjectionPoint(BaseModel):
    year: str
    year_index: int
    best: float
    base: float
    worst: float


class ScenarioResult(BaseModel):
    scenario: ScenarioKey
    label: str
    annual_return_rate: float
    final_amount: float
    profit_amount: float
    goal_gap: float
    goal_achieved: bool


class SimulationMetrics(BaseModel):
    required_annual_return_rate: float
    required_monthly_contribution_at_base_rate: float
    base_rate: float


class SimulationResponse(BaseModel):
    initial_amount: float
    goal_amount: float
    years: int
    monthly_contribution: float
    scenarios: list[ScenarioInfo]
    projections: list[ProjectionPoint]
    results: list[ScenarioResult]
    metrics: SimulationMetrics