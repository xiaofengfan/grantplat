export type UserType = 'free' | 'advanced' | 'professional'
export type StrategyType = 'visual' | 'template' | 'code'
export type StrategyStatus = 'draft' | 'backtesting' | 'simulating' | 'running' | 'stopped'
export type MarketType = 'A' | 'HK' | 'US' | 'Futures' | 'Options' | 'Margin' | 'CB' | 'BJ'
export type TradeDirection = 'buy' | 'sell'
export type AccountType = 'normal' | 'margin' | 'futures'

export interface User {
  id: number
  username: string
  email: string
  phone?: string
  user_type: UserType
  created_at: string
  updated_at: string
}

export interface Strategy {
  id: number
  user_id: number
  name: string
  description: string
  code: string
  strategy_type: StrategyType
  market_type: MarketType[]
  status: StrategyStatus
  created_at: string
  updated_at: string
}

export interface BacktestResult {
  id: number
  strategy_id: number
  start_date: string
  end_date: string
  initial_capital: number
  final_capital: number
  total_return: number
  max_drawdown: number
  sharpe_ratio: number
  win_rate: number
  profit_loss_ratio: number
  details: BacktestDetails
  created_at: string
}

export interface BacktestDetails {
  equity_curve: number[]
  daily_returns: number[]
  positions: Position[]
  trades: Trade[]
}

export interface Position {
  date: string
  symbol: string
  quantity: number
  avg_price: number
  market_value: number
}

export interface Trade {
  date: string
  symbol: string
  direction: TradeDirection
  quantity: number
  price: number
  commission: number
}

export interface SimTrade {
  id: number
  user_id: number
  strategy_id: number
  symbol: string
  direction: TradeDirection
  quantity: number
  price: number
  commission: number
  trade_time: string
  created_at: string
}

export interface LiveAccount {
  id: number
  user_id: number
  broker_id: string
  broker_name: string
  account_no: string
  account_type: AccountType
  status: 'active' | 'suspended' | 'closed'
  created_at: string
}

export interface RiskRule {
  id: number
  user_id: number
  rule_type: string
  rule_config: RiskRuleConfig
  enabled: boolean
  created_at: string
}

export interface RiskRuleConfig {
  max_position_ratio?: number
  max_daily_loss?: number
  max_order_frequency?: number
  max_cancel_rate?: number
}

export interface RiskMetrics {
  total_value: number
  cash: number
  positions: Position[]
  today_pnl: number
  total_pnl: number
  max_drawdown: number
  risk_exposure: number
  var: number
  order_frequency: number
  cancel_rate: number
}

export interface Quote {
  symbol: string
  name: string
  price: number
  change: number
  change_pct: number
  volume: number
  amount: number
  high: number
  low: number
  open: number
  prev_close: number
  timestamp: string
}

export interface KLine {
  date: string
  open: number
  high: number
  low: number
  close: number
  volume: number
  amount: number
}

export interface ApiResponse<T> {
  code: number
  message: string
  data: T
}
