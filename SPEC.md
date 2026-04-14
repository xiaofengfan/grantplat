# 新一代股票量化交易平台 - 项目规范

## 1. 项目概述

### 项目名称
**QuantMaster** - 新一代股票量化交易平台

### 平台定位
本平台旨在整合当前主流量化平台的核心优势，解决行业现存的「云端 / 本地割裂、新手 / 专业需求无法兼顾、回测 / 实盘偏差大、合规风控缺失」等痛点，打造覆盖「入门学习 - 策略研发 - 回测验证 - 模拟仿真 - 实盘交易 - 合规风控」全链路的一站式量化交易平台。

### 核心目标用户
- 中小散户（入门级）
- 进阶投资者
- 专业机构

---

## 2. 技术架构

### 整体架构
```
┌─────────────────────────────────────────────────────────────┐
│                      前端层 (Web/PC/Mobile)                 │
├─────────────────────────────────────────────────────────────┤
│                      API 网关层                             │
├───────────────┬───────────────┬───────────────┬─────────────┤
│   策略开发服务 │   数据服务    │   交易执行服务 │   风控服务  │
├───────────────┴───────────────┴───────────────┴─────────────┤
│                      消息队列 (Kafka)                       │
├─────────────────────────────────────────────────────────────┤
│         回测引擎    │    模拟交易引擎    │    实盘交易引擎   │
├─────────────────────────────────────────────────────────────┤
│                      数据存储层                             │
│  (MySQL + Redis + MongoDB + Elasticsearch + HDF5/PyArrow) │
└─────────────────────────────────────────────────────────────┘
```

### 技术栈

#### 前端
- **框架**: React 18 + TypeScript + Vite
- **状态管理**: Zustand
- **UI组件**: Ant Design 5
- **图表**: ECharts
- **实时通信**: WebSocket

#### 后端
- **核心框架**: Python 3.12 + FastAPI
- **异步任务**: Celery + Redis
- **消息队列**: Kafka
- **数据库**: MySQL 8.0, Redis, MongoDB
- **回测引擎**: 自研高性能回测引擎 (C++/Python混合)
- **数据存储**: HDF5, Parquet

#### 基础设施
- **容器化**: Docker + Kubernetes
- **CI/CD**: GitHub Actions
- **监控**: Prometheus + Grafana

---

## 3. 功能模块设计

### 3.1 平台基础架构

#### 云端 + 本地双运行模式
- **云端托管模式**: 策略部署于平台服务器，7×24小时运行
- **本地部署模式**: 策略全量本地运行，代码/数据不上传
- 两种模式策略代码100%兼容，可无缝迁移

#### 全市场品种统一适配
- A股、港股通、美股、商品期货、股指期货、期权、两融、可转债、北交所
- 一套策略可适配跨市场跨品种场景

#### 多终端同步
- Web端、PC客户端、移动端三端数据同步

### 3.2 数据服务模块

#### 分层全量数据源
| 层级 | 数据类型 | 适用用户 |
|------|---------|---------|
| 免费基础 | A股20年日线/分钟线行情、基础财务数据、宏观数据 | 新手入门 |
| 进阶专业 | Tick级盘口数据、逐笔成交数据、因子库数据 | 策略研发 |
| 高端另类 | 产业链数据、舆情数据、电商消费数据、机构调研数据 | 深度研究 |

#### 数据自动清洗与校验
- 内置数据清洗引擎
- 自动修复停牌、除权除息、数据缺失等问题

#### 实时行情低延迟推送
- 云端模式行情延迟 < 100ms
- 本地模式行情延迟 < 10ms
- 支持Level-2行情接入

### 3.3 策略开发模块

#### 分层式开发界面
| 模式 | 适用人群 | 特点 |
|------|---------|------|
| 零代码拖拽 | 新手用户 | 可视化拖拽，3分钟完成基础策略 |
| 低代码模板 | 进阶投资者 | 数百种策略模板，仅调整参数 |
| 全代码开发 | 专业用户 | Python/C++/VBA，支持第三方库 |

#### AI大模型辅助开发
- 自然语言转策略代码
- 代码错误自动排查
- 策略优化建议

