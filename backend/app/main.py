from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1.analysis import router as analysis_router
from app.api.v1.auth import router as auth_router
from app.api.v1.market import router as market_router
from app.api.v1.news import router as news_router
from app.api.v1.portfolio import router as portfolio_router
from app.api.v1.reports import router as reports_router
from app.api.v1.rebalancing import router as rebalancing_router
from app.api.v1.simulation import router as simulation_router
from app.core.config import settings


app = FastAPI(
    title=settings.PROJECT_NAME,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:4000",
        "http://127.0.0.1:4000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {
        "message": "NewsDocBe API is running"
    }


@app.get("/health")
def health_check():
    return {
        "status": "ok"
    }


app.include_router(
    auth_router,
    prefix=settings.API_V1_PREFIX,
)

app.include_router(
    portfolio_router,
    prefix=settings.API_V1_PREFIX,
)

app.include_router(
    market_router,
    prefix=settings.API_V1_PREFIX,
)

app.include_router(
    news_router,
    prefix=settings.API_V1_PREFIX,
)

app.include_router(
    reports_router,
    prefix=settings.API_V1_PREFIX,
)

app.include_router(
    analysis_router,
    prefix=settings.API_V1_PREFIX,
)

app.include_router(
    simulation_router,
    prefix=settings.API_V1_PREFIX,
)

app.include_router(
    rebalancing_router,
    prefix=settings.API_V1_PREFIX,
)