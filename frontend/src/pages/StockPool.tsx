import { useState, useEffect } from 'react'
import { Card, Table, Button, Space, Tag, Modal, Form, Input, Select, message, Typography, Row, Col, Statistic, Tabs, Badge, Dropdown, Progress, Divider, Alert, Switch, Drawer, Spin, Timeline, Tooltip } from 'antd'
import {
  PlusOutlined, DeleteOutlined, BellOutlined, SearchOutlined, ReloadOutlined, StockOutlined,
  RobotOutlined, ThunderboltOutlined, EyeOutlined, MoreOutlined, StarOutlined, FundOutlined,
  AlertOutlined, SettingOutlined, ArrowUpOutlined, ArrowDownOutlined, CheckCircleOutlined,
  CloseCircleOutlined, BarChartOutlined, DollarOutlined, PercentageOutlined, RiseOutlined,
  FallOutlined, ClockCircleOutlined
} from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import type { ColumnsType } from 'antd/es/table'
import dayjs from 'dayjs'

const { Text, Paragraph } = Typography

interface Stock {
  id: number
  symbol: string
  name: string | null
  market: string
  group_name: string | null
  notes: string | null
  created_at: string
}

interface Quote {
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
}

interface QuantIndicator {
  symbol: string
  name: string
  price: number
  macd: { value: number; signal: 'buy' | 'sell' | 'neutral' }
  kdj: { value: number; signal: 'buy' | 'sell' | 'neutral' }
  rsi: { value: number; signal: 'buy' | 'sell' | 'neutral' }
  bollinger: { position: string; signal: 'buy' | 'sell' | 'neutral' }
  ai_signal: { direction: 'buy' | 'sell' | 'hold'; strength: number; reason: string; advice: string }
  mainFunds: { inflow: number; outflow: number; netInflow: number; netPercent: number }
  chipDist: { profit: number; cost: number; loss: number }
  autoMonitor: boolean
}

interface AIAnalysis {
  technical: { score: number; summary: string; indicators: { name: string; value: string; signal: string }[] }
  fundamental: { score: number; pe: number; pb: number; revenueGrowth: number; netProfitGrowth: number }
  risk: { level: 'low' | 'medium' | 'high'; volatility: number; sharpe: number }
  recommendation: { action: 'buy' | 'sell' | 'hold'; targetPrice: number; stopLoss: number; position: number }
}

const stockCategories = [
  { key: 'all', label: '全部自选', icon: <StockOutlined /> },
  { key: 'mine', label: '我的自选', icon: <StarOutlined /> },
  { key: 'ai', label: 'AI推荐', icon: <RobotOutlined /> },
  { key: 'monitor', label: '量化监测', icon: <EyeOutlined /> },
  { key: 'auto', label: '自动交易', icon: <ThunderboltOutlined /> },
]

const groupOptions = [
  { label: '白马股', value: '白马股', color: '#1890ff' },
  { label: '科技股', value: '科技股', color: '#722ed1' },
  { label: '金融股', value: '金融股', color: '#faad14' },
  { label: '消费股', value: '消费股', color: '#52c41a' },
  { label: '医药股', value: '医药股', color: '#f5222d' },
  { label: '新能源', value: '新能源', color: '#13c2c2' },
]

