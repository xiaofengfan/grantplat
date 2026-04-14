import { useState, useEffect, useRef } from 'react'
import { Card, Input, Button, List, Space, Modal, Form, Select, message, Tag, Typography, Row, Col, Divider, Drawer, Tooltip, Spin, Dropdown, Badge, Alert, Tabs } from 'antd'
import {
  SendOutlined, SettingOutlined, DeleteOutlined, RobotOutlined, UserOutlined, StockOutlined,
  ThunderboltOutlined, BarChartOutlined, LeftOutlined, RightOutlined, ExperimentOutlined,
  SafetyOutlined, DollarOutlined, CrownOutlined, StarOutlined, BgColorsOutlined,
  MenuOutlined, DownOutlined, CheckCircleOutlined, SyncOutlined, LineChartOutlined,
  RiseOutlined, FallOutlined
} from '@ant-design/icons'
import { useSearchParams } from 'react-router-dom'
import ReactECharts from 'echarts-for-react'
import api from '../services/api'
import { useAuthStore } from '../stores/authStore'
import { Capacitor } from '@capacitor/core'

const { Text } = Typography

interface Message {
  id: number
  role: 'user' | 'assistant'
  content: string
  symbol?: string
  model?: string
  analysis_data?: any
}

interface AIModel {
  id: string
  name: string
  provider: string
  description: string
}

interface AIProvider {
  id: string
  name: string
}

interface StockQuote {
  symbol: string
  name: string
  price: number
  change: number
  changePct: number
  volume: number
  amount: number
  high: number
  low: number
  open: number
  prevClose: number
}

interface ChartData {
  price: number[]
  volumes: number[]
  macd: number[]
  signal: number[]
  kdj: number[]
  dates: string[]
}

