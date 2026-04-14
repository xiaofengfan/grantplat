from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime
from enum import Enum


class UserType(str, Enum):
    FREE = "free"
    ADVANCED = "advanced"
    PROFESSIONAL = "professional"


class StrategyType(str, Enum):
    VISUAL = "visual"
    TEMPLATE = "template"
    CODE = "code"


class StrategyStatus(str, Enum):
    DRAFT = "draft"
    BACKTESTING = "backtesting"
    SIMULATING = "simulating"
    RUNNING = "running"
    STOPPED = "stopped"


class TradeDirection(str, Enum):
    BUY = "buy"
    SELL = "sell"


class AccountType(str, Enum):
    NORMAL = "normal"
    MARGIN = "margin"
    FUTURES = "futures"


class UserBase(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    email: EmailStr
    phone: Optional[str] = None


class UserCreate(UserBase):
    password: str = Field(..., min_length=6)


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserUpdate(BaseModel):
    username: Optional[str] = None
    phone: Optional[str] = None
    user_type: Optional[UserType] = None


class UserResponse(UserBase):
    id: int
    user_type: UserType
    is_active: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


class StrategyBase(BaseModel):
    name: str = Field(..., max_length=100)
    description: Optional[str] = None
    strategy_type: StrategyType = StrategyType.CODE
    market_type: List[str] = []
    config: dict = {}


class StrategyCreate(StrategyBase):
    code: Optional[str] = None


class StrategyUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    code: Optional[str] = None
    strategy_type: Optional[StrategyType] = None
    market_type: Optional[List[str]] = None
    config: Optional[dict] = None
    status: Optional[StrategyStatus] = None


class StrategyResponse(StrategyBase):
    id: int
    user_id: int
    status: StrategyStatus
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class BacktestCreate(BaseModel):
    start_date: str
    end_date: str
    initial_capital: float = 1000000


class BacktestDetails(BaseModel):
    equity_curve: List[float] = []
    daily_returns: List[float] = []
    positions: List[dict] = []
    trades: List[dict] = []


class BacktestResponse(BaseModel):
    id: int
    strategy_id: int
    start_date: str
    end_date: str
    initial_capital: float
    final_capital: float
    total_return: float
    max_drawdown: float
    sharpe_ratio: float
    win_rate: float
    profit_loss_ratio: float
    details: BacktestDetails
    created_at: datetime

    class Config:
        from_attributes = True


class LiveAccountCreate(BaseModel):
    broker_id: str
    account_no: str
    account_type: AccountType = AccountType.NORMAL
    password: str


class LiveAccountResponse(BaseModel):
    id: int
    user_id: int
    broker_id: str
    broker_name: Optional[str] = None
    account_no: str
    account_type: AccountType
    status: str
    created_at: datetime

    class Config:
        from_attributes = True


class RiskRuleCreate(BaseModel):
    rule_type: str
    rule_name: str
    rule_config: dict = {}
    enabled: bool = True


class RiskRuleUpdate(BaseModel):
    rule_name: Optional[str] = None
    rule_config: Optional[dict] = None
    enabled: Optional[bool] = None


class RiskRuleResponse(BaseModel):
    id: int
    user_id: int
    rule_type: str
    rule_name: str
    rule_config: dict
    enabled: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class RiskMetrics(BaseModel):
    total_value: float
    cash: float
    positions_value: float
    today_pnl: float
    total_pnl: float
    max_drawdown: float
    risk_exposure: float
    var: float
    order_frequency: int
    cancel_rate: float


class Quote(BaseModel):
    symbol: str
    name: str
    price: float
    change: float
    change_pct: float
    volume: int
    amount: float
    high: float
    low: float
    open: float
    prev_close: float
    timestamp: str


class KLine(BaseModel):
    date: str
    open: float
    high: float
    low: float
    close: float
    volume: int
    amount: float


class PaginatedResponse(BaseModel):
    items: List
    total: int
    page: int
    page_size: int


class ApiResponse(BaseModel):
    code: int = 0
    message: str = "success"
    data: Optional[dict | list] = None


class AlertType(str, Enum):
    PRICE = "price"
    CHANGE_PCT = "change_pct"
    VOLUME = "volume"
    AI_SIGNAL = "ai_signal"


class AlertCondition(str, Enum):
    ABOVE = "above"
    BELOW = "below"
    EQUAL = "equal"


class StockPoolCreate(BaseModel):
    symbol: str = Field(..., min_length=1, max_length=20)
    name: Optional[str] = None
    market: str = "A"
    group_name: Optional[str] = None
    notes: Optional[str] = None


class StockPoolUpdate(BaseModel):
    name: Optional[str] = None
    group_name: Optional[str] = None
    notes: Optional[str] = None


class StockPoolResponse(BaseModel):
    id: int
    user_id: int
    symbol: str
    name: Optional[str] = None
    market: str
    group_name: Optional[str] = None
    notes: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


class StockAlertCreate(BaseModel):
    symbol: str
    alert_type: AlertType
    threshold: float
    condition: AlertCondition


class StockAlertResponse(BaseModel):
    id: int
    user_id: int
    symbol: str
    alert_type: AlertType
    threshold: float
    condition: AlertCondition
    enabled: bool
    triggered_at: Optional[datetime] = None
    created_at: datetime

    class Config:
        from_attributes = True


class AIProvider(str, Enum):
    DEEPSEEK = "deepseek"
    OPENAI = "openai"
    QWEN = "qwen"
    KIMI = "kimi"


class AIModelInfo(BaseModel):
    id: str
    name: str
    provider: AIProvider
    description: str = ""


DEEPSEEK_MODELS = [
    AIModelInfo(id="deepseek-chat", name="DeepSeek Chat", provider=AIProvider.DEEPSEEK, description="通用对话模型"),
    AIModelInfo(id="deepseek-coder", name="DeepSeek Coder", provider=AIProvider.DEEPSEEK, description="代码生成模型"),
    AIModelInfo(id="deepseek-reasoner", name="DeepSeek Reasoner", provider=AIProvider.DEEPSEEK, description="推理模型"),
]

OPENAI_MODELS = [
    AIModelInfo(id="gpt-4o", name="GPT-4o", provider=AIProvider.OPENAI, description="最新旗舰模型"),
    AIModelInfo(id="gpt-4o-mini", name="GPT-4o Mini", provider=AIProvider.OPENAI, description="轻量级模型"),
    AIModelInfo(id="gpt-4-turbo", name="GPT-4 Turbo", provider=AIProvider.OPENAI, description="高性能模型"),
    AIModelInfo(id="gpt-3.5-turbo", name="GPT-3.5 Turbo", provider=AIProvider.OPENAI, description="快速对话模型"),
]

QWEN_MODELS = [
    AIModelInfo(id="qwen-plus", name="通义千问 Plus", provider=AIProvider.QWEN, description="增强版模型"),
    AIModelInfo(id="qwen-turbo", name="通义千问 Turbo", provider=AIProvider.QWEN, description="快速响应模型"),
    AIModelInfo(id="qwen-max", name="通义千问 Max", provider=AIProvider.QWEN, description="旗舰模型"),
]

KIMI_MODELS = [
    AIModelInfo(id="moonshot-v1-8k", name="Moonshot V1 8K", provider=AIProvider.KIMI, description="8K上下文"),
    AIModelInfo(id="moonshot-v1-32k", name="Moonshot V1 32K", provider=AIProvider.KIMI, description="32K上下文"),
    AIModelInfo(id="moonshot-v1-128k", name="Moonshot V1 128K", provider=AIProvider.KIMI, description="128K超长上下文"),
]

ALL_AI_MODELS = DEEPSEEK_MODELS + OPENAI_MODELS + QWEN_MODELS + KIMI_MODELS


class AIConfigCreate(BaseModel):
    provider: AIProvider = AIProvider.DEEPSEEK
    api_key: Optional[str] = None
    endpoint: Optional[str] = None
    model: str = "deepseek-chat"
    enabled: bool = True


class AIConfigUpdate(BaseModel):
    provider: Optional[AIProvider] = None
    api_key: Optional[str] = None
    endpoint: Optional[str] = None
    model: Optional[str] = None
    enabled: Optional[bool] = None


class AIConfigResponse(BaseModel):
    id: int
    user_id: int
    provider: AIProvider
    api_key: Optional[str] = None
    endpoint: Optional[str] = None
    model: str
    enabled: bool
    created_at: datetime
    updated_at: datetime
    model_name: Optional[str] = None

    class Config:
        from_attributes = True


class MessageRole(str, Enum):
    USER = "user"
    ASSISTANT = "assistant"
    SYSTEM = "system"


class AIChatRequest(BaseModel):
    message: str
    symbol: Optional[str] = None
    model: Optional[str] = None


class AIChatResponse(BaseModel):
    message: str
    role: MessageRole = MessageRole.ASSISTANT


class AIConversationResponse(BaseModel):
    id: int
    user_id: int
    symbol: Optional[str] = None
    role: MessageRole
    content: str
    created_at: datetime

    class Config:
        from_attributes = True


class AIAnalyzeRequest(BaseModel):
    symbol: str
    analysis_type: str = "comprehensive"


class AISignalResponse(BaseModel):
    id: int
    user_id: int
    symbol: str
    signal_type: str
    direction: str
    strength: int
    reason: Optional[str] = None
    generated_at: datetime

    class Config:
        from_attributes = True