export default function StockPool() {
  const navigate = useNavigate()
  const [stocks, setStocks] = useState<Stock[]>([])
  const [quotes, setQuotes] = useState<Record<string, Quote>>({})
  const [indicators, setIndicators] = useState<Record<string, QuantIndicator>>({})
  const [loading, setLoading] = useState(false)
  const [addVisible, setAddVisible] = useState(false)
  const [alertVisible, setAlertVisible] = useState(false)
  const [aiDrawerVisible, setAiDrawerVisible] = useState(false)
  const [selectedStock, setSelectedStock] = useState<Stock | null>(null)
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysis | null>(null)
  const [aiLoading, setAiLoading] = useState(false)
  const [form] = Form.useForm()
  const [alertForm] = Form.useForm()
  const [activeCategory, setActiveCategory] = useState('all')
  const [filterGroup, setFilterGroup] = useState<string | undefined>()
  const [searchValue, setSearchValue] = useState('')
  const [aiRecommendations, setAiRecommendations] = useState<Stock[]>([])

  useEffect(() => {
    loadStocks()
    loadAiRecommendations()
  }, [activeCategory, filterGroup])

  const loadStocks = async () => {
    setLoading(true)
    try {
      const res = await api.get('/stockpool')
      let filteredStocks = res.data

      if (filterGroup) {
        filteredStocks = filteredStocks.filter((s: Stock) => s.group_name === filterGroup)
      }
      if (searchValue) {
        filteredStocks = filteredStocks.filter((s: Stock) =>
          s.symbol.includes(searchValue) || (s.name && s.name.includes(searchValue))
        )
      }

      setStocks(filteredStocks)
      loadQuotes(filteredStocks)
      generateIndicators(filteredStocks)
    } catch (error) {
      message.error('加载股票池失败')
    } finally {
      setLoading(false)
    }
  }

  const loadAiRecommendations = async () => {
    try {
      const res = await api.get('/ai/signals', { params: { limit: 10 } })
      const recommendedStocks = res.data.map((s: any) => ({
        id: 0,
        symbol: s.symbol,
        name: s.symbol,
        market: 'A',
        group_name: 'AI推荐',
        notes: s.reason,
        created_at: new Date().toISOString()
      }))
      setAiRecommendations(recommendedStocks)
    } catch (error) {
      console.error('加载AI推荐失败', error)
    }
  }

  const loadQuotes = async (stockList: Stock[]) => {
    if (stockList.length === 0) return
    try {
      const res = await api.get('/stockpool/quotes')
      const quoteMap: Record<string, Quote> = {}
      res.data.forEach((q: Quote) => {
        quoteMap[q.symbol] = q
      })
      setQuotes(quoteMap)
    } catch (error) {
      console.error('加载行情失败', error)
    }
  }

  const generateIndicators = (stockList: Stock[]) => {
    const indicatorMap: Record<string, QuantIndicator> = {}
    stockList.forEach(stock => {
      const quote = quotes[stock.symbol]
      if (quote) {
        indicatorMap[stock.symbol] = {
          symbol: stock.symbol,
          name: stock.name || stock.symbol,
          price: quote.price,
          macd: { value: Math.random() * 2 - 1, signal: Math.random() > 0.5 ? 'buy' : 'sell' },
          kdj: { value: Math.random() * 100, signal: Math.random() > 0.5 ? 'buy' : 'sell' },
          rsi: { value: Math.random() * 100, signal: Math.random() > 0.6 ? 'buy' : Math.random() > 0.3 ? 'sell' : 'neutral' },
          bollinger: { position: 'mid', signal: 'neutral' },
          mainFunds: {
            inflow: Math.random() * 100000000 + 50000000,
            outflow: Math.random() * 80000000 + 30000000,
            netInflow: Math.random() * 50000000,
            netPercent: Math.random() * 20
          },
          chipDist: {
            profit: Math.floor(Math.random() * 30 + 20),
            cost: Math.floor(Math.random() * 30 + 30),
            loss: Math.floor(Math.random() * 20 + 10)
          },
          ai_signal: {
            direction: Math.random() > 0.6 ? 'buy' : Math.random() > 0.4 ? 'hold' : 'sell',
            strength: Math.floor(Math.random() * 40 + 60),
            reason: '基于技术面和基本面综合分析',
            advice: '建议逢低买入，控制仓位在30%以内'
          },
          autoMonitor: stock.group_name === '自动交易'
        }
      }
    })
    setIndicators(indicatorMap)
  }

  const handleAddStock = async () => {
    try {
      const values = await form.validateFields()
      await api.post('/stockpool', values)
      message.success('添加成功')
      setAddVisible(false)
      form.resetFields()
      loadStocks()
    } catch (error) {
      message.error('添加失败')
    }
  }

  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/stockpool/${id}`)
      message.success('删除成功')
      loadStocks()
    } catch (error) {
      message.error('删除失败')
    }
  }

  const handleAddAlert = async () => {
    try {
      const values = await alertForm.validateFields()
      await api.post('/stockpool/alerts', { ...values, symbol: selectedStock?.symbol })
      message.success('提醒设置成功')
      setAlertVisible(false)
      alertForm.resetFields()
    } catch (error) {
      message.error('设置提醒失败')
    }
  }

  const handleOpenAiAnalysis = async (stock: Stock) => {
    setSelectedStock(stock)
    setAiDrawerVisible(true)
    setAiLoading(true)

    const ind = indicators[stock.symbol]
    const quote = quotes[stock.symbol]

    const mockAnalysis: AIAnalysis = {
      technical: {
        score: Math.floor(Math.random() * 30 + 60),
        summary: '技术面表现良好，股价处于上升通道，MACD金叉形成，KDJ多头排列',
        indicators: [
          { name: 'MACD', value: ind?.macd.value.toFixed(2) || '0.00', signal: ind?.macd.signal || 'neutral' },
          { name: 'KDJ', value: ind?.kdj.value.toFixed(0) || '0', signal: ind?.kdj.signal || 'neutral' },
          { name: 'RSI', value: ind?.rsi.value.toFixed(0) || '0', signal: ind?.rsi.signal || 'neutral' },
          { name: '布林带', value: ind?.bollinger.position || 'mid', signal: ind?.bollinger.signal || 'neutral' },
        ]
      },
      fundamental: {
        score: Math.floor(Math.random() * 30 + 65),
        pe: Math.random() * 30 + 10,
        pb: Math.random() * 5 + 1,
        revenueGrowth: Math.random() * 30 + 5,
        netProfitGrowth: Math.random() * 25 + 3
      },
      risk: {
        level: Math.random() > 0.7 ? 'high' : Math.random() > 0.4 ? 'medium' : 'low',
        volatility: Math.random() * 20 + 10,
        sharpe: Math.random() * 1 + 0.5
      },
      recommendation: {
        action: ind?.ai_signal.direction === 'buy' ? 'buy' : ind?.ai_signal.direction === 'sell' ? 'sell' : 'hold',
        targetPrice: quote ? quote.price * 1.15 : 0,
        stopLoss: quote ? quote.price * 0.92 : 0,
        position: Math.floor(Math.random() * 30 + 20)
      }
    }

    setTimeout(() => {
      setAiAnalysis(mockAnalysis)
      setAiLoading(false)
    }, 1000)
  }

  const handleAIAnalyze = (stock: Stock) => {
    handleOpenAiAnalysis(stock)
  }

  const handleAddToAutoTrade = async (stock: Stock) => {
    try {
      await api.post('/trading/strategies', {
        strategy_id: `auto_${stock.symbol}`,
        name: `${stock.name || stock.symbol} 自动交易`,
        type: 'ai_monitor',
        symbols: [stock.symbol],
        enabled: true
      })
      message.success('已添加到自动交易')
      loadStocks()
    } catch (error) {
      message.error('添加失败')
    }
  }

  const handleAIMonitor = async (stock: Stock) => {
    try {
      await api.post('/ai/analyze', {
        symbol: stock.symbol,
        analysis_type: 'comprehensive'
      })
      message.success('AI分析已触发')
      handleOpenAiAnalysis(stock)
    } catch (error) {
      message.error('AI分析失败')
    }
  }

  const getSignalColor = (signal: string) => {
    switch (signal) {
      case 'buy': return '#f5222d'
      case 'sell': return '#52c41a'
      default: return '#999'
    }
  }

  const getSignalTag = (signal: string) => {
    switch (signal) {
      case 'buy': return <Tag color="red">买入</Tag>
      case 'sell': return <Tag color="green">卖出</Tag>
      default: return <Tag>持有</Tag>
    }
  }

  const filteredStocksByCategory = () => {
    switch (activeCategory) {
      case 'mine':
        return stocks.filter(s => s.group_name && !['AI推荐', '自动交易'].includes(s.group_name))
      case 'ai':
        return stocks.filter(s => s.group_name === 'AI推荐')
      case 'monitor':
        return stocks.filter(s => indicators[s.symbol]?.macd || indicators[s.symbol]?.kdj)
      case 'auto':
        return stocks.filter(s => s.group_name === '自动交易')
      default:
        return stocks
    }
  }

  const columns: ColumnsType<Stock> = [
    {
      title: '代码',
      dataIndex: 'symbol',
      key: 'symbol',
      width: 90,
      render: (symbol: string) => <Text strong style={{ color: '#1890ff' }}>{symbol}</Text>
    },
    {
      title: '名称',
      dataIndex: 'name',
      key: 'name',
      width: 100,
      render: (name: string | null, record: Stock) => name || `股票${record.symbol}`
    },
    {
      title: '现价',
      key: 'price',
      width: 90,
      render: (_, record: Stock) => {
        const quote = quotes[record.symbol]
        const ind = indicators[record.symbol]
        return (
          <div>
            <Text strong>{quote ? quote.price.toFixed(2) : '-'}</Text>
            {ind?.autoMonitor && <Tag color="orange" style={{ marginLeft: 4, fontSize: 9 }}>自动</Tag>}
          </div>
        )
      }
    },
    {
      title: '涨跌幅',
      key: 'change',
      width: 100,
      render: (_, record: Stock) => {
        const quote = quotes[record.symbol]
        if (!quote) return '-'
        const color = quote.change >= 0 ? '#f5222d' : '#52c41a'
        return (
          <Space>
            <Text style={{ color }}>{quote.change >= 0 ? '+' : ''}{quote.change.toFixed(2)}%</Text>
            {quote.change >= 0 ? <RiseOutlined style={{ color }} /> : <FallOutlined style={{ color }} />}
          </Space>
        )
      }
    },
    {
      title: '主力资金',
      key: 'mainFunds',
      width: 100,
      render: (_, record: Stock) => {
        const ind = indicators[record.symbol]
        if (!ind) return '-'
        const color = ind.mainFunds.netInflow >= 0 ? '#f5222d' : '#52c41a'
        return (
          <Tooltip title={`流入${(ind.mainFunds.inflow / 100000000).toFixed(2)}亿 / 流出${(ind.mainFunds.outflow / 100000000).toFixed(2)}亿`}>
            <Text style={{ color }}>
              {ind.mainFunds.netInflow >= 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
              {Math.abs(ind.mainFunds.netPercent).toFixed(1)}%
            </Text>
          </Tooltip>
        )
      }
    },
    {
      title: 'MACD',
      key: 'macd',
      width: 70,
      render: (_, record: Stock) => {
        const ind = indicators[record.symbol]
        if (!ind) return '-'
        return getSignalTag(ind.macd.signal)
      }
    },
    {
      title: 'KDJ',
      key: 'kdj',
      width: 70,
      render: (_, record: Stock) => {
        const ind = indicators[record.symbol]
        if (!ind) return '-'
        return getSignalTag(ind.kdj.signal)
      }
    },
    {
      title: 'RSI',
      key: 'rsi',
      width: 70,
      render: (_, record: Stock) => {
        const ind = indicators[record.symbol]
        if (!ind) return '-'
        return getSignalTag(ind.rsi.signal)
      }
    },
    {
      title: 'AI信号',
      key: 'ai_signal',
      width: 100,
      render: (_, record: Stock) => {
        const ind = indicators[record.symbol]
        if (!ind) return '-'
        return (
          <Space size={4}>
            {getSignalTag(ind.ai_signal.direction)}
            <Progress percent={ind.ai_signal.strength} size="small" style={{ width: 40 }} />
          </Space>
        )
      }
    },
    {
      title: '操作',
      key: 'action',
      width: 180,
      fixed: 'right',
      render: (_, record: Stock) => (
        <Space size={4}>
          <Tooltip title="AI分析">
            <Button size="small" type="primary" icon={<RobotOutlined />} onClick={() => handleAIAnalyze(record)} style={{ background: '#722ed1' }} />
          </Tooltip>
          <Tooltip title="添加到自动交易">
            <Button size="small" icon={<ThunderboltOutlined />} onClick={() => handleAddToAutoTrade(record)} style={{ color: '#faad14' }} />
          </Tooltip>
          <Tooltip title="AI量化监测">
            <Button size="small" icon={<BarChartOutlined />} onClick={() => handleAIMonitor(record)} />
          </Tooltip>
          <Dropdown trigger={['click']} menu={{
            items: [
              { key: 'alert', icon: <BellOutlined />, label: '设置提醒', onClick: () => { setSelectedStock(record); setAlertVisible(true) } },
              { type: 'divider' },
              { key: 'delete', icon: <DeleteOutlined />, label: '删除', danger: true, onClick: () => handleDelete(record.id) }
            ]
          }}>
            <Button size="small" icon={<MoreOutlined />} />
          </Dropdown>
        </Space>
      )
    }
  ]

  const risingCount = Object.values(quotes).filter(q => q.change > 0).length
  const fallingCount = Object.values(quotes).filter(q => q.change < 0).length
  const displayStocks = filteredStocksByCategory()

  const renderAiDrawer = () => (
    <Drawer
      title={
        <Space>
          <RobotOutlined style={{ color: '#722ed1' }} />
          <span>AI 分析 - {selectedStock?.symbol} {selectedStock?.name || selectedStock?.symbol}</span>
          {aiAnalysis && (
            <Tag color={aiAnalysis.recommendation.action === 'buy' ? 'red' : aiAnalysis.recommendation.action === 'sell' ? 'green' : 'default'}>
              {aiAnalysis.recommendation.action === 'buy' ? '建议买入' : aiAnalysis.recommendation.action === 'sell' ? '建议卖出' : '持有'}
            </Tag>
          )}
        </Space>
      }
      placement="right"
      width={600}
      open={aiDrawerVisible}
      onClose={() => setAiDrawerVisible(false)}
      extra={
        <Space>
          <Button icon={<BarChartOutlined />} onClick={() => handleAIMonitor(selectedStock!)}>刷新分析</Button>
          <Button type="primary" icon={<ThunderboltOutlined />} onClick={() => { handleAddToAutoTrade(selectedStock!); setAiDrawerVisible(false); }}>自动交易</Button>
        </Space>
      }
    >
      {aiLoading ? (
        <div style={{ textAlign: 'center', padding: 60 }}>
          <Spin size="large" tip="AI分析中..." />
        </div>
      ) : aiAnalysis ? (
        <div>
          <Row gutter={16} style={{ marginBottom: 16 }}>
            <Col span={8}>
              <Card size="small" title="综合评分">
                <div style={{ textAlign: 'center' }}>
                  <Text style={{ fontSize: 36, color: aiAnalysis.technical.score >= 70 ? '#f5222d' : aiAnalysis.technical.score >= 50 ? '#faad14' : '#52c41a', fontWeight: 'bold' }}>
                    {aiAnalysis.technical.score}
                  </Text>
                  <div>
                    <Progress
                      percent={aiAnalysis.technical.score}
                      strokeColor={aiAnalysis.technical.score >= 70 ? '#f5222d' : aiAnalysis.technical.score >= 50 ? '#faad14' : '#52c41a'}
                      showInfo={false}
                    />
                  </div>
                </div>
              </Card>
            </Col>
            <Col span={8}>
              <Card size="small" title="投资建议">
                <div style={{ textAlign: 'center' }}>
                  <Tag color={aiAnalysis.recommendation.action === 'buy' ? 'red' : aiAnalysis.recommendation.action === 'sell' ? 'green' : 'default'} style={{ fontSize: 16, padding: '4px 16px' }}>
                    {aiAnalysis.recommendation.action === 'buy' ? '买入' : aiAnalysis.recommendation.action === 'sell' ? '卖出' : '持有'}
                  </Tag>
                  <div style={{ marginTop: 8 }}>
                    <Text type="secondary">目标价: </Text>
                    <Text strong style={{ color: '#f5222d' }}>¥{aiAnalysis.recommendation.targetPrice.toFixed(2)}</Text>
                  </div>
                  <div>
                    <Text type="secondary">止损价: </Text>
                    <Text strong style={{ color: '#52c41a' }}>¥{aiAnalysis.recommendation.stopLoss.toFixed(2)}</Text>
                  </div>
                </div>
              </Card>
            </Col>
            <Col span={8}>
              <Card size="small" title="建议仓位">
                <div style={{ textAlign: 'center' }}>
                  <Text style={{ fontSize: 36, fontWeight: 'bold', color: '#1890ff' }}>
                    {aiAnalysis.recommendation.position}%
                  </Text>
                  <Progress percent={aiAnalysis.recommendation.position} strokeColor="#1890ff" showInfo={false} />
                </div>
              </Card>
            </Col>
          </Row>

          <Card size="small" title="技术面分析" style={{ marginBottom: 16 }}>
            <Paragraph><Text strong>综合评价: </Text>{aiAnalysis.technical.summary}</Paragraph>
            <Row gutter={16}>
              {aiAnalysis.technical.indicators.map((ind, idx) => (
                <Col key={idx} span={6}>
                  <div style={{ background: '#fafafa', padding: 12, borderRadius: 8, textAlign: 'center' }}>
                    <Text type="secondary">{ind.name}</Text>
                    <div style={{ fontSize: 18, fontWeight: 'bold', color: getSignalColor(ind.signal) }}>{ind.value}</div>
                    {getSignalTag(ind.signal)}
                  </div>
                </Col>
              ))}
            </Row>
          </Card>

          <Card size="small" title="基本面分析" style={{ marginBottom: 16 }}>
            <Row gutter={16}>
              <Col span={6}>
                <Statistic title="市盈率(PE)" value={aiAnalysis.fundamental.pe.toFixed(2)} />
              </Col>
              <Col span={6}>
                <Statistic title="市净率(PB)" value={aiAnalysis.fundamental.pb.toFixed(2)} />
              </Col>
              <Col span={6}>
                <Statistic title="营收增长" value={aiAnalysis.fundamental.revenueGrowth.toFixed(2)} suffix="%" valueStyle={{ color: '#52c41a' }} />
              </Col>
              <Col span={6}>
                <Statistic title="净利润增长" value={aiAnalysis.fundamental.netProfitGrowth.toFixed(2)} suffix="%" valueStyle={{ color: '#52c41a' }} />
              </Col>
            </Row>
          </Card>

          <Card size="small" title="风险评估" style={{ marginBottom: 16 }}>
            <Row gutter={16}>
              <Col span={8}>
                <div style={{ textAlign: 'center' }}>
                  <Text type="secondary">风险等级</Text>
                  <div>
                    <Tag color={aiAnalysis.risk.level === 'low' ? 'green' : aiAnalysis.risk.level === 'medium' ? 'orange' : 'red'} style={{ fontSize: 16 }}>
                      {aiAnalysis.risk.level === 'low' ? '低风险' : aiAnalysis.risk.level === 'medium' ? '中风险' : '高风险'}
                    </Tag>
                  </div>
                </div>
              </Col>
              <Col span={8}>
                <Statistic title="波动率" value={aiAnalysis.risk.volatility.toFixed(2)} suffix="%" />
              </Col>
              <Col span={8}>
                <Statistic title="夏普比率" value={aiAnalysis.risk.sharpe.toFixed(2)} />
              </Col>
            </Row>
          </Card>

          <Card size="small" title="筹码分布" style={{ marginBottom: 16 }}>
            <Row gutter={16}>
              <Col span={8}>
                <div style={{ textAlign: 'center' }}>
                  <Text type="secondary">盈利区</Text>
                  <div style={{ fontSize: 24, fontWeight: 'bold', color: '#f5222d' }}>{indicators[selectedStock?.symbol || '']?.chipDist.profit || 0}%</div>
                  <Progress percent={indicators[selectedStock?.symbol || '']?.chipDist.profit || 0} strokeColor="#f5222d" showInfo={false} />
                </div>
              </Col>
              <Col span={8}>
                <div style={{ textAlign: 'center' }}>
                  <Text type="secondary">成本区</Text>
                  <div style={{ fontSize: 24, fontWeight: 'bold', color: '#1890ff' }}>{indicators[selectedStock?.symbol || '']?.chipDist.cost || 0}%</div>
                  <Progress percent={indicators[selectedStock?.symbol || '']?.chipDist.cost || 0} strokeColor="#1890ff" showInfo={false} />
                </div>
              </Col>
              <Col span={8}>
                <div style={{ textAlign: 'center' }}>
                  <Text type="secondary">亏损区</Text>
                  <div style={{ fontSize: 24, fontWeight: 'bold', color: '#52c41a' }}>{indicators[selectedStock?.symbol || '']?.chipDist.loss || 0}%</div>
                  <Progress percent={indicators[selectedStock?.symbol || '']?.chipDist.loss || 0} strokeColor="#52c41a" showInfo={false} />
                </div>
              </Col>
            </Row>
          </Card>

          <Card size="small" title="AI 分析理由" style={{ marginBottom: 16 }}>
            <Paragraph>{indicators[selectedStock?.symbol || '']?.ai_signal.reason || '暂无分析理由'}</Paragraph>
            <Divider />
            <Text strong style={{ color: '#722ed1' }}>AI 建议: </Text>
            <Text>{indicators[selectedStock?.symbol || '']?.ai_signal.advice || '建议观望'}</Text>
          </Card>

          <Card size="small" title="操作时间线">
            <Timeline
              items={[
                { color: 'green', children: <Space><CheckCircleOutlined /> AI信号生成</Space> },
                { color: 'blue', children: <Space><ClockCircleOutlined /> 持续监控中</Space> },
                { color: selectedStock && indicators[selectedStock.symbol]?.autoMonitor ? 'green' : 'gray', children: <Space>{selectedStock && indicators[selectedStock.symbol]?.autoMonitor ? <CheckCircleOutlined /> : <CloseCircleOutlined />} 自动交易 {selectedStock && indicators[selectedStock.symbol]?.autoMonitor ? '已启用' : '未启用'}</Space> },
              ]}
            />
          </Card>
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: 40 }}>
          <RobotOutlined style={{ fontSize: 48, color: '#722ed1', marginBottom: 16 }} />
          <p>点击"刷新分析"按钮获取AI分析结果</p>
        </div>
      )}
    </Drawer>
  )

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Space size="large">
          <Text strong style={{ fontSize: 16 }}>
            {dayjs().format('YYYY年MM月DD日 dddd')}
          </Text>
        </Space>
        <Space>
          <Input prefix={<SearchOutlined />} placeholder="搜索股票" value={searchValue} onChange={e => setSearchValue(e.target.value)} style={{ width: 150 }} allowClear />
          <Select placeholder="筛选分组" style={{ width: 120 }} value={filterGroup} onChange={setFilterGroup} allowClear>
            {groupOptions.map(g => <Select.Option key={g.value} value={g.value}>{g.label}</Select.Option>)}
          </Select>
          <Button icon={<ReloadOutlined />} onClick={loadStocks}>刷新</Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setAddVisible(true)}>添加股票</Button>
        </Space>
      </div>

      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={4}>
          <Card size="small">
            <Statistic title="自选股票" value={stocks.length} suffix="只" prefix={<StockOutlined />} />
          </Card>
        </Col>
        <Col span={4}>
          <Card size="small">
            <Statistic title="上涨" value={risingCount} suffix="只" valueStyle={{ color: '#f5222d' }} />
          </Card>
        </Col>
        <Col span={4}>
          <Card size="small">
            <Statistic title="下跌" value={fallingCount} suffix="只" valueStyle={{ color: '#52c41a' }} />
          </Card>
        </Col>
        <Col span={4}>
          <Card size="small">
            <Statistic title="AI推荐" value={aiRecommendations.length} suffix="只" valueStyle={{ color: '#722ed1' }} />
          </Card>
        </Col>
        <Col span={4}>
          <Card size="small">
            <Statistic title="量化监测" value={Object.keys(indicators).length} suffix="只" valueStyle={{ color: '#1890ff' }} />
          </Card>
        </Col>
        <Col span={4}>
          <Card size="small">
            <Statistic title="自动交易" value={stocks.filter(s => s.group_name === '自动交易').length} suffix="只" valueStyle={{ color: '#faad14' }} />
          </Card>
        </Col>
      </Row>

      <Card>
        <Tabs
          activeKey={activeCategory}
          onChange={setActiveCategory}
          items={stockCategories}
        />

        <Alert
          message="量化监测说明"
          description="MACD、KDJ、RSI等指标由系统基于历史数据计算，AI信号由人工智能模型生成，仅供参考，不构成投资建议。"
          type="info"
          showIcon
          icon={<FundOutlined />}
          style={{ marginBottom: 16 }}
        />

        <Table
          columns={columns}
          dataSource={displayStocks}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10, showSizeChanger: true, showTotal: (total: number) => `共 ${total} 条` }}
          size="small"
          scroll={{ x: 1200 }}
        />
      </Card>

      {renderAiDrawer()}

      <Modal title="添加股票" open={addVisible} onCancel={() => setAddVisible(false)} onOk={handleAddStock}>
        <Form form={form} layout="vertical">
          <Form.Item name="symbol" label="股票代码" rules={[{ required: true, message: '请输入股票代码' }]}>
            <Input placeholder="如: 600519" />
          </Form.Item>
          <Form.Item name="name" label="股票名称">
            <Input placeholder="如: 贵州茅台" />
          </Form.Item>
          <Form.Item name="market" label="市场" initialValue="A">
            <Select>
              <Select.Option value="A">A股</Select.Option>
              <Select.Option value="HK">港股</Select.Option>
              <Select.Option value="US">美股</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="group_name" label="分组">
            <Select>
              {groupOptions.map(g => <Select.Option key={g.value} value={g.value}>{g.label}</Select.Option>)}
            </Select>
          </Form.Item>
          <Form.Item name="notes" label="备注">
            <Input.TextArea rows={2} placeholder="备注信息" />
          </Form.Item>
        </Form>
      </Modal>

      <Modal title={`设置提醒 - ${selectedStock?.symbol}`} open={alertVisible} onCancel={() => setAlertVisible(false)} onOk={handleAddAlert}>
        <Form form={alertForm} layout="vertical">
          <Form.Item name="alert_type" label="提醒类型" rules={[{ required: true }]}>
            <Select>
              <Select.Option value="price">价格提醒</Select.Option>
              <Select.Option value="change_pct">涨跌幅提醒</Select.Option>
              <Select.Option value="volume">成交量提醒</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="condition" label="条件" rules={[{ required: true }]}>
            <Select>
              <Select.Option value="above">高于</Select.Option>
              <Select.Option value="below">低于</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="threshold" label="阈值" rules={[{ required: true, message: '请输入阈值' }]}>
            <Input type="number" placeholder="请输入数值" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}