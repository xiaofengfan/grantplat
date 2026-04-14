from sqlalchemy import Column, Integer, String, DateTime, Enum as SQLEnum, Text, JSON, Boolean, ForeignKey, DECIMAL
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from ..core.database import Base


class UserType(str, enum.Enum):
    FREE = "free"
    ADVANCED = "advanced"
    PROFESSIONAL = "professional"


class StrategyType(str, enum.Enum):
    VISUAL = "visual"
    TEMPLATE = "template"
    CODE = "code"


class StrategyStatus(str, enum.Enum):
    DRAFT = "draft"
    BACKTESTING = "backtesting"
    SIMULATING = "simulating"
    RUNNING = "running"
    STOPPED = "stopped"


class TradeDirection(str, enum.Enum):
    BUY = "buy"
    SELL = "sell"


class AccountType(str, enum.Enum):
    NORMAL = "normal"
    MARGIN = "margin"
    FUTURES = "futures"


class AccountStatus(str, enum.Enum):
    ACTIVE = "active"
    SUSPENDED = "suspended"
    CLOSED = "closed"


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True, nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    phone = Column(String(20), nullable=True)
    user_type = Column(SQLEnum(UserType), default=UserType.FREE)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    strategies = relationship("Strategy", back_populates="user")
    accounts = relationship("LiveAccount", back_populates="user")
    risk_rules = relationship("RiskRule", back_populates="user")
    stock_pools = relationship("StockPool", back_populates="user")
    stock_alerts = relationship("StockAlert", back_populates="user")
    ai_config = relationship("AIConfig", back_populates="user", uselist=False)
    ai_conversations = relationship("AIConversation", back_populates="user")


class Strategy(Base):
    __tablename__ = "strategies"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    name = Column(String(100), nullable=False)
    description = Column(Text, nullable=True)
    code = Column(Text, nullable=True)
    strategy_type = Column(SQLEnum(StrategyType), default=StrategyType.CODE)
    market_type = Column(JSON, default=list)
    config = Column(JSON, default=dict)
    status = Column(SQLEnum(StrategyStatus), default=StrategyStatus.DRAFT)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="strategies")
    backtests = relationship("BacktestResult", back_populates="strategy")


class BacktestResult(Base):
    __tablename__ = "backtest_results"

    id = Column(Integer, primary_key=True, index=True)
    strategy_id = Column(Integer, ForeignKey("strategies.id"), nullable=False)
    start_date = Column(String(10), nullable=False)
    end_date = Column(String(10), nullable=False)
    initial_capital = Column(DECIMAL(18, 2), nullable=False)
    final_capital = Column(DECIMAL(18, 2), nullable=False)
    total_return = Column(DECIMAL(10, 4), nullable=False)
    max_drawdown = Column(DECIMAL(10, 4), nullable=False)
    sharpe_ratio = Column(DECIMAL(10, 4), nullable=False)
    win_rate = Column(DECIMAL(10, 4), nullable=False)
    profit_loss_ratio = Column(DECIMAL(10, 4), nullable=False)
    details = Column(JSON, default=dict)
    created_at = Column(DateTime, default=datetime.utcnow)

    strategy = relationship("Strategy", back_populates="backtests")


class SimTrade(Base):
    __tablename__ = "sim_trades"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    strategy_id = Column(Integer, ForeignKey("strategies.id"), nullable=False)
    symbol = Column(String(20), nullable=False)
    direction = Column(SQLEnum(TradeDirection), nullable=False)
    quantity = Column(Integer, nullable=False)
    price = Column(DECIMAL(10, 4), nullable=False)
    commission = Column(DECIMAL(10, 4), default=0)
    trade_time = Column(DateTime, default=datetime.utcnow)
    created_at = Column(DateTime, default=datetime.utcnow)


class LiveAccount(Base):
    __tablename__ = "live_accounts"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    broker_id = Column(String(50), nullable=False)
    broker_name = Column(String(100), nullable=True)
    account_no = Column(String(50), nullable=False)
    account_type = Column(SQLEnum(AccountType), default=AccountType.NORMAL)
    status = Column(SQLEnum(AccountStatus), default=AccountStatus.ACTIVE)
    config = Column(JSON, default=dict)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="accounts")


class RiskRule(Base):
    __tablename__ = "risk_rules"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    rule_type = Column(String(50), nullable=False)
    rule_name = Column(String(100), nullable=False)
    rule_config = Column(JSON, default=dict)
    enabled = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="risk_rules")


class StockPool(Base):
    __tablename__ = "stock_pools"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    symbol = Column(String(20), nullable=False, index=True)
    name = Column(String(100), nullable=True)
    market = Column(String(10), default="A")
    group_name = Column(String(50), nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="stock_pools")


class AlertType(str, enum.Enum):
    PRICE = "price"
    CHANGE_PCT = "change_pct"
    VOLUME = "volume"
    AI_SIGNAL = "ai_signal"


class AlertCondition(str, enum.Enum):
    ABOVE = "above"
    BELOW = "below"
    EQUAL = "equal"


class StockAlert(Base):
    __tablename__ = "stock_alerts"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    symbol = Column(String(20), nullable=False, index=True)
    alert_type = Column(SQLEnum(AlertType), nullable=False)
    threshold = Column(DECIMAL(18, 4), nullable=False)
    condition = Column(SQLEnum(AlertCondition), nullable=False)
    enabled = Column(Boolean, default=True)
    triggered_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="stock_alerts")


class AIProvider(str, enum.Enum):
    DEEPSEEK = "deepseek"
    OPENAI = "openai"


class AIConfig(Base):
    __tablename__ = "ai_configs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, unique=True)
    provider = Column(SQLEnum(AIProvider), default=AIProvider.DEEPSEEK)
    api_key = Column(String(255), nullable=True)
    endpoint = Column(String(255), nullable=True)
    model = Column(String(50), default="deepseek-chat")
    enabled = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="ai_config")


class MessageRole(str, enum.Enum):
    USER = "user"
    ASSISTANT = "assistant"
    SYSTEM = "system"


class AIConversation(Base):
    __tablename__ = "ai_conversations"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    symbol = Column(String(20), nullable=True)
    role = Column(SQLEnum(MessageRole), nullable=False)
    content = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="ai_conversations")


class AISignal(Base):
    __tablename__ = "ai_signals"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    symbol = Column(String(20), nullable=False, index=True)
    signal_type = Column(String(20), nullable=False)
    direction = Column(String(10), nullable=False)
    strength = Column(Integer, default=50)
    reason = Column(Text, nullable=True)
    generated_at = Column(DateTime, default=datetime.utcnow)
    created_at = Column(DateTime, default=datetime.utcnow)