#### 策略加密与隐私保护
- 支持策略代码加密
- 分享时可仅开放运行权限

### 3.4 高精度回测模块

#### Tick级高精度回测引擎
- 基于全量历史Tick数据
- 支持多周期、多品种并行回测
- 回测结果与实盘贴合度 > 99%

#### 真实滑点与交易成本模拟
- 基于历史盘口数据动态计算滑点
- 模拟印花税、佣金、过户费、撤单费等全量交易成本

#### 未来函数自动检测
- 自动识别回测中使用未来数据的逻辑

#### 合规化回测仿真
- 内置最新监管规则
- 自动模拟监管限制

### 3.5 模拟交易模块

#### 全真模拟交易环境
- 完全复刻实盘行情、交易规则、手续费
- 支持T+0、T+1、涨跌停、停牌等真实场景

#### 多市场模拟支持
- A股、港股、美股、期货、期权全市场

#### 模拟盘绩效分析
- 自动生成绩效报告
- 收益曲线、最大回撤、夏普比率、胜率、盈亏比

### 3.6 实盘交易模块

#### 全券商低门槛对接
- 对接120+主流券商，覆盖95%以上市场份额
- 开通门槛低至10万日均资产，部分券商支持零门槛

#### 双模式交易执行
- 云端模式：报单延迟 < 50ms
- 本地模式：报单延迟 < 1ms

#### 自动合规报备
- 对接券商合规系统，自动完成账户、策略报备

#### 多账户统一管理
- 多券商账户、多资金账户统一管理
- 支持批量下单、分仓策略

### 3.7 全链路风险管理模块

#### 内置合规风控引擎
- 报单频率监控
- 撤单率监控
- 异常交易监控

#### 多层级交易风控
- 单票仓位限制
- 单日亏损限制
- 异常行情拦截
- 策略级、账户级止盈止损

#### 实时风险监控看板
- 仓位分布、风险敞口、VaR值
- 监管指标状态
- 风险预警推送

### 3.8 专业投研工具模块

#### 全链路投研工具链
- 因子分析、组合优化、绩效评估
- 风险归因、事件分析

#### 因子挖掘与分析工具
- 400+标准化因子库
- 因子有效性检验、ICIR分析

#### 绩效与风险归因
- Brinson归因、Fama-French多因子归因

### 3.9 用户分层与权限体系

#### 三级用户体系
| 版本 | 功能 | 定价 |
|------|------|------|
| 免费版 | 基础数据、零代码策略、基础回测、模拟盘 | 免费 |
| 进阶版 | Tick数据、全代码开发、实盘交易、基础风控 | 低月费 |
| 专业版 | 另类数据、C++高频接口、多账户管理、机构级风控 | 专业定价 |

### 3.10 股票池管理模块

#### 自选股票池
- 支持添加/删除关注的股票
- 支持股票分类管理（自定义分组）
- 支持股票搜索和批量添加
- 支持导入/导出股票列表

#### 实时行情监控
- WebSocket实时推送行情数据
- 支持价格提醒、涨跌幅提醒、成交量异常提醒
- 支持自定义监控指标和阈值
- 支持多周期K线查看

#### 交易提醒
- 价格到达提醒
- 涨跌幅提醒
- 异动提醒（成交量突增/突减）
- 交易信号提醒

### 3.11 AI智能分析模块

#### AI对接
- 支持DeepSeek API
- 支持OpenAI API（预留）
- 支持自定义AI endpoint配置

#### AI功能
- 股票基本面分析
- 技术面分析
- 策略诊断与优化建议
- 实时市场解读
- 智能问答

#### 交易信号
- AI生成的交易信号推送
- 信号提醒（App通知、邮件）
- 信号历史记录

---

## 4. 数据库设计

### 核心实体

#### 用户 (User)
```
- id: BIGINT PK
- username: VARCHAR(50)
- email: VARCHAR(100)
- phone: VARCHAR(20)
- user_type: ENUM('free', 'advanced', 'professional')
- created_at: DATETIME
- updated_at: DATETIME
```

