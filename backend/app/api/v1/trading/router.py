from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel
from ....core.database import get_db
from ....schemas import UserResponse
from ....api.v1.auth.router import get_current_user
from ....services.trading_engine import engine, SignalType

router = APIRouter(prefix="/trading", tags=["自动交易"])


class StrategyConfig(BaseModel):
    strategy_id: str
    name: str
    type: str
    symbols: List[str]
    enabled: bool = True


class ManualOrderRequest(BaseModel):
    symbol: str
    direction: str
    price: float
    quantity: int


class SignalResponse(BaseModel):
    id: int
    symbol: str
    signal_type: str
    price: float
    quantity: int
    strength: float
    reason: str
    timestamp: str


@router.get("/status")
def get_status(
    current_user: UserResponse = Depends(get_current_user),
):
    return {
        "running": engine.running,
        "strategies_count": len(engine.strategy_configs),
        "positions_count": len(engine.positions),
        "orders_count": len(engine.orders),
        "signals_count": len(engine.signals),
    }


@router.post("/start")
async def start_engine(
    current_user: UserResponse = Depends(get_current_user),
):
    if engine.running:
        return {"status": "already_running", "message": "交易引擎已在运行中"}
    result = await engine.start()
    return result


@router.post("/stop")
async def stop_engine(
    current_user: UserResponse = Depends(get_current_user),
):
    if not engine.running:
        return {"status": "already_stopped", "message": "交易引擎已停止"}
    result = await engine.stop()
    return result


@router.get("/signals")
def get_signals(
    limit: int = 20,
    current_user: UserResponse = Depends(get_current_user),
):
    return engine.get_signals(limit)


@router.get("/positions")
def get_positions(
    current_user: UserResponse = Depends(get_current_user),
):
    return engine.get_positions()


@router.get("/orders")
def get_orders(
    limit: int = 50,
    current_user: UserResponse = Depends(get_current_user),
):
    return engine.get_orders(limit)


@router.post("/orders")
async def create_order(
    order: ManualOrderRequest,
    current_user: UserResponse = Depends(get_current_user),
):
    if order.direction not in ["buy", "sell"]:
        raise HTTPException(status_code=400, detail="direction必须是buy或sell")
    result = await engine.manual_order(
        symbol=order.symbol,
        direction=order.direction,
        price=order.price,
        quantity=order.quantity
    )
    return {
        "id": result.id,
        "symbol": result.symbol,
        "direction": result.direction,
        "price": result.price,
        "quantity": result.quantity,
        "status": result.status.value,
    }


@router.post("/signals/{signal_id}/execute")
async def execute_signal(
    signal_id: int,
    current_user: UserResponse = Depends(get_current_user),
):
    signals = engine.get_signals(100)
    if signal_id >= len(signals):
        raise HTTPException(status_code=404, detail="信号不存在")

    signal_data = signals[signal_id]
    signal = SignalType(signal_data["signal_type"])
    from ....services.trading_engine import TradingSignal
    from datetime import datetime

    trading_signal = TradingSignal(
        symbol=signal_data["symbol"],
        signal_type=signal,
        price=signal_data["price"],
        quantity=signal_data["quantity"],
        strength=signal_data["strength"],
        reason=signal_data["reason"],
        timestamp=datetime.fromisoformat(signal_data["timestamp"])
    )

    order = await engine.execute_signal(trading_signal)
    return {
        "message": "信号已执行",
        "order_id": order.id,
        "status": order.status.value,
    }


@router.post("/strategies")
def add_strategy(
    config: StrategyConfig,
    current_user: UserResponse = Depends(get_current_user),
):
    engine.add_strategy(
        config.strategy_id,
        {
            "name": config.name,
            "type": config.type,
            "symbols": config.symbols,
            "enabled": config.enabled,
        }
    )
    return {"message": "策略已添加", "strategy_id": config.strategy_id}


@router.delete("/strategies/{strategy_id}")
def remove_strategy(
    strategy_id: str,
    current_user: UserResponse = Depends(get_current_user),
):
    engine.remove_strategy(strategy_id)
    return {"message": "策略已移除"}


@router.get("/strategies")
def list_strategies(
    current_user: UserResponse = Depends(get_current_user),
):
    return [
        {"strategy_id": k, **v}
        for k, v in engine.strategy_configs.items()
    ]