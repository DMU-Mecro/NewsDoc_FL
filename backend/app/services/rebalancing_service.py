from app.schemas.rebalancing import (
    AssetType,
    MarketRegime,
    RebalancingActionItem,
    RebalancingAssetInput,
    RebalancingGapItem,
    RebalancingRequest,
    RebalancingResponse,
    RebalancingSummary,
    TargetWeightItem,
)


TARGET_WEIGHTS: dict[MarketRegime, dict[AssetType, float]] = {
    "risk_off": {
        "주식": 60.0,
        "예적금": 25.0,
        "현금": 15.0,
    },
    "neutral": {
        "주식": 70.0,
        "예적금": 20.0,
        "현금": 10.0,
    },
    "risk_on": {
        "주식": 80.0,
        "예적금": 10.0,
        "현금": 10.0,
    },
}

MARKET_REGIME_LABELS: dict[MarketRegime, str] = {
    "risk_off": "Risk-Off",
    "neutral": "Neutral",
    "risk_on": "Risk-On",
}

ASSET_TYPES: list[AssetType] = ["주식", "예적금", "현금"]


def _round_money(value: float) -> float:
    return round(value, 2)


def _round_weight(value: float) -> float:
    return round(value, 2)


def _get_asset_amount(asset: RebalancingAssetInput) -> float:
    if asset.total is not None:
        return float(asset.total)

    return float(asset.quantity) * float(asset.price)


def _sum_amounts_by_type(assets: list[RebalancingAssetInput]) -> dict[AssetType, float]:
    amounts: dict[AssetType, float] = {
        "주식": 0.0,
        "예적금": 0.0,
        "현금": 0.0,
    }

    for asset in assets:
        amounts[asset.type] += _get_asset_amount(asset)

    return amounts


def _calculate_risk_score(amounts: dict[AssetType, float], total_amount: float) -> int:
    if total_amount <= 0:
        return 0

    stock_weight = amounts["주식"] / total_amount
    cash_weight = amounts["현금"] / total_amount
    deposit_weight = amounts["예적금"] / total_amount

    raw_score = (stock_weight * 100 * 1.15) - (cash_weight * 100 * 0.25) - (deposit_weight * 100 * 0.15)

    return max(0, min(100, round(raw_score)))


def _get_risk_level(risk_score: int) -> str:
    if risk_score >= 75:
        return "높음"
    if risk_score >= 45:
        return "보통"
    return "낮음"


def _get_priority(gap_weight: float, amount: float) -> str:
    abs_gap = abs(gap_weight)

    if abs_gap >= 20 or amount >= 1000000:
        return "HIGH"
    if abs_gap >= 7 or amount >= 300000:
        return "MEDIUM"
    return "LOW"


def _build_action(
    action_id: int,
    asset_type: AssetType,
    difference_amount: float,
    gap_weight: float,
) -> RebalancingActionItem:
    amount = abs(difference_amount)
    action_type = "BUY" if difference_amount > 0 else "SELL"
    direction = "확대" if action_type == "BUY" else "축소"
    trade_text = "매수 또는 추가 납입" if action_type == "BUY" else "매도 또는 현금화"
    priority = _get_priority(gap_weight=gap_weight, amount=amount)

    return RebalancingActionItem(
        id=action_id,
        asset_type=asset_type,
        action_type=action_type,
        title=f"{asset_type} 비중 {abs(gap_weight):.2f}% {direction}",
        description=f"약 ₩{round(amount):,} 규모의 {trade_text}가 필요합니다.",
        amount=_round_money(amount),
        gap_weight=_round_weight(gap_weight),
        priority=priority,
    )


