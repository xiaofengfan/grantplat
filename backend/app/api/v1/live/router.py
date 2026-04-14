from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ....core.database import get_db
from ....schemas import LiveAccountCreate, LiveAccountResponse
from ....api.v1.auth.router import get_current_user
from ....schemas import UserResponse

router = APIRouter(prefix="/live", tags=["实盘交易"])


@router.get("/accounts")
def get_live_accounts(
    current_user: UserResponse = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    accounts = [
        {"id": 1, "broker_id": "CITIC", "broker_name": "中信证券", "account_no": "80088888", "account_type": "normal", "status": "active", "today_pnl": 12580.30},
        {"id": 2, "broker_id": "HT", "broker_name": "华泰证券", "account_no": "60066666", "account_type": "margin", "status": "active", "today_pnl": -3200.50},
    ]
    return accounts


@router.post("/accounts")
def add_live_account(
    account: LiveAccountCreate,
    current_user: UserResponse = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return {"message": "账户添加成功", "id": 1}


@router.get("/trades")
def get_live_trades(
    page: int = 1,
    page_size: int = 20,
    current_user: UserResponse = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    trades = [
        {"id": 1, "account_id": 1, "symbol": "600519", "name": "贵州茅台", "direction": "买入", "quantity": 100, "price": 1720.00, "status": "已成", "time": "2026-04-11 14:30:15"},
        {"id": 2, "account_id": 1, "symbol": "000858", "name": "五粮液", "direction": "卖出", "quantity": 200, "price": 145.00, "status": "已成", "time": "2026-04-11 14:25:32"},
    ]
    return {"items": trades, "total": len(trades)}


@router.get("/positions")
def get_live_positions(
    current_user: UserResponse = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    positions = [
        {"symbol": "600519", "name": "贵州茅台", "quantity": 100, "avg_cost": 1680.50, "current_price": 1720.30, "market_value": 172030, "profit": 3980},
    ]
    return positions


@router.post("/orders")
def place_order(
    symbol: str,
    direction: str,
    price: float,
    quantity: int,
    current_user: UserResponse = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return {"message": "委托已提交", "order_id": "202604110001"}


@router.delete("/orders/{order_id}")
def cancel_order(
    order_id: str,
    current_user: UserResponse = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return {"message": "委托已撤销"}
