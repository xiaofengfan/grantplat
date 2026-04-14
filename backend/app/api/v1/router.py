from fastapi import APIRouter
from .auth import router as auth_router
from .strategy import router as strategy_router
from .backtest import router as backtest_router
from .data import router as data_router
from .risk import router as risk_router
from .sim import router as sim_router
from .live import router as live_router
from .stockpool import router as stockpool_router
from .ai import router as ai_router
from .users import router as users_router
from .config import router as config_router
from .transactions import router as transactions_router
from .trading import router as trading_router

api_router = APIRouter()

api_router.include_router(auth_router)
api_router.include_router(strategy_router)
api_router.include_router(backtest_router)
api_router.include_router(data_router)
api_router.include_router(risk_router)
api_router.include_router(sim_router)
api_router.include_router(live_router)
api_router.include_router(stockpool_router)
api_router.include_router(ai_router)
api_router.include_router(users_router)
api_router.include_router(config_router)
api_router.include_router(transactions_router)
api_router.include_router(trading_router)