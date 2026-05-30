from app.schemas.simulation import (
    ProjectionPoint,
    ScenarioInfo,
    ScenarioResult,
    SimulationMetrics,
    SimulationRequest,
    SimulationResponse,
)


SCENARIOS = [
    ScenarioInfo(
        key="best",
        label="최선",
        annual_return_rate=0.10,
        description="금리 인하, 경기 회복, 위험자산 선호가 강해지는 경우",
    ),
    ScenarioInfo(
        key="base",
        label="기본",
        annual_return_rate=0.065,
        description="장기 시장 평균에 가까운 완만한 복리 성장을 가정하는 경우",
    ),
    ScenarioInfo(
        key="worst",
        label="최악",
        annual_return_rate=0.02,
        description="고금리, 경기 둔화, 낮은 자산 수익률이 이어지는 경우",
    ),
]


def _future_value(
    initial_amount: float,
    monthly_contribution: float,
    annual_return_rate: float,
    years: int,
) -> float:
    """
    초기 자산과 매월 투자금을 기준으로 미래가치를 계산합니다.

    계산 방식:
    1. 초기 자산은 연복리로 성장한다고 가정합니다.
    2. 매월 투자금은 월복리로 적립된다고 가정합니다.
    """
    if years <= 0:
        return round(initial_amount, 2)

    months = years * 12
    monthly_rate = annual_return_rate / 12

    future_value_of_initial = initial_amount * ((1 + annual_return_rate) ** years)

    if monthly_contribution <= 0:
        future_value_of_contribution = 0
    elif monthly_rate == 0:
        future_value_of_contribution = monthly_contribution * months
    else:
        future_value_of_contribution = monthly_contribution * (
            ((1 + monthly_rate) ** months - 1) / monthly_rate
        )

    return round(future_value_of_initial + future_value_of_contribution, 2)


def _required_annual_return_rate(
    initial_amount: float,
    goal_amount: float,
    years: int,
) -> float:
    """
    추가 투자금 없이 현재 초기 자산만으로 목표 금액을 달성하기 위한 CAGR입니다.
    초기 자산이 0이면 수익률만으로 계산할 수 없으므로 0을 반환합니다.
    """
    if initial_amount <= 0 or goal_amount <= initial_amount:
        return 0.0

    return round(((goal_amount / initial_amount) ** (1 / years) - 1) * 100, 2)


def _required_monthly_contribution(
    initial_amount: float,
    goal_amount: float,
    years: int,
    annual_return_rate: float,
) -> float:
    """
    기본 시나리오 수익률을 적용했을 때 목표 달성에 필요한 월 투자금을 역산합니다.
    """
    months = years * 12
    monthly_rate = annual_return_rate / 12
    future_value_of_initial = initial_amount * ((1 + annual_return_rate) ** years)
    remaining_goal = goal_amount - future_value_of_initial

    if remaining_goal <= 0:
        return 0.0

    if monthly_rate == 0:
        return round(remaining_goal / months, 2)

    required = remaining_goal * monthly_rate / (((1 + monthly_rate) ** months) - 1)
    return round(required, 2)


def run_investment_simulation(request: SimulationRequest) -> SimulationResponse:
    projection_points: list[ProjectionPoint] = []

    for year_index in range(0, request.years + 1):
        year_label = "현재" if year_index == 0 else f"{year_index}년 후"
        values = {
            scenario.key: _future_value(
                initial_amount=request.initial_amount,
                monthly_contribution=request.monthly_contribution,
                annual_return_rate=scenario.annual_return_rate,
                years=year_index,
            )
            for scenario in SCENARIOS
        }

        projection_points.append(
            ProjectionPoint(
                year=year_label,
                year_index=year_index,
                best=values["best"],
                base=values["base"],
                worst=values["worst"],
            )
        )

    results: list[ScenarioResult] = []

    for scenario in SCENARIOS:
        final_amount = _future_value(
            initial_amount=request.initial_amount,
            monthly_contribution=request.monthly_contribution,
            annual_return_rate=scenario.annual_return_rate,
            years=request.years,
        )
        profit_amount = final_amount - request.initial_amount - (
            request.monthly_contribution * request.years * 12
        )
        goal_gap = final_amount - request.goal_amount

        results.append(
            ScenarioResult(
                scenario=scenario.key,
                label=scenario.label,
                annual_return_rate=scenario.annual_return_rate,
                final_amount=round(final_amount, 2),
                profit_amount=round(profit_amount, 2),
                goal_gap=round(goal_gap, 2),
                goal_achieved=goal_gap >= 0,
            )
        )

    base_rate = next(item.annual_return_rate for item in SCENARIOS if item.key == "base")

    return SimulationResponse(
        initial_amount=request.initial_amount,
        goal_amount=request.goal_amount,
        years=request.years,
        monthly_contribution=request.monthly_contribution,
        scenarios=SCENARIOS,
        projections=projection_points,
        results=results,
        metrics=SimulationMetrics(
            required_annual_return_rate=_required_annual_return_rate(
                initial_amount=request.initial_amount,
                goal_amount=request.goal_amount,
                years=request.years,
            ),
            required_monthly_contribution_at_base_rate=_required_monthly_contribution(
                initial_amount=request.initial_amount,
                goal_amount=request.goal_amount,
                years=request.years,
                annual_return_rate=base_rate,
            ),
            base_rate=base_rate,
        ),
    )