#### 策略 (Strategy)
```
- id: BIGINT PK
- user_id: BIGINT FK
- name: VARCHAR(100)
- description: TEXT
- code: TEXT (加密存储)
- strategy_type: ENUM('visual', 'template', 'code')
- market_type: VARCHAR(50)
- status: ENUM('draft', 'backtesting', 'simulating', 'running', 'stopped')
- created_at: DATETIME
- updated_at: DATETIME
```

#### 回测结果 (BacktestResult)
```
- id: BIGINT PK
- strategy_id: BIGINT FK
- start_date: DATE
- end_date: DATE
- initial_capital: DECIMAL(18,2)
- final_capital: DECIMAL(18,2)
- total_return: DECIMAL(10,4)
- max_drawdown: DECIMAL(10,4)
- sharpe_ratio: DECIMAL(10,4)
- win_rate: DECIMAL(10,4)
- profit_loss_ratio: DECIMAL(10,4)
- details: JSON
- created_at: DATETIME
```

#### 模拟交易记录 (SimTrade)
```
- id: BIGINT PK
- user_id: BIGINT FK
- strategy_id: BIGINT FK
- symbol: VARCHAR(20)
- direction: ENUM('buy', 'sell')
- quantity: INT
- price: DECIMAL(10,4)
- commission: DECIMAL(10,4)
- trade_time: DATETIME
- created_at: DATETIME
```

#### 实盘账户 (LiveAccount)
```
- id: BIGINT PK
- user_id: BIGINT FK
- broker_id: VARCHAR(50)
- account_no: VARCHAR(50)
- account_type: ENUM('normal', 'margin', 'futures')
- status: ENUM('active', 'suspended', 'closed')
- created_at: DATETIME
```

#### 风控规则 (RiskRule)
```
- id: BIGINT PK
- user_id: BIGINT FK
- rule_type: VARCHAR(50)
- rule_config: JSON
- enabled: BOOLEAN
- created_at: DATETIME
```

#### 股票池 (StockPool)
```
- id: BIGINT PK
- user_id: BIGINT FK
- symbol: VARCHAR(20)
- name: VARCHAR(100)
- market: ENUM('A', 'HK', 'US')
- group_name: VARCHAR(50)
- notes: TEXT
- created_at: DATETIME
```

#### 股票提醒 (StockAlert)
```
- id: BIGINT PK
- user_id: BIGINT FK
- symbol: VARCHAR(20)
- alert_type: ENUM('price', 'change_pct', 'volume', 'ai_signal')
- threshold: DECIMAL(18,4)
- condition: ENUM('above', 'below', 'equal')
- enabled: BOOLEAN
- triggered_at: DATETIME
- created_at: DATETIME
```

#### AI配置 (AIConfig)
```
- id: BIGINT PK
- user_id: BIGINT FK
- provider: ENUM('deepseek', 'openai')
- api_key: VARCHAR(255)
- endpoint: VARCHAR(255)
- model: VARCHAR(50)
- enabled: BOOLEAN
- created_at: DATETIME
```

#### AI对话记录 (AIConversation)
```
- id: BIGINT PK
- user_id: BIGINT FK
- symbol: VARCHAR(20)
- role: ENUM('user', 'assistant')
- content: TEXT
- created_at: DATETIME
```

---

## 5. API设计

### 认证接口
- POST /api/v1/auth/register - 用户注册
- POST /api/v1/auth/login - 用户登录
- POST /api/v1/auth/logout - 用户登出
- GET /api/v1/auth/profile - 获取用户信息

### 策略管理接口
- GET /api/v1/strategies - 获取策略列表
- POST /api/v1/strategies - 创建策略
- GET /api/v1/strategies/{id} - 获取策略详情
- PUT /api/v1/strategies/{id} - 更新策略
- DELETE /api/v1/strategies/{id} - 删除策略
- POST /api/v1/strategies/{id}/backtest - 启动回测
- POST /api/v1/strategies/{id}/simulate - 启动模拟交易
- POST /api/v1/strategies/{id}/deploy - 部署实盘

### 数据服务接口
- GET /api/v1/data/quote - 获取行情数据
- GET /api/v1/data/history - 获取历史数据
- GET /api/v1/data/factors - 获取因子数据

### 回测接口
- GET /api/v1/backtests/{id} - 获取回测结果
- GET /api/v1/backtests/{id}/charts - 获取回测图表数据
- POST /api/v1/backtests/{id}/cancel - 取消回测