const analysisModules = [
  { key: 'technical', icon: <BarChartOutlined />, title: '技术分析', color: '#1890ff' },
  { key: 'fundamental', icon: <DollarOutlined />, title: '基本面', color: '#52c41a' },
  { key: 'risk', icon: <SafetyOutlined />, title: '风险评估', color: '#faad14' },
  { key: 'advice', icon: <CrownOutlined />, title: '投资建议', color: '#f5222d' },
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
  const [form] = Form.useForm()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [drawerVisible, setDrawerVisible] = useState(false)
  const [activeTab, setActiveTab] = useState('chat')
  const isMobile = Capacitor.isNativePlatform()

  const [models, setModels] = useState<AIModel[]>([])
  const [providers, setProviders] = useState<AIProvider[]>([])
  const [currentModel, setCurrentModel] = useState<string>('')
  const [currentProvider, setCurrentProvider] = useState<string>('')
  const [viewMode, setViewMode] = useState<'chat' | 'chart'>('chat')
  const [currentQuote, setCurrentQuote] = useState<StockQuote | null>(null)
  const [chartData, setChartData] = useState<ChartData | null>(null)
  const [chartTab, setChartTab] = useState('minute')

  useEffect(() => {
    loadModels()
    loadConfig()
    const symbol = searchParams.get('symbol')
    const name = searchParams.get('name')
    if (symbol) {
      setAnalyzeSymbol(symbol)
      setAnalyzeName(name || symbol)
    }
  }, [searchParams])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const loadModels = async () => {
    try {
      const res = await api.get('/ai/models')
      setModels(res.data.models || [])
      setProviders(res.data.providers || [])
    } catch (error) {
      console.error('加载模型列表失败', error)
    }
  }

  const loadConfig = async () => {
    try {
      const res = await api.get('/ai/config')
      if (res.data) {
        form.setFieldsValue({
          provider: res.data.provider,
          api_key: res.data.api_key,
          model: res.data.model,
          enabled: res.data.enabled
        })
        setCurrentModel(res.data.model || 'deepseek-chat')
        setCurrentProvider(res.data.provider || 'deepseek')
      } else {
        form.setFieldsValue({
          provider: 'deepseek',
          model: 'deepseek-chat',
          enabled: true
        })
        setCurrentModel('deepseek-chat')
        setCurrentProvider('deepseek')
      }
    } catch (error) {
      form.setFieldsValue({
        provider: 'deepseek',
        model: 'deepseek-chat',
        enabled: true
      })
      setCurrentModel('deepseek-chat')
      setCurrentProvider('deepseek')
    }
  }

  const handleProviderChange = (provider: string) => {
    setCurrentProvider(provider)
    const providerModels = models.filter(m => m.provider === provider)
    if (providerModels.length > 0) {
      form.setFieldsValue({ model: providerModels[0].id })
      setCurrentModel(providerModels[0].id)
    }
  }

  const handleSend = async () => {
    if (!input.trim()) return
    const userMessage = { id: Date.now(), role: 'user' as const, content: input, model: currentModel }
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setLoading(true)

    try {
      const res = await api.post('/ai/chat', { message: input, symbol: analyzeSymbol || undefined, model: currentModel })
      const assistantMessage = {
        id: Date.now() + 1,
        role: 'assistant' as const,
        content: res.data.message,
        symbol: analyzeSymbol || undefined,
        model: currentModel
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

  const handleQuickAnalyze = async (type: string) => {
    if (!analyzeSymbol) {
      message.warning('请先在股票池选择一个股票，或输入股票代码')
      return
    }
    setLoading(true)

    const prompts: Record<string, string> = {
      'technical': `请对 ${analyzeSymbol} ${analyzeName} 进行详细的技术分析，包括K线形态、均线系统、MACD、KDJ、布林带等指标分析。`,
      'fundamental': `请对 ${analyzeSymbol} ${analyzeName} 进行基本面分析，包括财务指标、估值水平、盈利能力等。`,
      'risk': `请对 ${analyzeSymbol} ${analyzeName} 进行风险评估，包括市场风险、流动性风险、政策风险等。`,
      'advice': `请对 ${analyzeSymbol} ${analyzeName} 给出投资建议，包括支撑位、压力位、仓位控制和止损建议。`,
    }

    const userMsg = {
      id: Date.now(),
      role: 'user' as const,
      content: prompts[type] || `分析 ${analyzeSymbol}`,
      symbol: analyzeSymbol,
      model: currentModel
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
        symbol: analyzeSymbol,
        model: currentModel
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
    const userMsg = {
      id: Date.now(),
      role: 'user' as const,
      content: '请推荐一些优质的股票，并说明推荐理由',
      model: currentModel
    }
    setMessages(prev => [...prev, userMsg])

    try {
      const res = await api.post('/ai/chat', {
        message: '你是一位专业的股票投资顾问，请根据当前市场情况，推荐3-5只有投资价值的股票。要求说明推荐理由、买入价格区间和主要风险。',
        model: currentModel
      })

      const assistantMessage = {
        id: Date.now() + 1,
        role: 'assistant' as const,
        content: res.data.message,
        model: currentModel
      }
      setMessages(prev => [...prev, assistantMessage])
      message.success('股票推荐已生成')
    } catch (error) {
      message.error('推荐失败')
    } finally {
      setLoading(false)
    }
  }

  const generateChartData = (symbol: string) => {
    const dates = []
    const price = []
    const volumes = []
    const basePrice = 100

    for (let i = 0; i < 30; i++) {
      dates.push(`${i + 1}日`)
      price.push(basePrice + Math.random() * 20 - 10 + i * 0.5)
      volumes.push(Math.floor(Math.random() * 100000) + 50000)
    }

    const macd = []
    const signal = []
    for (let i = 0; i < 30; i++) {
      macd.push(Math.random() * 2 - 1)
      signal.push(Math.random() * 2 - 1)
    }

    const kdj = []
    for (let i = 0; i < 30; i++) {
      kdj.push(Math.random() * 100)
    }

    setChartData({ price, volumes, macd, signal, kdj, dates })
    setCurrentQuote({
      symbol: symbol,
      name: symbol,
      price: price[price.length - 1],
      change: price[price.length - 1] - price[0],
      changePct: ((price[price.length - 1] - price[0]) / price[0]) * 100,
      volume: volumes.reduce((a, b) => a + b, 0),
      amount: volumes.reduce((a, b) => a + b, 0) * price[price.length - 1] / 100,
      high: Math.max(...price),
      low: Math.min(...price),
      open: price[0],
      prevClose: price[0] * 0.98
    })
  }

  const handleSaveConfig = async () => {
    try {
      await form.validateFields()
      const values = form.getFieldsValue()
      await api.post('/ai/config', values)
      message.success('配置保存成功')
      setConfigVisible(false)
      loadConfig()
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

  const getProviderName = (provider: string) => {
    const names: Record<string, string> = {
      'deepseek': 'DeepSeek',
      'openai': 'OpenAI',
      'qwen': '通义千问',
      'kimi': 'Kimi'
    }
    return names[provider] || provider
  }

  const getModelName = (modelId: string) => {
    const model = models.find(m => m.id === modelId)
    return model?.name || modelId
  }

  const providerModels = models.filter(m => m.provider === currentProvider)

  const modelSelectorItems = providers.map(p => ({
    key: p.id,
    label: (
      <Space>
        <span style={{ fontWeight: currentProvider === p.id ? 'bold' : 'normal' }}>{p.name}</span>
      </Space>
    ),
    onClick: () => {
      setCurrentProvider(p.id)
      const pModels = models.filter(m => m.provider === p.id)
      if (pModels.length > 0) {
        setCurrentModel(pModels[0].id)
      }
    }
  }))

  const modelItems = providerModels.map(m => ({
    key: m.id,
    label: (
      <Space>
        <CheckCircleOutlined style={{ color: currentModel === m.id ? '#1890ff' : '#999' }} />
        <span>{m.name}</span>
        <Text type="secondary" style={{ fontSize: 10 }}>{m.description}</Text>
      </Space>
    ),
    onClick: () => setCurrentModel(m.id)
  }))

  const renderSidebar = () => (
    <div style={{
      width: 220,
      background: '#fff',
      borderRight: '1px solid #f0f0f0',
      padding: 16,
      height: '100%',
      overflow: 'auto'
    }}>
      <Text strong style={{ display: 'block', marginBottom: 12 }}>快捷分析</Text>
      <Space direction="vertical" style={{ width: '100%' }} size={4}>
        {analysisModules.map(module => (
          <Button
            key={module.key}
            block
            icon={module.icon}
            onClick={() => handleQuickAnalyze(module.key)}
            style={{ textAlign: 'left', height: 40 }}
          >
            <span style={{ color: module.color, marginLeft: 8 }}>{module.title}</span>
          </Button>
        ))}
      </Space>

      <Divider style={{ margin: '12px 0' }} />

      <Space direction="vertical" style={{ width: '100%' }} size={4}>
        <Button block icon={<StarOutlined />} onClick={handleStockRecommend} style={{ textAlign: 'left' }}>
          智能荐股
        </Button>
        <Button block icon={<BgColorsOutlined />} onClick={() => setConfigVisible(true)} style={{ textAlign: 'left' }}>
          API配置
        </Button>
      </Space>
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
      <Space direction="vertical" style={{ width: '100%' }} size={4}>
        {analysisModules.map(module => (
          <Button
            key={module.key}
            block
            icon={module.icon}
            onClick={() => { handleQuickAnalyze(module.key); setDrawerVisible(false); }}
          >
            <span style={{ color: module.color }}>{module.title}</span>
          </Button>
        ))}
      </Space>

      <Divider />

      <Space direction="vertical" style={{ width: '100%' }} size={4}>
        <Button block icon={<StarOutlined />} onClick={() => { handleStockRecommend(); setDrawerVisible(false); }}>
          智能荐股
        </Button>
        <Button block icon={<BgColorsOutlined />} onClick={() => { setConfigVisible(true); setDrawerVisible(false); }}>
          API配置
        </Button>
      </Space>
    </Drawer>
  )

  return (
    <div style={{ height: 'calc(100vh - 180px)', display: 'flex' }}>
      {isMobile && renderMobileSidebar()}
      {!isMobile && renderSidebar()}

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {analyzeSymbol && (
          <Card size="small" style={{ marginBottom: 12, flexShrink: 0 }}>
            <Row gutter={16} align="middle" wrap>
              <Col>
                <Space wrap>
                  <Tag color="blue" icon={<StockOutlined />} style={{ fontSize: 14, padding: '4px 12px' }}>
                    {analyzeSymbol} {analyzeName}
                  </Tag>
                </Space>
              </Col>
              <Col flex="auto">
                <Space style={{ float: 'right', flexWrap: 'wrap' }}>
                  {isMobile && (
                    <Button size="small" icon={<MenuOutlined />} onClick={() => setDrawerVisible(true)} />
                  )}
                  <Button size="small" onClick={() => handleQuickAnalyze('technical')} icon={<BarChartOutlined />}>技术</Button>
                  <Button size="small" onClick={() => handleQuickAnalyze('fundamental')} icon={<DollarOutlined />}>基本面</Button>
                  <Button size="small" onClick={() => handleQuickAnalyze('advice')} type="primary" icon={<CrownOutlined />}>建议</Button>
                </Space>
              </Col>
            </Row>
          </Card>
        )}

        <Card
          title={
            <Space>
              <RobotOutlined />
              <span>AI 智能助手</span>
              <Tabs
                size="small"
                activeKey={viewMode}
                onChange={(v) => setViewMode(v as 'chat' | 'chart')}
                items={[
                  { key: 'chat', label: <span><RobotOutlined /> 对话</span> },
                  { key: 'chart', label: <span><LineChartOutlined /> 图表</span> },
                ]}
                style={{ marginLeft: 16 }}
              />
              <Dropdown menu={{ items: modelSelectorItems }} trigger={['click']}>
                <Tag color="blue" style={{ cursor: 'pointer' }}>
                  {getProviderName(currentProvider)} <DownOutlined />
                </Tag>
              </Dropdown>
              <Dropdown menu={{ items: modelItems }} trigger={['click']}>
                <Badge dot status="processing">
                  <Tag style={{ cursor: 'pointer' }}>
                    {getModelName(currentModel)} <DownOutlined />
                  </Tag>
                </Badge>
              </Dropdown>
            </Space>
          }
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
            {viewMode === 'chat' ? (
              <>
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
                          <span style={{ fontSize: 12, opacity: 0.7 }}>
                            {item.role === 'user' ? (user?.username || '我') : `AI (${getModelName(item.model || currentModel)})`}
                          </span>
                          {item.symbol && <Tag color="blue" style={{ margin: 0, fontSize: 10 }}>{item.symbol}</Tag>}
                        </div>
                        {item.analysis_data && (
                          <div style={{ background: 'rgba(0,0,0,0.05)', padding: 8, borderRadius: 8, marginBottom: 8, fontSize: 12 }}>
                            <Row gutter={12}>
                              <Col><Text type="secondary">现价:</Text> <Text strong>{item.analysis_data.price?.toFixed(2)}</Text></Col>
                              <Col><Text type="secondary">涨跌:</Text> <Text style={{ color: item.analysis_data.change >= 0 ? '#f5222d' : '#52c41a' }}>{item.analysis_data.change >= 0 ? '+' : ''}{item.analysis_data.change?.toFixed(2)}%</Text></Col>
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
              </>
            ) : (
              <div style={{ padding: '0 8px' }}>
                {currentQuote && (
                  <Card size="small" style={{ marginBottom: 12 }}>
                    <Row gutter={16} align="middle">
                      <Col>
                        <Text strong style={{ fontSize: 24 }}>{currentQuote.name}</Text>
                        <Text type="secondary" style={{ marginLeft: 8 }}>{currentQuote.symbol}</Text>
                      </Col>
                      <Col>
                        <Text style={{ fontSize: 24, fontWeight: 'bold', color: currentQuote.change >= 0 ? '#f5222d' : '#52c41a' }}>
                          {currentQuote.price.toFixed(2)}
                        </Text>
                        <Text style={{ marginLeft: 8, color: currentQuote.change >= 0 ? '#f5222d' : '#52c41a' }}>
                          {currentQuote.change >= 0 ? <RiseOutlined /> : <FallOutlined />}
                          {currentQuote.change >= 0 ? '+' : ''}{currentQuote.change.toFixed(2)} ({currentQuote.changePct.toFixed(2)}%)
                        </Text>
                      </Col>
                      <Col>
                        <Space size="large">
                          <div><Text type="secondary">今开:</Text> {currentQuote.open.toFixed(2)}</div>
                          <div><Text type="secondary">最高:</Text> <Text style={{ color: '#f5222d' }}>{currentQuote.high.toFixed(2)}</Text></div>
                          <div><Text type="secondary">最低:</Text> <Text style={{ color: '#52c41a' }}>{currentQuote.low.toFixed(2)}</Text></div>
                          <div><Text type="secondary">成交量:</Text> {(currentQuote.volume / 10000).toFixed(2)}万</div>
                        </Space>
                      </Col>
                    </Row>
                  </Card>
                )}

                <Tabs
                  size="small"
                  activeKey={chartTab}
                  onChange={setChartTab}
                  items={[
                    {
                      key: 'minute',
                      label: '分时',
                      children: chartData && (
                        <ReactECharts
                          option={{
                            tooltip: { trigger: 'axis' },
                            grid: { left: '3%', right: '4%', bottom: '3%', top: 10, containLabel: true },
                            xAxis: { type: 'category', data: chartData.dates, boundaryGap: false },
                            yAxis: { type: 'value', scale: true },
                            series: [
                              { name: '价格', type: 'line', data: chartData.price, smooth: true, lineStyle: { color: '#f5222d', width: 2 }, itemStyle: { color: '#f5222d' } }
                            ]
                          }}
                          style={{ height: 250 }}
                        />
                      )
                    },
                    {
                      key: 'kline',
                      label: 'K线',
                      children: chartData && (
                        <ReactECharts
                          option={{
                            tooltip: { trigger: 'axis' },
                            grid: { left: '3%', right: '4%', bottom: '3%', top: 40, containLabel: true },
                            legend: { data: ['MA5', 'MA10', 'MA20'], top: 0 },
                            xAxis: { type: 'category', data: chartData.dates },
                            yAxis: { type: 'value', scale: true },
                            series: [
                              { name: 'MA5', type: 'line', data: chartData.price.map((p, i) => i < 5 ? null : (chartData.price.slice(i-4, i+1).reduce((a, b) => a + b, 0) / 5)), smooth: true },
                              { name: 'MA10', type: 'line', data: chartData.price.map((p, i) => i < 9 ? null : (chartData.price.slice(i-9, i+1).reduce((a, b) => a + b, 0) / 10)), smooth: true },
                              { name: 'MA20', type: 'line', data: chartData.price.map((p, i) => i < 19 ? null : (chartData.price.slice(i-19, i+1).reduce((a, b) => a + b, 0) / 20)), smooth: true },
                            ]
                          }}
                          style={{ height: 250 }}
                        />
                      )
                    },
                    {
                      key: 'macd',
                      label: 'MACD',
                      children: chartData && (
                        <ReactECharts
                          option={{
                            tooltip: { trigger: 'axis' },
                            grid: { left: '3%', right: '4%', bottom: '3%', top: 10, containLabel: true },
                            xAxis: { type: 'category', data: chartData.dates },
                            yAxis: { type: 'value' },
                            series: [
                              { name: 'MACD', type: 'bar', data: chartData.macd.map(v => v > 0 ? v : 0), itemStyle: { color: '#f5222d' } },
                              { name: 'MACD', type: 'bar', data: chartData.macd.map(v => v < 0 ? v : 0), itemStyle: { color: '#52c41a' } },
                              { name: 'Signal', type: 'line', data: chartData.signal, smooth: true, lineStyle: { color: '#1890ff' } },
                            ]
                          }}
                          style={{ height: 250 }}
                        />
                      )
                    },
                    {
                      key: 'kdj',
                      label: 'KDJ',
                      children: chartData && (
                        <ReactECharts
                          option={{
                            tooltip: { trigger: 'axis' },
                            grid: { left: '3%', right: '4%', bottom: '3%', top: 10, containLabel: true },
                            xAxis: { type: 'category', data: chartData.dates },
                            yAxis: { type: 'value', max: 100 },
                            series: [
                              { name: 'K', type: 'line', data: chartData.kdj, smooth: true, lineStyle: { color: '#f5222d' } },
                              { name: 'D', type: 'line', data: chartData.kdj.map(v => v * 0.9 + 50 * 0.1), smooth: true, lineStyle: { color: '#1890ff' } },
                              { name: 'J', type: 'line', data: chartData.kdj.map(v => v * 1.2 - 10), smooth: true, lineStyle: { color: '#722ed1' } },
                            ]
                          }}
                          style={{ height: 250 }}
                        />
                      )
                    },
                  ]}
                />
              </div>
            )}
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
            <Button onClick={() => handleQuickAnalyze('technical')} disabled={loading || !analyzeSymbol.trim()} type="primary" icon={<RobotOutlined />}>
              AI分析
            </Button>
            <Text type="secondary" style={{ marginLeft: 8, fontSize: 12 }}>输入股票代码，获取专业分析</Text>
          </div>
        </Card>
      </div>

      <Modal
        title={<Space><SettingOutlined />AI 配置</Space>}
        open={configVisible}
        onCancel={() => setConfigVisible(false)}
        onOk={handleSaveConfig}
        width={480}
      >
        <Alert
          message="配置说明"
          description="仅需提供 API Key 即可使用 AI 服务。支持 DeepSeek、OpenAI、通义千问、Kimi 等多家人工智能平台。"
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
        />
        <Form form={form} layout="vertical">
          <Form.Item name="provider" label="AI服务商" rules={[{ required: true }]}>
            <Select onChange={handleProviderChange}>
              {providers.map(p => (
                <Select.Option key={p.id} value={p.id}>{p.name}</Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="api_key"
            label="API密钥"
            rules={[{ required: true, message: '请输入API密钥' }]}
          >
            <Input.Password placeholder="请输入API密钥" />
          </Form.Item>
          <Form.Item name="model" label="模型" rules={[{ required: true }]}>
            <Select>
              {providerModels.map(m => (
                <Select.Option key={m.id} value={m.id}>
                  <Space>
                    <span>{m.name}</span>
                    <Text type="secondary" style={{ fontSize: 10 }}>{m.description}</Text>
                  </Space>
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="endpoint" label="自定义Endpoint（可选）">
            <Input placeholder="不填则使用默认值" />
          </Form.Item>
          <Form.Item name="enabled" label="启用AI" valuePropName="checked" initialValue={true}>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}