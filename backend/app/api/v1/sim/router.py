from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ....core.database import get_db
from ....api.v1.auth.router import get_current_user
from ....schemas import UserResponse

router = APIRouter(prefix="/sim", tags=["模拟交易"])


@router.get("/trades")
def get_sim_trades(
    page: int = 1,
    page_size: int = 20,
    current_user: UserResponse = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    trades = [
        {"id": 1, "strategy_id": 1, "symbol": "600519", "name": "贵州茅台", "direction": "买入", "quantity": 100, "price": 1680.50, "amount": 168050, "commission": 50.42, "trade_time": "2026-04-11 10:30:15"},
        {"id": 2, "strategy_id": 1, "symbol": "000858", "name": "五粮液", "direction": "卖出", "quantity": 200, "price": 145.20, "amount": 29040, "commission": 8.71, "trade_time": "2026-04-11 10:15:32"},
    ]
    return {"items": trades, "total": len(trades)}


@router.get("/positions")
def get_sim_positions(
    current_user: UserResponse = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    positions = [
        {"symbol": "600519", "name": "贵州茅台", "quantity": 100, "avg_price": 1680.50, "current_price": 1720.30, "market_value": 172030, "profit": 3980},
        {"symbol": "000858", "name": "五粮液", "quantity": 200, "avg_price": 142.00, "current_price": 145.20, "market_value": 29040, "profit": 640},
    ]
    return positions


@router.get("/performance")
def get_sim_performance(
    current_user: UserResponse = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return {
        "total_value": 1035680.50,
        "initial_capital": 1000000,
        "total_pnl": 35680.50,
        "total_return": 3.57,
        "today_pnl": 12580.30,
        "max_drawdown": 5.2,
        "sharpe_ratio": 1.85,
        "win_rate": 62.5
    }
