from typing import Literal

from pydantic import BaseModel, Field, field_validator


AssetType = Literal["주식", "예적금", "현금"]
MarketRegime = Literal["risk_off", "neutral", "risk_on"]
ActionType = Literal["BUY", "SELL", "HOLD"]
Priority = Literal["HIGH", "MEDIUM", "LOW"]


class RebalancingAssetInput(BaseModel):
    id: int | str | None = None
    name: str | None = None
    ticker: str | None = None
    type: AssetType = "주식"
    quantity: float = Field(default=0, ge=0)
    price: float = Field(default=0, ge=0)
    total: float | None = Field(default=None, ge=0)
    currency: str = "KRW"

    @field_validator("total", mode="before")
    @classmethod
    def parse_total(cls, value):
        if value is None or value == "":
            return None
        return value


class RebalancingRequest(BaseModel):
    assets: list[RebalancingAssetInput] = Field(default_factory=list)
    market_regime: MarketRegime = "risk_off"
    min_action_amount: float = Field(default=10000, ge=0)


class TargetWeightItem(BaseModel):
    name: AssetType
    weight: float


class RebalancingGapItem(BaseModel):
    name: AssetType
    current_amount: float
    target_amount: float
    difference_amount: float
    current_weight: float
    target_weight: float
    gap_weight: float


class RebalancingActionItem(BaseModel):
    id: int
    asset_type: AssetType
    action_type: ActionType
    title: str
    description: str
    amount: float
    gap_weight: float
    priority: Priority


class RebalancingSummary(BaseModel):
    total_amount: float
    market_regime: MarketRegime
    market_regime_label: str
    risk_score: int
    risk_level: str
    confidence: float
    is_rebalancing_needed: bool


class RebalancingResponse(BaseModel):
    summary: RebalancingSummary
    target_weights: list[TargetWeightItem]
    gaps: list[RebalancingGapItem]
    actions: list[RebalancingActionItem]
    logic_list: list[str]