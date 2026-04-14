import { useState, useEffect, useRef } from 'react'
import { Card, Input, Button, List, Space, Modal, Form, Select, message, Tag, Typography, Row, Col, Statistic, Collapse, Badge, Divider, Drawer, Tooltip, Spin } from 'antd'
import {
  SendOutlined, SettingOutlined, DeleteOutlined, RobotOutlined, UserOutlined, StockOutlined,
  ThunderboltOutlined, BarChartOutlined, LeftOutlined, RightOutlined, ExperimentOutlined,
  SafetyOutlined, DollarOutlined, RiseOutlined, FallOutlined, CrownOutlined, AlertOutlined,
  FundOutlined, CalendarOutlined, ClockCircleOutlined, CheckCircleOutlined, SyncOutlined,
  MenuOutlined, StarOutlined, BgColorsOutlined
} from '@ant-design/icons'
import { useSearchParams } from 'react-router-dom'
import api from '../services/api'
import { useAuthStore } from '../stores/authStore'
import { Capacitor } from '@capacitor/core'

const { Text, Paragraph } = Typography
const { Panel } = Collapse

interface Message {
  id: number
  role: 'user' | 'assistant'
  content: string
  symbol?: string
  analysis_data?: any
}

interface StockQuote {
  symbol: string
  name: string
  price: number
  change: number
  change_pct: number
  volume: number
  high: number
  low: number
  open: number
  prev_close: number
}

interface RecommendStock {
  symbol: string
  name: string
  reason: string
  risk_level: 'low' | 'medium' | 'high'
  potential: number
  direction: 'buy' | 'hold' | 'sell'
}

const analysisModules = [
  {
    key: 'technical',
    icon: <BarChartOutlined />,
    title: '技术分析',
    description: 'K线形态、均线系统、MACD、KDJ、布林带等',
    color: '#1890ff'
  },
  {
    key: 'fundamental',
    icon: <DollarOutlined />,
    title: '基本面分析',
    description: '财务指标、估值水平、行业地位、盈利能力',
    color: '#52c41a'
  },
  {
    key: 'risk',
    icon: <SafetyOutlined />,
    title: '风险评估',
    description: '市场风险、经营风险、政策风险、流动性风险',
    color: '#faad14'
  },
  {
    key: 'advice',
    icon: <CrownOutlined />,
    title: '投资建议',
    description: '综合分析后给出买入、卖出、持有建议',
    color: '#f5222d'
  },
  {
    key: 'market',
    icon: <FundOutlined />,
    title: '市场分析',
    description: '大盘走势、资金流向、市场情绪分析',
    color: '#722ed1'
  },
  {
    key: 'strategy',
    icon: <ExperimentOutlined />,
    title: '策略诊断',
    description: '量化策略回测诊断与优化建议',
    color: '#13c2c2'
  }
]

