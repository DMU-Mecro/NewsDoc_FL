from functools import lru_cache

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # =====================================================
    # Project
    # =====================================================
    PROJECT_NAME: str = "NewsDocBe"
    API_V1_PREFIX: str = "/api/v1"

    # =====================================================
    # Database
    # =====================================================
    DATABASE_URL: str

    # =====================================================
    # Security / JWT
    # =====================================================
    SECRET_KEY: str
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440

    # =====================================================
    # Redis
    # =====================================================
    REDIS_URL: str | None = None

    # =====================================================
    # Kakao OAuth
    # =====================================================
    KAKAO_CLIENT_ID: str | None = None
    KAKAO_REDIRECT_URI: str | None = None

    # =====================================================
    # Gemini API Keys
    # 기존 analyzer.py, rag_engine.py 호환을 위해
    # GOOGLE_API_KEY와 GEMINI_API_KEY를 모두 지원합니다.
    # =====================================================
    GOOGLE_API_KEY: str | None = None
    GEMINI_API_KEY: str | None = None

    # =====================================================
    # Gemini Model Routing
    # Flash: 뉴스 기사 분석 / impact score / RAG용
    # Pro: 최종 리포트 생성용
    # =====================================================
    GEMINI_NEWS_ANALYSIS_MODEL: str = "gemini-3-flash-preview"
    GEMINI_RAG_MODEL: str = "gemini-3-flash-preview"
    GEMINI_REPORT_MODEL: str = "gemini-3.1-pro-preview"

    # =====================================================
    # Embedding / Vector DB
    # =====================================================
    GEMINI_EMBEDDING_MODEL: str = "models/gemini-embedding-2-preview"
    VECTOR_DB_PATH: str = "./data/vector_db"
    VECTOR_DB_COLLECTION: str = "macro_intelligence_db_2026"

    # =====================================================
    # MarketEcho Index Formula
    # Index = Sigma(Weight_i * impact_score_i)
    # =====================================================
    MARKETECHO_INDEX_BASE: float = 0.0

    WEIGHT_SENTIMENT: float = Field(default=0.35, ge=0)
    WEIGHT_BOND: float = Field(default=0.20, ge=0)
    WEIGHT_GOLD: float = Field(default=0.15, ge=0)
    WEIGHT_COPPER: float = Field(default=0.15, ge=0)
    WEIGHT_USD: float = Field(default=0.10, ge=0)
    WEIGHT_ENERGY: float = Field(default=0.05, ge=0)

    # =====================================================
    # News / Market Data
    # =====================================================
    RAW_DATA_PATH: str = "./data/raw"
    NEWS_LIMIT_YEAR: str = "2026"
    MARKET_DATA_PERIOD: str = "1mo"
    MARKET_DATA_INTERVAL: str = "1h"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore",
    )

    @property
    def active_gemini_api_key(self) -> str | None:
        """
        FastAPI 내부에서는 이 값을 사용하면 됩니다.

        우선순위:
        1. GEMINI_API_KEY
        2. GOOGLE_API_KEY

        기존 Python 코드가 GOOGLE_API_KEY를 사용하고 있으므로
        호환성을 위해 둘 다 지원합니다.
        """
        return self.GEMINI_API_KEY or self.GOOGLE_API_KEY

    @property
    def marketecho_weights(self) -> dict[str, float]:
        """
        MarketEcho Index 계산용 가중치입니다.

        Index = Sigma(Weight_i * impact_score_i)
        """
        return {
            "sentiment": self.WEIGHT_SENTIMENT,
            "bond": self.WEIGHT_BOND,
            "gold": self.WEIGHT_GOLD,
            "copper": self.WEIGHT_COPPER,
            "usd": self.WEIGHT_USD,
            "energy": self.WEIGHT_ENERGY,
        }

    @property
    def total_index_weight(self) -> float:
        """
        현재 설정된 가중치 총합입니다.
        보통 1.0에 가깝게 맞추는 것을 권장합니다.
        """
        return sum(self.marketecho_weights.values())


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()