def _build_logic_list(
    amounts: dict[AssetType, float],
    total_amount: float,
    market_regime: MarketRegime,
    risk_score: int,
    is_rebalancing_needed: bool,
) -> list[str]:
    if total_amount <= 0:
        return [
            "등록된 자산이 없어 리밸런싱 계산을 수행할 수 없습니다.",
            "포트폴리오 화면에서 주식, 예적금, 현금 자산을 먼저 등록해야 합니다.",
            "자산 등록 후 이 화면에 다시 들어오면 백엔드 리밸런싱 API가 목표 비중과 실행 금액을 계산합니다.",
        ]

    stock_weight = (amounts["주식"] / total_amount) * 100
    deposit_weight = (amounts["예적금"] / total_amount) * 100
    cash_weight = (amounts["현금"] / total_amount) * 100
    regime_label = MARKET_REGIME_LABELS[market_regime]

    logic = [
        f"현재 시장 국면은 {regime_label} 기준으로 계산했습니다. 기본 목표 비중은 주식 {TARGET_WEIGHTS[market_regime]['주식']:.0f}%, 예적금 {TARGET_WEIGHTS[market_regime]['예적금']:.0f}%, 현금 {TARGET_WEIGHTS[market_regime]['현금']:.0f}%입니다.",
        f"현재 실제 비중은 주식 {stock_weight:.2f}%, 예적금 {deposit_weight:.2f}%, 현금 {cash_weight:.2f}%입니다.",
        f"주식 집중도와 안전자산 비중을 함께 반영한 위험 점수는 {risk_score}점입니다.",
    ]

    if is_rebalancing_needed:
        logic.append("목표 비중과 실제 비중의 차이가 존재하므로 일부 자산군의 비중 조정이 필요합니다.")
    else:
        logic.append("현재 비중이 목표 비중과 거의 일치하므로 즉시 조정할 필요는 낮습니다.")

    return logic


def run_rebalancing(request: RebalancingRequest) -> RebalancingResponse:
    amounts = _sum_amounts_by_type(request.assets)
    total_amount = sum(amounts.values())
    target_weights = TARGET_WEIGHTS[request.market_regime]

    gaps: list[RebalancingGapItem] = []
    actions: list[RebalancingActionItem] = []

    for asset_type in ASSET_TYPES:
        current_amount = amounts[asset_type]
        current_weight = (current_amount / total_amount * 100) if total_amount > 0 else 0.0
        target_weight = target_weights[asset_type]
        target_amount = total_amount * (target_weight / 100) if total_amount > 0 else 0.0
        difference_amount = target_amount - current_amount
        gap_weight = target_weight - current_weight

        gaps.append(
            RebalancingGapItem(
                name=asset_type,
                current_amount=_round_money(current_amount),
                target_amount=_round_money(target_amount),
                difference_amount=_round_money(difference_amount),
                current_weight=_round_weight(current_weight),
                target_weight=_round_weight(target_weight),
                gap_weight=_round_weight(gap_weight),
            )
        )

        if total_amount > 0 and abs(difference_amount) >= request.min_action_amount:
            actions.append(
                _build_action(
                    action_id=len(actions) + 1,
                    asset_type=asset_type,
                    difference_amount=difference_amount,
                    gap_weight=gap_weight,
                )
            )

    risk_score = _calculate_risk_score(amounts=amounts, total_amount=total_amount)
    is_rebalancing_needed = len(actions) > 0

    if total_amount > 0 and not actions:
        actions.append(
            RebalancingActionItem(
                id=1,
                asset_type="주식",
                action_type="HOLD",
                title="현재 비중 유지",
                description="목표 비중과 실제 비중의 차이가 작아 즉시 조정할 필요가 낮습니다.",
                amount=0,
                gap_weight=0,
                priority="LOW",
            )
        )

    return RebalancingResponse(
        summary=RebalancingSummary(
            total_amount=_round_money(total_amount),
            market_regime=request.market_regime,
            market_regime_label=MARKET_REGIME_LABELS[request.market_regime],
            risk_score=risk_score,
            risk_level=_get_risk_level(risk_score),
            confidence=0.82 if total_amount > 0 else 0.0,
            is_rebalancing_needed=is_rebalancing_needed,
        ),
        target_weights=[
            TargetWeightItem(name=asset_type, weight=target_weights[asset_type])
            for asset_type in ASSET_TYPES
        ],
        gaps=gaps,
        actions=actions,
        logic_list=_build_logic_list(
            amounts=amounts,
            total_amount=total_amount,
            market_regime=request.market_regime,
            risk_score=risk_score,
            is_rebalancing_needed=is_rebalancing_needed,
        ),
    )