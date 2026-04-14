import asyncio
import random
from datetime import datetime
from typing import List, Dict, Optional
from dataclasses import dataclass, field
from enum import Enum


class SignalType(Enum):
    BUY = "buy"
    SELL = "sell"
    HOLD = "hold"


class OrderStatus(Enum):
    PENDING = "pending"
    FILLED = "filled"
    CANCELLED = "cancelled"
    REJECTED = "rejected"


@dataclass
class TradingSignal:
    symbol: str
    signal_type: SignalType
    price: float
    quantity: int
    strength: float
    reason: str
    timestamp: datetime = field(default_factory=datetime.now)


@dataclass
class Order:
    id: str
    symbol: str
    direction: str
    price: float
    quantity: int
    status: OrderStatus
    filled_price: float = 0
    filled_quantity: int = 0
    created_at: datetime = field(default_factory=datetime.now)
    filled_at: Optional[datetime] = None


@dataclass
class Position:
    symbol: str
    quantity: int
    avg_cost: float
    current_price: float = 0

    @property
    def market_value(self) -> float:
        return self.quantity * self.current_price

    @property
    def profit(self) -> float:
        return (self.current_price - self.avg_cost) * self.quantity


class TradingAutomationEngine:
    def __init__(self):
        self.running = False
        self.positions: Dict[str, Position] = {}
        self.orders: List[Order] = []
        self.signals: List[TradingSignal] = []
        self.strategy_configs: Dict[str, dict] = {}
        self._task: Optional[asyncio.Task] = None

    def add_strategy(self, strategy_id: str, config: dict):
        self.strategy_configs[strategy_id] = config

    def remove_strategy(self, strategy_id: str):
        if strategy_id in self.strategy_configs:
            del self.strategy_configs[strategy_id]

    async def start(self):
        self.running = True
        self._task = asyncio.create_task(self._run_loop())
        return {"status": "started", "message": "交易引擎已启动"}

    async def stop(self):
        self.running = False
        if self._task:
            self._task.cancel()
            try:
                await self._task
            except asyncio.CancelledError:
                pass
        return {"status": "stopped", "message": "交易引擎已停止"}

    async def _run_loop(self):
        while self.running:
            try:
                await self._check_signals()
                await self._check_orders()
                await asyncio.sleep(5)
            except asyncio.CancelledError:
                break
            except Exception as e:
                print(f"Engine error: {e}")
                await asyncio.sleep(5)

    async def _check_signals(self):
        for strategy_id, config in self.strategy_configs.items():
            symbols = config.get("symbols", [])
            for symbol in symbols:
                signal = await self._generate_signal(symbol, config)
                if signal and signal.signal_type != SignalType.HOLD:
                    self.signals.append(signal)

    async def _generate_signal(self, symbol: str, config: dict) -> Optional[TradingSignal]:
        strategy_type = config.get("type", "ma_cross")
        base_price = 100.0 + random.uniform(-20, 50)
        change_pct = random.uniform(-5, 5)

        if strategy_type == "ma_cross":
            signal_type = self._ma_cross_signal(change_pct)
            reason = "均线金叉" if signal_type == SignalType.BUY else "均线死叉" if signal_type == SignalType.SELL else "趋势不明"
        elif strategy_type == "rsi":
            signal_type = self._rsi_signal(change_pct)
            reason = "RSI超卖" if signal_type == SignalType.BUY else "RSI超买" if signal_type == SignalType.SELL else "RSI正常"
        elif strategy_type == "bollinger":
            signal_type = self._bollinger_signal(change_pct)
            reason = "布林带突破上轨" if signal_type == SignalType.BUY else "布林带跌破下轨" if signal_type == SignalType.SELL else "布林带内震荡"
        else:
            signal_type = SignalType.HOLD
            reason = "无信号"

        return TradingSignal(
            symbol=symbol,
            signal_type=signal_type,
            price=round(base_price, 2),
            quantity=100,
            strength=abs(change_pct) * 20,
            reason=reason
        )

    def _ma_cross_signal(self, change_pct: float) -> SignalType:
        if change_pct > 1.5:
            return SignalType.BUY
        elif change_pct < -1.5:
            return SignalType.SELL
        return SignalType.HOLD

    def _rsi_signal(self, change_pct: float) -> SignalType:
        if change_pct < -2:
            return SignalType.BUY
        elif change_pct > 2:
            return SignalType.SELL
        return SignalType.HOLD

    def _bollinger_signal(self, change_pct: float) -> SignalType:
        if change_pct > 2.5:
            return SignalType.SELL
        elif change_pct < -2.5:
            return SignalType.BUY
        return SignalType.HOLD

    async def _check_orders(self):
        for order in self.orders:
            if order.status == OrderStatus.PENDING:
                await self._fill_order(order)

    async def _fill_order(self, order: Order):
        await asyncio.sleep(1)
        order.status = OrderStatus.FILLED
        order.filled_at = datetime.now()
        order.filled_price = order.price
        order.filled_quantity = order.quantity

        if order.direction == "buy" and order.status == OrderStatus.FILLED:
            if order.symbol in self.positions:
                pos = self.positions[order.symbol]
                total_qty = pos.quantity + order.quantity
                pos.avg_cost = (pos.avg_cost * pos.quantity + order.price * order.quantity) / total_qty
                pos.quantity = total_qty
            else:
                self.positions[order.symbol] = Position(
                    symbol=order.symbol,
                    quantity=order.quantity,
                    avg_cost=order.price,
                    current_price=order.price
                )
        elif order.direction == "sell" and order.status == OrderStatus.FILLED:
            if order.symbol in self.positions:
                pos = self.positions[order.symbol]
                pos.quantity -= order.quantity
                if pos.quantity <= 0:
                    del self.positions[order.symbol]

    async def execute_signal(self, signal: TradingSignal) -> Order:
        order = Order(
            id=f"ORD_{len(self.orders) + 1}_{int(datetime.now().timestamp())}",
            symbol=signal.symbol,
            direction=signal.signal_type.value,
            price=signal.price,
            quantity=signal.quantity,
            status=OrderStatus.PENDING
        )
        self.orders.append(order)
        await self._fill_order(order)
        return order

    async def manual_order(self, symbol: str, direction: str, price: float, quantity: int) -> Order:
        order = Order(
            id=f"ORD_{len(self.orders) + 1}_{int(datetime.now().timestamp())}",
            symbol=symbol,
            direction=direction,
            price=price,
            quantity=quantity,
            status=OrderStatus.PENDING
        )
        self.orders.append(order)
        await self._fill_order(order)
        return order

    def get_positions(self) -> List[Dict]:
        return [
            {
                "symbol": pos.symbol,
                "quantity": pos.quantity,
                "avg_cost": pos.avg_cost,
                "current_price": pos.current_price,
                "market_value": pos.market_value,
                "profit": pos.profit,
                "profit_pct": (pos.current_price / pos.avg_cost - 1) * 100 if pos.avg_cost > 0 else 0
            }
            for pos in self.positions.values()
        ]

    def get_orders(self, limit: int = 50) -> List[Dict]:
        return [
            {
                "id": o.id,
                "symbol": o.symbol,
                "direction": o.direction,
                "price": o.price,
                "quantity": o.quantity,
                "status": o.status.value,
                "filled_price": o.filled_price,
                "filled_quantity": o.filled_quantity,
                "created_at": o.created_at.isoformat(),
                "filled_at": o.filled_at.isoformat() if o.filled_at else None
            }
            for o in sorted(self.orders, key=lambda x: x.created_at, reverse=True)[:limit]
        ]

    def get_signals(self, limit: int = 20) -> List[Dict]:
        return [
            {
                "symbol": s.symbol,
                "signal_type": s.signal_type.value,
                "price": s.price,
                "quantity": s.quantity,
                "strength": min(s.strength, 100),
                "reason": s.reason,
                "timestamp": s.timestamp.isoformat()
            }
            for s in sorted(self.signals, key=lambda x: x.timestamp, reverse=True)[:limit]
        ]


engine = TradingAutomationEngine()