export default function AIAssistant() {
  const { user } = useAuthStore()
  const [searchParams] = useSearchParams()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [configVisible, setConfigVisible] = useState(false)
  const [analyzeSymbol, setAnalyzeSymbol] = useState('')
  const [analyzeName, setAnalyzeName] = useState('')
  const [stockQuote, setStockQuote] = useState<StockQuote | null>(null)
  const [form] = Form.useForm()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [drawerVisible, setDrawerVisible] = useState(false)
  const [recommendations, setRecommendations] = useState<RecommendStock[]>([])
  const [activeTab, setActiveTab] = useState('chat')
  const isMobile = Capacitor.isNativePlatform()

  useEffect(() => {
    const symbol = searchParams.get('symbol')
    const name = searchParams.get('name')
    if (symbol) {
      setAnalyzeSymbol(symbol)
      setAnalyzeName(name || symbol)
      loadStockQuote(symbol)
    }
    loadConversations()
    loadConfig()
    loadRecommendations()
  }, [searchParams])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const loadStockQuote = async (symbol: string) => {
    try {
      const res = await api.get('/stockpool/quotes')
      const quotes = res.data
      const quote = quotes.find((q: any) => q.symbol === symbol)
      if (quote) {
        setStockQuote(quote)
      }
    } catch (error) {
      console.error('加载股票行情失败', error)
    }
  }

  const loadConversations = async () => {
    try {
      const res = await api.get('/ai/conversations', { params: { limit: 50 } })
      const msgs = res.data.map((m: any) => ({
        id: m.id,
        role: m.role,
        content: m.content,
        symbol: m.symbol,
        analysis_data: m.analysis_data
      }))
      setMessages(msgs.reverse())
    } catch (error) {
      console.error('加载对话失败', error)
    }
  }

  const loadConfig = async () => {
    try {
      const res = await api.get('/ai/config')
      if (res.data) {
        form.setFieldsValue(res.data)
      } else {
        form.setFieldsValue({
          provider: 'deepseek',
          model: 'deepseek-chat',
          api_key: 'sk-9dd51ae0f2a0474fbb90ebfc00265baa'
        })
      }
    } catch (error) {
      form.setFieldsValue({
        provider: 'deepseek',
        model: 'deepseek-chat',
        api_key: 'sk-9dd51ae0f2a0474fbb90ebfc00265baa'
      })
    }
  }

  const loadRecommendations = async () => {
    try {
      const res = await api.get('/ai/signals', { params: { limit: 10 } })
      const stocks = res.data.map((s: any) => ({
        symbol: s.symbol,
        name: s.symbol,
        reason: s.reason?.substring(0, 100) || '',
        risk_level: (s.strength > 70 ? 'low' : s.strength > 40 ? 'medium' : 'high') as 'low' | 'medium' | 'high',
        potential: s.strength || 50,
        direction: s.direction as 'buy' | 'hold' | 'sell'
      }))
      setRecommendations(stocks)
    } catch (error) {
      console.error('加载推荐失败', error)
    }
  }

  const handleSend = async () => {
    if (!input.trim()) return
    const userMessage = { id: Date.now(), role: 'user' as const, content: input }
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setLoading(true)

    try {
      const res = await api.post('/ai/chat', { message: input, symbol: analyzeSymbol || undefined })
      const assistantMessage = {
        id: Date.now() + 1,
        role: 'assistant' as const,
        content: res.data.message,
        symbol: analyzeSymbol || undefined
      }
      setMessages(prev => [...prev, assistantMessage])
    } catch (error) {
      const errorMessage = {
        id: Date.now() + 1,
        role: 'assistant' as const,
        content: '抱歉，AI服务暂时不可用，请检查AI配置或稍后重试。'
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setLoading(false)
    }
  }

  const handleAnalyze = async () => {
    if (!analyzeSymbol.trim()) return
    setLoading(true)

    const userMsg = {
      id: Date.now(),
      role: 'user' as const,
      content: `请分析 ${analyzeSymbol} ${analyzeName} 的股票`,
      symbol: analyzeSymbol
    }
    setMessages(prev => [...prev, userMsg])

    try {
      const res = await api.post('/ai/analyze', {
        symbol: analyzeSymbol,
        analysis_type: 'comprehensive',
        include_quote: true
      })

      const assistantMessage = {
        id: Date.now() + 1,
        role: 'assistant' as const,
        content: res.data.analysis || res.data.message,
        symbol: analyzeSymbol,
        analysis_data: stockQuote ? {
          price: stockQuote.price,
          change: stockQuote.change,
          change_pct: stockQuote.change_pct,
          volume: stockQuote.volume,
          high: stockQuote.high,
          low: stockQuote.low
        } : undefined
      }
      setMessages(prev => [...prev, assistantMessage])
    } catch (error) {
      const errorMessage = {
        id: Date.now() + 1,
        role: 'assistant' as const,
        content: `抱歉，分析 ${analyzeSymbol} 时出现问题，请检查AI配置或网络连接。`
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setLoading(false)
    }
  }

  const handleQuickAnalyze = async (type: string) => {
    if (!analyzeSymbol) {
      message.warning('请先在股票池选择一个股票，或输入股票代码')
      return
    }
    setLoading(true)

    const module = analysisModules.find(m => m.key === type)
    const prompts: Record<string, string> = {
      'technical': `请对 ${analyzeSymbol} ${analyzeName} 进行详细的技术分析，包括：\n1. K线形态分析（是否形成特定形态如头肩顶、W底等）\n2. 均线系统分析（5/10/20/60日均线走势）\n3. MACD指标分析（金叉/死叉、柱状图变化）\n4. KDJ随机指标分析（超买超卖区域）\n5. 布林带分析（轨道支撑压力）\n6. 给出综合技术面判断`,
      'fundamental': `请对 ${analyzeSymbol} ${analyzeName} 进行基本面分析，包括：\n1. 公司主营业务及行业地位\n2. 财务指标分析（市盈率、市净率、ROE、毛利率）\n3. 成长性分析（营收增速、净利润增速）\n4. 估值水平评估（当前估值合理与否）\n5. 给出基本面综合评价`,
      'risk': `请对 ${analyzeSymbol} ${analyzeName} 进行风险评估，包括：\n1. 市场系统性风险（大盘影响）\n2. 个股非系统性风险（公司特有风险）\n3. 流动性风险（交易量是否充足）\n4. 政策风险（行业监管政策影响）\n5. 估值风险（是否存在高估）\n6. 列出主要风险点和风险等级`,
      'advice': `请对 ${analyzeSymbol} ${analyzeName} 给出投资建议，包括：\n1. 当前走势综合判断\n2. 关键支撑位和压力位\n3. 买入/卖出/持有建议及理由\n4. 建议仓位控制\n5. 止损位设置建议\n6. 预期收益和风险比`,
      'market': `请分析当前市场环境下 ${analyzeSymbol} ${analyzeName} 的表现，包括：\n1. 大盘走势对该股影响\n2. 所属板块表现\n3. 资金流向分析（主力净流入/流出）\n4. 市场情绪判断\n5. 给出短期操作建议`,
      'strategy': `请为 ${analyzeSymbol} ${analyzeName} 制定量化交易策略，包括：\n1. 适合的策略类型（趋势跟踪/均值回归/突破策略等）\n2. 关键参数建议（周期、阈值等）\n3. 风险控制方案\n4. 止盈止损策略\n5. 策略优势与局限性`
    }

    const userMsg = {
      id: Date.now(),
      role: 'user' as const,
      content: prompts[type] || `分析 ${analyzeSymbol}`,
      symbol: analyzeSymbol
    }
    setMessages(prev => [...prev, userMsg])

    try {
      const res = await api.post('/ai/analyze', {
        symbol: analyzeSymbol,
        analysis_type: type,
        message: prompts[type]
      })
      const assistantMessage = {
        id: Date.now() + 1,
        role: 'assistant' as const,
        content: res.data.analysis || res.data.message,
        symbol: analyzeSymbol
      }
      setMessages(prev => [...prev, assistantMessage])
    } catch (error) {
      message.error('分析失败')
    } finally {
      setLoading(false)
    }
  }

  const handleStockRecommend = async () => {
    setLoading(true)
    setActiveTab('recommend')

    const userMsg = {
      id: Date.now(),
      role: 'user' as const,
      content: '请推荐一些优质的股票，并说明推荐理由',
    }
    setMessages(prev => [...prev, userMsg])

    try {
      const res = await api.post('/ai/chat', {
        message: '你是一位专业的股票投资顾问，请根据当前市场情况，推荐3-5只有投资价值的股票，包括A股主板、创业板等。要求：\n1. 说明推荐理由\n2. 给出买入价格区间\n3. 提示主要风险\n4. 给出持有期限建议\n\n请用中文回答，格式清晰。',
        symbol: undefined
      })

      const assistantMessage = {
        id: Date.now() + 1,
        role: 'assistant' as const,
        content: res.data.message
      }
      setMessages(prev => [...prev, assistantMessage])

      message.success('股票推荐已生成')
    } catch (error) {
      message.error('推荐失败')
    } finally {
      setLoading(false)
    }
  }

  const handleBatchAnalysis = async () => {
    if (!analyzeSymbol) {
      message.warning('请先输入股票代码')
      return
    }
    setLoading(true)

    const userMsg = {
      id: Date.now(),
      role: 'user' as const,
      content: `请对 ${analyzeSymbol} ${analyzeName} 进行全面的量化分析，包括技术面、基本面、资金面、风险评估，并给出最终的投资建议。`,
      symbol: analyzeSymbol
    }
    setMessages(prev => [...prev, userMsg])

    try {
      const res = await api.post('/ai/analyze', {
        symbol: analyzeSymbol,
        analysis_type: 'comprehensive',
        include_quote: true
      })

      const assistantMessage = {
        id: Date.now() + 1,
        role: 'assistant' as const,
        content: `【${analyzeSymbol} ${analyzeName} 综合分析报告】\n\n${res.data.analysis || res.data.message}\n\n---\n📊 如需更详细的分析，请点击左侧对应模块。`,
        symbol: analyzeSymbol,
        analysis_data: stockQuote ? {
          price: stockQuote.price,
          change: stockQuote.change,
          change_pct: stockQuote.change_pct,
          volume: stockQuote.volume
        } : undefined
      }
      setMessages(prev => [...prev, assistantMessage])
    } catch (error) {
      message.error('分析失败')
    } finally {
      setLoading(false)
    }
  }

  const handleSaveConfig = async () => {
    try {
      await form.validateFields()
      const values = form.getFieldsValue()
      if (!values.api_key) {
        values.api_key = 'sk-9dd51ae0f2a0474fbb90ebfc00265baa'
      }
      await api.post('/ai/config', values)
      message.success('配置保存成功')
      setConfigVisible(false)
    } catch (error) {
      message.error('保存配置失败')
    }
  }

  const handleClear = async () => {
    try {
      await api.delete('/ai/conversations')
      setMessages([])
      message.success('对话已清除')
    } catch (error) {
      message.error('清除失败')
    }
  }

  const handleChangeStock = () => {
    setStockQuote(null)
    setAnalyzeSymbol('')
    setAnalyzeName('')
  }

  const renderSidebar = () => (
    <div style={{
      width: sidebarCollapsed ? 60 : 240,
      background: '#fff',
      borderRight: '1px solid #f0f0f0',
      padding: sidebarCollapsed ? '16px 8px' : 16,
      transition: 'all 0.3s',
      height: '100%',
      overflow: 'auto'
    }}>
      <div style={{ display: 'flex', justifyContent: sidebarCollapsed ? 'center' : 'space-between', marginBottom: 16, alignItems: 'center' }}>
        {!sidebarCollapsed && <Text strong>分析模块</Text>}
        <Button
          type="text"
          size="small"
          icon={sidebarCollapsed ? <RightOutlined /> : <LeftOutlined />}
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
      </div>

      <Collapse
        ghost
        activeKey={sidebarCollapsed ? [] : ['analysis']}
        style={{ background: 'transparent' }}
      >
        <Panel
          header={!sidebarCollapsed && <Text style={{ fontSize: 12 }}>快捷分析</Text>}
          key="analysis"
        >
          <Space direction="vertical" style={{ width: '100%' }} size={4}>
            {analysisModules.map(module => (
              <Tooltip title={sidebarCollapsed ? module.title : ''} placement="right">
                <Button
                  block
                  type={sidebarCollapsed ? 'text' : 'default'}
                  icon={module.icon}
                  onClick={() => handleQuickAnalyze(module.key)}
                  style={{
                    height: sidebarCollapsed ? 40 : 36,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
                    background: sidebarCollapsed ? (module.key === 'advice' ? '#f5222d10' : 'transparent') : undefined
                  }}
                >
                  {!sidebarCollapsed && (
                    <span>
                      <span style={{ color: module.color }}>{module.title}</span>
                    </span>
                  )}
                </Button>
              </Tooltip>
            ))}
          </Space>
        </Panel>
      </Collapse>

      <Divider style={{ margin: '12px 0' }} />

      {!sidebarCollapsed && (
        <>
          <Text type="secondary" style={{ fontSize: 12 }}>快捷操作</Text>
          <Space direction="vertical" style={{ width: '100%', marginTop: 8 }} size={4}>
            <Button block icon={<StarOutlined />} onClick={handleStockRecommend} style={{ textAlign: 'left' }}>
              智能荐股
            </Button>
            <Button block icon={<SyncOutlined />} onClick={handleBatchAnalysis} style={{ textAlign: 'left' }}>
              批量分析
            </Button>
            <Button block icon={<BgColorsOutlined />} onClick={() => setConfigVisible(true)} style={{ textAlign: 'left' }}>
              API配置
            </Button>
          </Space>
        </>
      )}

      {sidebarCollapsed && (
        <Space direction="vertical" size={4}>
          <Tooltip title="智能荐股" placement="right">
            <Button type="text" icon={<StarOutlined />} onClick={handleStockRecommend} style={{ width: 40, height: 40 }} />
          </Tooltip>
          <Tooltip title="批量分析" placement="right">
            <Button type="text" icon={<SyncOutlined />} onClick={handleBatchAnalysis} style={{ width: 40, height: 40 }} />
          </Tooltip>
          <Tooltip title="API配置" placement="right">
            <Button type="text" icon={<BgColorsOutlined />} onClick={() => setConfigVisible(true)} style={{ width: 40, height: 40 }} />
          </Tooltip>
        </Space>
      )}

      {!sidebarCollapsed && recommendations.length > 0 && (
        <>
          <Divider style={{ margin: '12px 0' }} />
          <Text type="secondary" style={{ fontSize: 12 }}>近期推荐</Text>
          <div style={{ marginTop: 8 }}>
            {recommendations.slice(0, 3).map((stock, idx) => (
              <div key={idx} style={{
                padding: '6px 8px',
                marginBottom: 4,
                background: '#f5f5f5',
                borderRadius: 4,
                cursor: 'pointer'
              }} onClick={() => {
                setAnalyzeSymbol(stock.symbol)
                setAnalyzeName(stock.name)
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Tag color={stock.direction === 'buy' ? 'red' : stock.direction === 'sell' ? 'green' : 'orange'} style={{ margin: 0 }}>
                    {stock.symbol}
                  </Tag>
                  <span style={{ fontSize: 10, color: stock.direction === 'buy' ? '#f5222d' : stock.direction === 'sell' ? '#52c41a' : '#faad14' }}>
                    {stock.direction === 'buy' ? '买入' : stock.direction === 'sell' ? '卖出' : '持有'}
                  </span>
                </div>
                <Text type="secondary" style={{ fontSize: 10 }} ellipsis>
                  {stock.reason.substring(0, 30)}...
                </Text>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )

  const renderMobileSidebar = () => (
    <Drawer
      title={<Space><RobotOutlined />AI分析模块</Space>}
      placement="left"
      onClose={() => setDrawerVisible(false)}
      open={drawerVisible}
      width={280}
    >
      <Collapse defaultActiveKey={['analysis']} ghost>
        <Panel header={<Text>快捷分析</Text>} key="analysis">
          <Space direction="vertical" style={{ width: '100%' }} size={4}>
            {analysisModules.map(module => (
              <Button
                key={module.key}
                block
                icon={module.icon}
                onClick={() => {
                  handleQuickAnalyze(module.key)
                  setDrawerVisible(false)
                }}
              >
                <span style={{ color: module.color }}>{module.title}</span>
              </Button>
            ))}
          </Space>
        </Panel>
      </Collapse>

      <Divider />

      <Space direction="vertical" style={{ width: '100%' }} size={4}>
        <Button block icon={<StarOutlined />} onClick={() => { handleStockRecommend(); setDrawerVisible(false); }}>
          智能荐股
        </Button>
        <Button block icon={<SyncOutlined />} onClick={() => { handleBatchAnalysis(); setDrawerVisible(false); }}>
          批量分析
        </Button>
        <Button block icon={<BgColorsOutlined />} onClick={() => { setConfigVisible(true); setDrawerVisible(false); }}>
          API配置
        </Button>
      </Space>

      {recommendations.length > 0 && (
        <>
          <Divider />
          <Text strong>近期推荐</Text>
          <List
            size="small"
            dataSource={recommendations.slice(0, 5)}
            style={{ marginTop: 8 }}
            renderItem={(item) => (
              <List.Item style={{ cursor: 'pointer', padding: '8px 0' }} onClick={() => {
                setAnalyzeSymbol(item.symbol)
                setAnalyzeName(item.name)
                setDrawerVisible(false)
              }}>
                <div>
                  <Space>
                    <Tag color={item.direction === 'buy' ? 'red' : item.direction === 'sell' ? 'green' : 'orange'}>
                      {item.symbol}
                    </Tag>
                    <Text>{item.name}</Text>
                  </Space>
                  <div>
                    <Text type="secondary" style={{ fontSize: 10 }}>{item.reason?.substring(0, 40)}...</Text>
                  </div>
                </div>
              </List.Item>
            )}
          />
        </>
      )}
    </Drawer>
  )

  return (
    <div style={{ height: 'calc(100vh - 180px)', display: 'flex' }}>
      {isMobile && renderMobileSidebar()}

      {!isMobile && renderSidebar()}

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {analyzeSymbol && stockQuote && (
          <Card size="small" style={{ marginBottom: 12, flexShrink: 0 }}>
            <Row gutter={16} align="middle" wrap>
              <Col>
                <Space wrap>
                  <Tag color="blue" icon={<StockOutlined />} style={{ fontSize: 14, padding: '4px 12px' }}>
                    {analyzeSymbol} {analyzeName}
                  </Tag>
                  {stockQuote && (
                    <>
                      <Text strong style={{ fontSize: 18 }}>{stockQuote.price.toFixed(2)}</Text>
                      <Text style={{ color: stockQuote.change >= 0 ? '#f5222d' : '#52c41a' }}>
                        {stockQuote.change >= 0 ? '+' : ''}{stockQuote.change.toFixed(2)} ({stockQuote.change_pct.toFixed(2)}%)
                      </Text>
                    </>
                  )}
                </Space>
              </Col>
              <Col flex="auto">
                <Space style={{ float: 'right', flexWrap: 'wrap' }}>
                  {isMobile && (
                    <Button size="small" icon={<MenuOutlined />} onClick={() => setDrawerVisible(true)} />
                  )}
                  <Button size="small" onClick={() => handleQuickAnalyze('technical')} icon={<BarChartOutlined />}>技术</Button>
                  <Button size="small" onClick={() => handleQuickAnalyze('fundamental')} icon={<DollarOutlined />}>基本面</Button>
                  <Button size="small" onClick={() => handleQuickAnalyze('risk')} icon={<SafetyOutlined />}>风险</Button>
                  <Button size="small" onClick={() => handleQuickAnalyze('advice')} type="primary" icon={<CrownOutlined />}>建议</Button>
                  <Button size="small" onClick={handleChangeStock}>切换</Button>
                </Space>
              </Col>
            </Row>
          </Card>
        )}

        <Card
          title={<Space><RobotOutlined />AI 智能助手</Space>}
          extra={
            <Space>
              {isMobile && <Button size="small" icon={<MenuOutlined />} onClick={() => setDrawerVisible(true)} />}
              <Button size="small" icon={<SettingOutlined />} onClick={() => setConfigVisible(true)}>设置</Button>
              <Button size="small" icon={<DeleteOutlined />} onClick={handleClear}>清空</Button>
            </Space>
          }
          style={{ flex: 1, display: 'flex', flexDirection: 'column' }}
          bodyStyle={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
        >
          <div style={{ flex: 1, overflow: 'auto', marginBottom: 12 }}>
            {messages.length === 0 && (
              <div style={{ textAlign: 'center', padding: 40, color: '#999' }}>
                <RobotOutlined style={{ fontSize: 48, marginBottom: 16 }} />
                <p>还没有任何对话</p>
                <p>输入股票代码进行AI分析，或直接向我提问</p>
                <Button type="primary" icon={<StarOutlined />} onClick={handleStockRecommend} style={{ marginTop: 16 }}>
                  智能荐股
                </Button>
              </div>
            )}
            <List
              dataSource={messages}
              renderItem={(item) => (
                <List.Item style={{ justifyContent: item.role === 'user' ? 'flex-end' : 'flex-start', border: 'none' }}>
                  <div style={{
                    maxWidth: '80%',
                    padding: '12px 16px',
                    borderRadius: 12,
                    background: item.role === 'user' ? '#1890ff' : '#f5f5f5',
                    color: item.role === 'user' ? '#fff' : '#333'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      {item.role === 'user' ? <UserOutlined /> : <RobotOutlined />}
                      <span style={{ fontSize: 12, opacity: 0.7 }}>{item.role === 'user' ? user?.username : 'AI量化助手'}</span>
                      {item.symbol && <Tag color="blue" style={{ margin: 0, fontSize: 10 }}>{item.symbol}</Tag>}
                    </div>
                    {item.analysis_data && (
                      <div style={{ background: 'rgba(0,0,0,0.05)', padding: 8, borderRadius: 8, marginBottom: 8, fontSize: 12 }}>
                        <Row gutter={12}>
                          <Col><Text type="secondary">现价:</Text> <Text strong>{item.analysis_data.price?.toFixed(2)}</Text></Col>
                          <Col><Text type="secondary">涨跌:</Text> <Text style={{ color: item.analysis_data.change >= 0 ? '#f5222d' : '#52c41a' }}>{item.analysis_data.change >= 0 ? '+' : ''}{item.analysis_data.change?.toFixed(2)}%</Text></Col>
                          <Col><Text type="secondary">成交量:</Text> {(item.analysis_data.volume / 10000).toFixed(0)}万</Col>
                        </Row>
                      </div>
                    )}
                    <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>{item.content}</div>
                  </div>
                </List.Item>
              )}
            />
            {loading && (
              <div style={{ textAlign: 'center', padding: 16 }}>
                <Spin tip="AI分析中..." />
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onPressEnter={handleSend}
              placeholder={analyzeSymbol ? `关于 ${analyzeSymbol} 的问题...` : '输入问题，AI助手为你解答...'}
              style={{ flex: 1, minWidth: 200 }}
              disabled={loading}
            />
            <Button type="primary" icon={<SendOutlined />} onClick={handleSend} loading={loading}>发送</Button>
          </div>

          <div style={{ marginTop: 12, display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            <Input
              value={analyzeSymbol}
              onChange={(e) => setAnalyzeSymbol(e.target.value.toUpperCase())}
              placeholder="股票代码"
              style={{ width: 100 }}
              disabled={loading}
            />
            <Button onClick={handleAnalyze} disabled={loading || !analyzeSymbol.trim()} type="primary" icon={<RobotOutlined />}>
              AI分析
            </Button>
            <Button onClick={handleStockRecommend} disabled={loading} icon={<StarOutlined />}>
              荐股
            </Button>
            <Text type="secondary" style={{ marginLeft: 8, fontSize: 12 }}>输入股票代码，获取专业分析</Text>
          </div>
        </Card>
      </div>

      <Modal title="AI 配置" open={configVisible} onCancel={() => setConfigVisible(false)} onOk={handleSaveConfig}>
        <Form form={form} layout="vertical">
          <Form.Item name="provider" label="AI服务商" rules={[{ required: true }]}>
            <Select>
              <Select.Option value="deepseek">DeepSeek</Select.Option>
              <Select.Option value="openai">OpenAI</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="api_key"
            label="API密钥"
            rules={[{ required: true, message: '请输入API密钥' }]}
            initialValue="sk-9dd51ae0f2a0474fbb90ebfc00265baa"
          >
            <Input.Password placeholder="请输入API密钥" defaultValue="sk-9dd51ae0f2a0474fbb90ebfc00265baa" />
          </Form.Item>
          <Form.Item name="endpoint" label="自定义Endpoint">
            <Input placeholder="可选，不填则使用默认地址" />
          </Form.Item>
          <Form.Item name="model" label="模型" rules={[{ required: true }]}>
            <Select>
              <Select.Option value="deepseek-chat">DeepSeek Chat</Select.Option>
              <Select.Option value="deepseek-coder">DeepSeek Coder</Select.Option>
              <Select.Option value="gpt-4">GPT-4</Select.Option>
              <Select.Option value="gpt-3.5-turbo">GPT-3.5</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="enabled" label="启用AI" valuePropName="checked" initialValue={true}>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}