### 模拟交易接口
- GET /api/v1/sim/trades - 获取模拟交易记录
- GET /api/v1/sim/positions - 获取模拟持仓
- GET /api/v1/sim/performance - 获取模拟绩效

### 实盘交易接口
- GET /api/v1/live/accounts - 获取实盘账户列表
- GET /api/v1/live/trades - 获取实盘交易记录
- GET /api/v1/live/positions - 获取实盘持仓
- POST /api/v1/live/orders - 发送订单
- DELETE /api/v1/live/orders/{id} - 撤销订单

### 风控接口
- GET /api/v1/risk/rules - 获取风控规则
- POST /api/v1/risk/rules - 创建风控规则
- PUT /api/v1/risk/rules/{id} - 更新风控规则
- GET /api/v1/risk/monitor - 获取风控监控数据

### 股票池接口
- GET /api/v1/stockpool - 获取股票池列表
- POST /api/v1/stockpool - 添加股票到池中
- DELETE /api/v1/stockpool/{id} - 从池中移除股票
- PUT /api/v1/stockpool/{id} - 更新股票信息
- GET /api/v1/stockpool/quotes - 获取股票池实时行情
- POST /api/v1/stockpool/alerts - 添加提醒
- GET /api/v1/stockpool/alerts - 获取提醒列表
- DELETE /api/v1/stockpool/alerts/{id} - 删除提醒

### AI分析接口
- GET /api/v1/ai/config - 获取AI配置
- POST /api/v1/ai/config - 创建/更新AI配置
- POST /api/v1/ai/chat - 发送AI对话请求
- GET /api/v1/ai/conversations - 获取对话历史
- POST /api/v1/ai/analyze - 分析股票
- GET /api/v1/ai/signals - 获取AI交易信号

---

## 6. 项目目录结构

```
grantplat/
├── frontend/                    # 前端项目
│   ├── src/
│   │   ├── components/         # 公共组件
│   │   ├── pages/             # 页面
│   │   ├── services/          # API服务
│   │   ├── stores/            # 状态管理
│   │   ├── hooks/             # 自定义hooks
│   │   ├── utils/             # 工具函数
│   │   ├── types/             # TypeScript类型
│   │   └── App.tsx
│   ├── public/
│   ├── package.json
│   └── vite.config.ts
│
├── backend/                    # 后端项目
│   ├── app/
│   │   ├── api/               # API路由
│   │   │   └── v1/
│   │   │       ├── auth/
│   │   │       ├── strategy/
│   │   │       ├── data/
│   │   │       ├── backtest/
│   │   │       ├── sim/
│   │   │       ├── live/
│   │   │       └── risk/
│   │   ├── core/               # 核心配置
│   │   ├── models/             # 数据模型
│   │   ├── schemas/             # Pydantic模型
│   │   ├── services/           # 业务逻辑
│   │   ├── tasks/              # 异步任务
│   │   └── main.py
│   ├── tests/
│   ├── requirements.txt
│   └── Dockerfile
│
├── docs/                       # 文档
│
├── docker-compose.yml
│
└── README.md
```

---

## 7. 开发计划

### Phase 1: 基础架构 (1-2周)
- 项目脚手架搭建
- 前后端基础框架配置
- 数据库设计与初始化
- 认证系统实现

### Phase 2: 核心功能 (3-4周)
- 策略管理模块
- 数据服务模块
- 回测引擎核心

### Phase 3: 交易模块 (3-4周)
- 模拟交易系统
- 实盘交易对接
- 风控系统

### Phase 4: 高级功能 (2-3周)
- AI辅助开发
- 投研工具
- 社区功能

### Phase 5: 测试与优化 (2周)
- 全面测试
- 性能优化
- 部署上线

---

## 8. 验收标准

1. ✅ 用户可以完成注册、登录
2. ✅ 支持三种策略开发模式
3. ✅ 回测结果与实盘贴合度 > 99%
4. ✅ 支持120+券商对接
5. ✅ 完整的风控体系
6. ✅ 三端数据同步
7. ✅ 所有核心指标达到文档要求
