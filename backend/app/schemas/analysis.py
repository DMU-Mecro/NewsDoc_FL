from pydantic import BaseModel, Field


class DataUpdateResponse(BaseModel):
    news_count: int
    market_rows: int
    vectorized_news_count: int
    message: str


class NewsImpactItem(BaseModel):
    title: str
    url: str | None = None
    published_at: str | None = None
    source: str | None = None
    sentiment_score: float
    impact_score: float
    impact_factor: str
    analysis: str


class NewsImpactResponse(BaseModel):
    count: int
    items: list[NewsImpactItem]


class MarketEchoFactor(BaseModel):
    name: str
    weight: float
    impact_score: float
    weighted_score: float


class MarketEchoIndexResponse(BaseModel):
    index_score: float
    factors: list[MarketEchoFactor]
    formula: str = "Index = Sigma(Weight_i * impact_score_i)"


class SourceArticle(BaseModel):
    id: str
    title: str
    url: str | None = None
    media: str | None = None
    source: str | None = None
    published_at: str | None = None
    score: float | None = None


class RagAnalysisRequest(BaseModel):
    topic: str = Field(..., min_length=1, max_length=200)
    index_score: float | None = None


class RagAnalysisResponse(BaseModel):
    topic: str
    index_score: float | None = None
    retrieved_count: int
    content: str
    factors: list[str] = []
    confidence_score: int = 50
    source_articles: list[SourceArticle] = []


class BriefingResponse(BaseModel):
    title: str
    summary: str
    impacts: list[str] = []
    recommendation: str
    index_score: float | None = None
    confidence_score: int = 50
    source_articles: list[SourceArticle] = []