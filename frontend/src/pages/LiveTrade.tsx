import { useState, useEffect, useRef } from 'react'
import { Card, Row, Col, Table, Button, Space, Tag, Modal, Form, InputNumber, Tabs, Divider, Typography, Statistic, message, Alert, Badge, Progress, Tooltip, Input, List, Spin } from 'antd'
import { RiseOutlined, FallOutlined, SearchOutlined, ThunderboltOutlined, SyncOutlined, InfoCircleOutlined, BarChartOutlined, FundOutlined, WalletOutlined, DollarOutlined, BankOutlined, HistoryOutlined, ArrowUpOutlined, ArrowDownOutlined, RobotOutlined, CheckCircleOutlined, SendOutlined, UserOutlined } from '@ant-design/icons'
import ReactECharts from 'echarts-for-react'
import api from '../services/api'

const { Text } = Typography

interface Stock {
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

interface QuantIndicator {
  name: string
  value: number
  signal: 'buy' | 'sell' | 'neutral'
  desc: string
}

interface TradeInfo {
  mainInflow: number
  mainOutflow: number
  retailInflow: number
  retailOutflow: number
  mainNetInflow: number
  mainNetPercent: number
  volumeRatio: number
  turnoverRate: number
  chipDistribution: { name: string; percent: number }[]
  fiveLevelVolume: { price: number; buyVolume: number; sellVolume: number }[]
}

interface AIResult {
  action: 'buy' | 'sell' | 'hold'
  targetPrice: number
  stopLoss: number
  position: number
  reason: string
  strength: number
}

interface ChatMessage {
  id: number
  role: 'user' | 'assistant'
  content: string
  model?: string
}

export default function LiveTrade() {
  const [selectedStock, setSelectedStock] = useState<Stock>({
    symbol: '600519',
    name: '贵州茅台',
    price: 1720.30,
    change: 39.80,
    changePct: 2.37,
    volume: 1256800,
    amount: 2156800000,
    high: 1735.50,
    low: 1685.20,
    open: 1685.20,
    prevClose: 1680.50,
  })
  const [orderVisible, setOrderVisible] = useState(false)
  const [direction, setDirection] = useState<'buy' | 'sell'>('buy')
  const [orderPrice, setOrderPrice] = useState(1720.30)
  const [orderQuantity, setOrderQuantity] = useState(100)
  const [searchValue, setSearchValue] = useState('')
  const [form] = Form.useForm()
  const [chartTab, setChartTab] = useState('minute')
  const [leftTab, setLeftTab] = useState('stocks')
  const [tradeInfoTab, setTradeInfoTab] = useState('funds')
  const [aiTab, setAiTab] = useState('analysis')
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [chatInput, setChatInput] = useState('')
  const [chatLoading, setChatLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatMessages])

  const handleChatSend = async () => {
    if (!chatInput.trim()) return
    const userMessage = { id: Date.now(), role: 'user' as const, content: chatInput }
    setChatMessages(prev => [...prev, userMessage])
    setChatInput('')
    setChatLoading(true)

    try {
      const res = await api.post('/ai/chat', {
        message: chatInput,
        symbol: selectedStock.symbol
      })
      const assistantMessage = {
        id: Date.now() + 1,
        role: 'assistant' as const,
        content: res.data.message
      }
      setChatMessages(prev => [...prev, assistantMessage])
    } catch (error) {
      const errorMessage = {
        id: Date.now() + 1,
        role: 'assistant' as const,
        content: '抱歉，AI服务暂时不可用，请检查AI配置或稍后重试。'
      }
      setChatMessages(prev => [...prev, errorMessage])
    } finally {
      setChatLoading(false)
    }
  }

  const handleChatClear = () => {
    setChatMessages([])
  }

  const indicators: QuantIndicator[] = [
    { name: 'MACD', value: 0.85, signal: 'buy', desc: '金叉' },
    { name: 'KDJ', value: 78.5, signal: 'buy', desc: '多头' },
    { name: 'RSI', value: 65.2, signal: 'neutral', desc: '中性' },
    { name: '布林带', value: 1725, signal: 'sell', desc: '上轨压力' },
    { name: 'MA5', value: 1715.6, signal: 'buy', desc: '价格线上穿' },
    { name: 'MA10', value: 1698.3, signal: 'buy', desc: '多头排列' },
  ]

  const aiResult: AIResult = {
    action: 'buy',
    targetPrice: 1820.00,
    stopLoss: 1650.00,
    position: 30,
    reason: '技术面表现良好，MACD金叉形成，KDJ多头排列，基本面稳健，建议逢低买入',
    strength: 75
  }

  const tradeInfo: TradeInfo = {
    mainInflow: 1256800000,
    mainOutflow: 896500000,
    retailInflow: 450200000,
    retailOutflow: 812300000,
    mainNetInflow: 360300000,
    mainNetPercent: 16.71,
    volumeRatio: 1.35,
    turnoverRate: 2.85,
    chipDistribution: [
      { name: '盈利区', percent: 35 },
      { name: '成本区', percent: 45 },
      { name: '亏损区', percent: 20 },
    ],
    fiveLevelVolume: [
      { price: 1722.00, buyVolume: 125, sellVolume: 89 },
      { price: 1721.50, buyVolume: 234, sellVolume: 156 },
      { price: 1721.00, buyVolume: 456, sellVolume: 312 },
      { price: 1720.50, buyVolume: 789, sellVolume: 654 },
      { price: 1720.00, buyVolume: 1023, sellVolume: 897 },
      { price: 1719.50, buyVolume: 876, sellVolume: 945 },
      { price: 1719.00, buyVolume: 543, sellVolume: 678 },
      { price: 1718.50, buyVolume: 321, sellVolume: 432 },
    ],
  }

  const recentTransactions = [
    { time: '14:32:15', price: 1720.30, volume: 1200, type: 'buy', amount: 2064360 },
    { time: '14:32:08', price: 1720.00, volume: 800, type: 'sell', amount: 1376000 },
    { time: '14:31:56', price: 1720.50, volume: 1500, type: 'buy', amount: 2580750 },
    { time: '14:31:42', price: 1720.00, volume: 600, type: 'buy', amount: 1032000 },
    { time: '14:31:28', price: 1719.50, volume: 2000, type: 'sell', amount: 3439000 },
    { time: '14:31:15', price: 1720.00, volume: 950, type: 'buy', amount: 1634000 },
  ]

  const stockList: Stock[] = [
    { symbol: '600519', name: '贵州茅台', price: 1720.30, change: 39.80, changePct: 2.37, volume: 1256800, amount: 2156800000, high: 1735.50, low: 1685.20, open: 1685.20, prevClose: 1680.50 },
    { symbol: '000858', name: '五粮液', price: 145.20, change: 2.62, changePct: 1.85, volume: 896500, amount: 128500000, high: 146.50, low: 142.30, open: 142.30, prevClose: 142.58 },
    { symbol: '601318', name: '中国平安', price: 42.80, change: -0.21, changePct: -0.48, volume: 2563000, amount: 109800000, high: 43.25, low: 42.60, open: 43.10, prevClose: 43.01 },
    { symbol: '000001', name: '平安银行', price: 11.23, change: 0.05, changePct: 0.45, volume: 1589600, amount: 17850000, high: 11.35, low: 11.15, open: 11.15, prevClose: 11.18 },
    { symbol: '600036', name: '招商银行', price: 35.67, change: 0.40, changePct: 1.12, volume: 1896500, amount: 67320000, high: 35.90, low: 35.20, open: 35.20, prevClose: 35.27 },
    { symbol: '000002', name: '万科A', price: 8.45, change: -0.13, changePct: -1.52, volume: 3256800, amount: 27650000, high: 8.60, low: 8.42, open: 8.58, prevClose: 8.58 },
  ]

  const positions = [
    { key: '1', symbol: '600519', name: '贵州茅台', quantity: 100, avg_cost: 1680.50, current_price: 1720.30, market_value: 172030, profit: 3980, profit_pct: 2.37 },
    { key: '2', symbol: '000858', name: '五粮液', quantity: 200, avg_cost: 142.00, current_price: 145.20, market_value: 29040, profit: 640, profit_pct: 2.25 },
    { key: '3', symbol: '601318', name: '中国平安', quantity: 500, avg_cost: 43.20, current_price: 42.80, market_value: 21400, profit: -200, profit_pct: -0.93 },
    { key: '4', symbol: '600036', name: '招商银行', quantity: 300, avg_cost: 35.00, current_price: 35.67, market_value: 10701, profit: 201, profit_pct: 1.91 },
    { key: '5', symbol: '000001', name: '平安银行', quantity: 1000, avg_cost: 11.30, current_price: 11.23, market_value: 11230, profit: -70, profit_pct: -0.62 },
  ]

  const todayOrders = [
    { key: '1', time: '14:30:15', symbol: '600519', name: '贵州茅台', direction: '买入', price: 1720.00, quantity: 100, status: '已成' },
    { key: '2', time: '14:25:32', symbol: '000858', name: '五粮液', direction: '卖出', price: 145.00, quantity: 200, status: '已成' },
    { key: '3', time: '14:20:00', symbol: '601318', name: '中国平安', direction: '买入', price: 42.80, quantity: 500, status: '已报' },
  ]

  const minuteOption = {
    tooltip: { trigger: 'axis', formatter: '{b}<br/>{c}' },
    grid: { left: '3%', right: '4%', bottom: '3%', top: 10, containLabel: true },
    xAxis: { type: 'category', data: ['09:30', '10:00', '10:30', '11:00', '11:30', '13:00', '13:30', '14:00', '14:30', '15:00'], boundaryGap: false, axisLine: { lineStyle: { color: '#999' } } },
    yAxis: { type: 'value', scale: true, splitLine: { lineStyle: { type: 'dashed', color: '#eee' } }, axisLine: { show: false } },
    series: [{ name: '价格', type: 'line', data: [1685.20, 1695.30, 1705.80, 1710.50, 1708.20, 1712.50, 1715.80, 1718.30, 1720.00, 1720.30], smooth: true, areaStyle: { color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: 'rgba(245, 34, 45, 0.3)' }, { offset: 1, color: 'rgba(245, 34, 45, 0.05)' }] } }, lineStyle: { color: '#f5222d', width: 2 }, itemStyle: { color: '#f5222d' } }],
  }

  const klineOption = {
    tooltip: { trigger: 'axis' },
    legend: { data: ['MA5', 'MA10', 'MA20', 'K线'], top: 0 },
    grid: { left: '3%', right: '4%', bottom: '3%', top: 40, containLabel: true },
    xAxis: { type: 'category', data: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'] },
    yAxis: { type: 'value', scale: true, splitLine: { lineStyle: { type: 'dashed' } } },
    series: [
      { name: 'MA5', type: 'line', data: [820, 932, 901, 934, 1290, 1330, 1320, 1400, 1450, 1500, 1550, 1600], smooth: true },
      { name: 'MA10', type: 'line', data: [920, 1032, 1001, 1034, 1390, 1430, 1420, 1500, 1550, 1600, 1650, 1700], smooth: true },
      { name: 'MA20', type: 'line', data: [1020, 1132, 1101, 1134, 1490, 1530, 1520, 1600, 1650, 1700, 1750, 1800], smooth: true },
      { name: 'K线', type: 'candlestick', data: [[1020, 1130, 1000, 1120], [1120, 1220, 1100, 1200], [1200, 1300, 1180, 1280], [1280, 1380, 1250, 1350], [1350, 1450, 1320, 1420], [1420, 1520, 1400, 1500], [1500, 1600, 1480, 1580], [1580, 1680, 1550, 1650], [1650, 1750, 1620, 1720], [1720, 1820, 1700, 1800], [1800, 1900, 1780, 1880], [1880, 1980, 1850, 1950]] },
    ],
  }

  const handleStockSelect = (stock: Stock) => {
    setSelectedStock(stock)
    setOrderPrice(stock.price)
  }

  const handleSubmitOrder = () => {
    console.log('下单', { direction, price: orderPrice, quantity: orderQuantity, symbol: selectedStock.symbol })
    message.success(`${direction === 'buy' ? '买入' : '卖出'}委托已提交`)
    setOrderVisible(false)
  }

  const filteredStocks = searchValue
    ? stockList.filter(s => s.symbol.includes(searchValue) || s.name.includes(searchValue))
    : stockList

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

  const positionColumns = [
    { title: '代码', dataIndex: 'symbol', key: 'symbol', width: 70 },
    { title: '名称', dataIndex: 'name', key: 'name', width: 70 },
    { title: '持仓', dataIndex: 'quantity', key: 'quantity', width: 50 },
    { title: '成本', dataIndex: 'avg_cost', key: 'avg_cost', width: 70, render: (v: number) => v.toFixed(2) },
    { title: '现价', dataIndex: 'current_price', key: 'current_price', width: 70, render: (v: number) => v.toFixed(2) },
    { title: '盈亏%', dataIndex: 'profit_pct', key: 'profit_pct', width: 70, render: (v: number) => <Text style={{ color: v >= 0 ? '#f5222d' : '#52c41a' }}>{v >= 0 ? '+' : ''}{v.toFixed(2)}%</Text> },
  ]

  const orderColumns = [
    { title: '时间', dataIndex: 'time', key: 'time', width: 80 },
    { title: '代码', dataIndex: 'symbol', key: 'symbol', width: 70 },
    { title: '方向', dataIndex: 'direction', key: 'direction', width: 50, render: (v: string) => <Tag color={v === '买入' ? 'red' : 'green'}>{v}</Tag> },
    { title: '价格', dataIndex: 'price', key: 'price', width: 70, render: (v: number) => v.toFixed(2) },
    { title: '数量', dataIndex: 'quantity', key: 'quantity', width: 50 },
    { title: '状态', dataIndex: 'status', key: 'status', width: 50, render: (v: string) => <Badge status={v === '已成' ? 'success' : 'processing'} text={v} /> },
  ]

  return (
    <div style={{ padding: 0, height: 'calc(100vh - 140px)' }}>
      <Row gutter={8} style={{ height: '100%' }}>
        <Col span={4} style={{ height: '100%' }}>
          <Card size="small" style={{ height: '100%', display: 'flex', flexDirection: 'column' }} bodyStyle={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <Tabs activeKey={leftTab} onChange={setLeftTab} size="small" items={[
              { key: 'stocks', label: '自选股', children: (
                <>
                  <InputNumber placeholder="搜索股票" value={searchValue} onChange={v => setSearchValue(String(v || ''))} style={{ width: '100%', marginBottom: 8 }} size="small" prefix={<SearchOutlined />} />
                  <div style={{ flex: 1, overflow: 'auto' }}>
                    {filteredStocks.map(stock => (
                      <div key={stock.symbol} onClick={() => handleStockSelect(stock)} style={{ padding: '8px 4px', cursor: 'pointer', borderBottom: '1px solid #f0f0f0', background: selectedStock.symbol === stock.symbol ? '#e6f7ff' : 'transparent' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Text strong>{stock.name}</Text>
                          <Text style={{ color: stock.changePct >= 0 ? '#f5222d' : '#52c41a' }}>{stock.price.toFixed(2)}</Text>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                          <Text type="secondary">{stock.symbol}</Text>
                          <Text style={{ color: stock.changePct >= 0 ? '#f5222d' : '#52c41a' }}>{stock.changePct >= 0 ? <RiseOutlined /> : <FallOutlined />} {Math.abs(stock.changePct).toFixed(2)}%</Text>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )},
              { key: 'positions', label: '持仓', children: (
                <Table columns={positionColumns} dataSource={positions} rowKey="key" pagination={false} size="small" scroll={{ y: 400 }} />
              )},
            ]} />
          </Card>
        </Col>

        <Col span={13} style={{ height: '100%', display: 'flex', flexDirection: 'column', gap: 8 }}>
          <Card size="small" style={{ flex: '0 0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Space>
                <Text strong style={{ fontSize: 20 }}>{selectedStock.name}</Text>
                <Text type="secondary">{selectedStock.symbol}</Text>
                <Tag color={selectedStock.changePct >= 0 ? 'red' : 'green'}>{selectedStock.changePct >= 0 ? <RiseOutlined /> : <FallOutlined />} {Math.abs(selectedStock.changePct).toFixed(2)}%</Tag>
              </Space>
              <Text style={{ fontSize: 28, color: selectedStock.changePct >= 0 ? '#f5222d' : '#52c41a', fontWeight: 'bold' }}>{selectedStock.price.toFixed(2)}</Text>
            </div>
            <Row gutter={16} style={{ marginTop: 12 }}>
              <Col span={4}><Text type="secondary" style={{ fontSize: 12 }}>今开</Text><br /><Text style={{ fontSize: 13 }}>{selectedStock.open.toFixed(2)}</Text></Col>
              <Col span={4}><Text type="secondary" style={{ fontSize: 12 }}>最高</Text><br /><Text style={{ fontSize: 13, color: '#f5222d' }}>{selectedStock.high.toFixed(2)}</Text></Col>
              <Col span={4}><Text type="secondary" style={{ fontSize: 12 }}>最低</Text><br /><Text style={{ fontSize: 13, color: '#52c41a' }}>{selectedStock.low.toFixed(2)}</Text></Col>
              <Col span={4}><Text type="secondary" style={{ fontSize: 12 }}>成交量</Text><br /><Text style={{ fontSize: 13 }}>{(selectedStock.volume / 10000).toFixed(2)}万</Text></Col>
              <Col span={4}><Text type="secondary" style={{ fontSize: 12 }}>成交额</Text><br /><Text style={{ fontSize: 13 }}>{(selectedStock.amount / 100000000).toFixed(2)}亿</Text></Col>
              <Col span={4}><Text type="secondary" style={{ fontSize: 12 }}>昨收</Text><br /><Text style={{ fontSize: 13 }}>{selectedStock.prevClose.toFixed(2)}</Text></Col>
            </Row>
          </Card>

          <Card size="small" style={{ flex: 1 }}>
            <Tabs size="small" activeKey={chartTab} onChange={setChartTab} items={[
              { key: 'minute', label: '分时', children: <ReactECharts option={minuteOption} style={{ height: 240 }} /> },
              { key: 'day', label: '日K', children: <ReactECharts option={klineOption} style={{ height: 240 }} /> },
              { key: 'week', label: '周K', children: <ReactECharts option={klineOption} style={{ height: 240 }} /> },
              { key: 'month', label: '月K', children: <ReactECharts option={klineOption} style={{ height: 240 }} /> },
            ]} />
          </Card>

          <Card size="small" title="量化指标" style={{ flex: '0 0 120px' }} bodyStyle={{ overflow: 'auto' }}>
            <Row gutter={8}>
              {indicators.map((ind, idx) => (
                <Col key={idx} span={4}>
                  <div style={{ background: '#fafafa', padding: '8px 12px', borderRadius: 4, textAlign: 'center' }}>
                    <Text type="secondary" style={{ fontSize: 11 }}>{ind.name}</Text>
                    <div style={{ fontSize: 16, fontWeight: 'bold', color: getSignalColor(ind.signal) }}>{typeof ind.value === 'number' ? ind.value.toFixed(2) : ind.value}</div>
                    {getSignalTag(ind.signal)}
                  </div>
                </Col>
              ))}
            </Row>
          </Card>

          <Card size="small" title="实时交易信息" style={{ flex: 1 }} bodyStyle={{ height: 'calc(100% - 45px)', overflow: 'auto' }}>
            <Tabs size="small" activeKey={tradeInfoTab} onChange={setTradeInfoTab} items={[
              { key: 'funds', label: '资金流向', children: (
                <Row gutter={8}>
                  <Col span={12}>
                    <div style={{ background: '#fafafa', padding: 12, borderRadius: 8 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                        <Text type="secondary"><BankOutlined /> 主力资金</Text>
                        <Tag color={tradeInfo.mainNetInflow >= 0 ? 'red' : 'green'}>{tradeInfo.mainNetInflow >= 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />} {Math.abs(tradeInfo.mainNetPercent).toFixed(2)}%</Tag>
                      </div>
                      <Row gutter={8}>
                        <Col span={12}><Text type="secondary" style={{ fontSize: 11 }}>流入</Text><div style={{ color: '#f5222d', fontWeight: 'bold' }}>{(tradeInfo.mainInflow / 100000000).toFixed(2)}亿</div></Col>
                        <Col span={12}><Text type="secondary" style={{ fontSize: 11 }}>流出</Text><div style={{ color: '#52c41a', fontWeight: 'bold' }}>{(tradeInfo.mainOutflow / 100000000).toFixed(2)}亿</div></Col>
                      </Row>
                      <Progress percent={tradeInfo.mainNetPercent} strokeColor={tradeInfo.mainNetInflow >= 0 ? '#f5222d' : '#52c41a'} trailColor="#f0f0f0" size="small" format={() => `净流入 ${(tradeInfo.mainNetInflow / 100000000).toFixed(2)}亿`} />
                    </div>
                  </Col>
                  <Col span={12}>
                    <div style={{ background: '#fafafa', padding: 12, borderRadius: 8 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                        <Text type="secondary"><DollarOutlined /> 散户资金</Text>
                        <Tag color="default">参考</Tag>
                      </div>
                      <Row gutter={8}>
                        <Col span={12}><Text type="secondary" style={{ fontSize: 11 }}>流入</Text><div>{(tradeInfo.retailInflow / 100000000).toFixed(2)}亿</div></Col>
                        <Col span={12}><Text type="secondary" style={{ fontSize: 11 }}>流出</Text><div>{(tradeInfo.retailOutflow / 100000000).toFixed(2)}亿</div></Col>
                      </Row>
                      <div style={{ marginTop: 8, fontSize: 11 }}><Space><Text type="secondary">量比:</Text><Text strong>{tradeInfo.volumeRatio.toFixed(2)}</Text><Text type="secondary">换手率:</Text><Text strong>{tradeInfo.turnoverRate.toFixed(2)}%</Text></Space></div>
                    </div>
                  </Col>
                </Row>
              )},
              { key: 'chips', label: '筹码分布', children: (
                <Row gutter={8}>
                  {tradeInfo.chipDistribution.map((chip, idx) => (
                    <Col key={idx} span={8}>
                      <div style={{ textAlign: 'center', padding: 16, background: '#fafafa', borderRadius: 8 }}>
                        <Text type="secondary">{chip.name}</Text>
                        <div style={{ fontSize: 28, fontWeight: 'bold', color: idx === 0 ? '#f5222d' : idx === 2 ? '#52c41a' : '#1890ff' }}>{chip.percent}%</div>
                        <Progress percent={chip.percent} strokeColor={idx === 0 ? '#f5222d' : idx === 2 ? '#52c41a' : '#1890ff'} showInfo={false} />
                      </div>
                    </Col>
                  ))}
                </Row>
              )},
              { key: 'orders', label: '五档买卖', children: (
                <Table size="small" pagination={false} columns={[
                  { title: '卖量', dataIndex: 'sellVolume', key: 'sellVolume', width: 80, render: (v: number) => <Text style={{ color: '#52c41a' }}>{v}</Text> },
                  { title: '价格', dataIndex: 'price', key: 'price', width: 100, render: (v: number) => <Text strong>{v.toFixed(2)}</Text> },
                  { title: '买量', dataIndex: 'buyVolume', key: 'buyVolume', width: 80, render: (v: number) => <Text style={{ color: '#f5222d' }}>{v}</Text> },
                ]} dataSource={tradeInfo.fiveLevelVolume} rowKey="price" scroll={{ y: 150 }} />
              )},
              { key: 'deals', label: '最新成交', children: (
                <Table size="small" pagination={false} columns={[
                  { title: '时间', dataIndex: 'time', key: 'time', width: 80 },
                  { title: '价格', dataIndex: 'price', key: 'price', width: 80, render: (v: number, r: any) => <Text style={{ color: r.type === 'buy' ? '#f5222d' : '#52c41a' }}>{v.toFixed(2)}</Text> },
                  { title: '成交量', dataIndex: 'volume', key: 'volume', width: 80, render: (v: number) => (v / 100).toFixed(0) },
                  { title: '性质', dataIndex: 'type', key: 'type', width: 50, render: (v: string) => <Tag color={v === 'buy' ? 'red' : 'green'} style={{ margin: 0 }}>{v === 'buy' ? '买入' : '卖出'}</Tag> },
                ]} dataSource={recentTransactions} rowKey="time" scroll={{ y: 150 }} />
              )},
            ]} />
          </Card>
        </Col>

        <Col span={7} style={{ height: '100%', display: 'flex', flexDirection: 'column', gap: 8 }}>
          <Card size="small"
            title={
              <Space>
                <RobotOutlined style={{ color: '#722ed1' }} />
                <span>AI量化分析</span>
                <Tabs
                  size="small"
                  activeKey={aiTab}
                  onChange={setAiTab}
                  items={[
                    { key: 'analysis', label: <span><BarChartOutlined /> 分析</span> },
                    { key: 'chat', label: <span><RobotOutlined /> Chat</span> },
                  ]}
                  style={{ marginLeft: 8 }}
                />
              </Space>
            }
            extra={<Button size="small" icon={<SyncOutlined />}>刷新</Button>}
            bodyStyle={{ padding: aiTab === 'chat' ? 0 : undefined }}
          >
            {aiTab === 'analysis' ? (
              <>
                <div style={{ background: aiResult.action === 'buy' ? 'rgba(245, 34, 45, 0.05)' : aiResult.action === 'sell' ? 'rgba(82, 196, 26, 0.05)' : '#fafafa', padding: 12, borderRadius: 8, marginBottom: 12 }}>
                  <div style={{ textAlign: 'center', marginBottom: 12 }}>
                    <Tag color={aiResult.action === 'buy' ? 'red' : aiResult.action === 'sell' ? 'green' : 'default'} style={{ fontSize: 16, padding: '4px 24px' }}>
                      {aiResult.action === 'buy' ? '建议买入' : aiResult.action === 'sell' ? '建议卖出' : '持有观望'}
                    </Tag>
                    <div style={{ marginTop: 8 }}>
                      <Text type="secondary">信号强度: </Text>
                      <Progress percent={aiResult.strength} size="small" style={{ width: 100, display: 'inline-block' }} />
                    </div>
                  </div>
                  <Row gutter={8}>
                    <Col span={8}><Statistic title="目标价" value={aiResult.targetPrice} precision={2} prefix="¥" valueStyle={{ fontSize: 14, color: '#f5222d' }} /></Col>
                    <Col span={8}><Statistic title="止损价" value={aiResult.stopLoss} precision={2} prefix="¥" valueStyle={{ fontSize: 14, color: '#52c41a' }} /></Col>
                    <Col span={8}><Statistic title="仓位" value={aiResult.position} suffix="%" valueStyle={{ fontSize: 14, color: '#1890ff' }} /></Col>
                  </Row>
                </div>
                <div style={{ fontSize: 12, color: '#666', marginBottom: 12 }}>
                  <Text type="secondary">AI分析理由:</Text>
                  <p style={{ margin: '4px 0 0 0' }}>{aiResult.reason}</p>
                </div>
                <Space wrap>
                  <Button type="primary" danger icon={<RiseOutlined />} onClick={() => { setDirection('buy'); setOrderVisible(true); }}>快速买入</Button>
                  <Button type="primary" icon={<FallOutlined />} style={{ background: '#52c41a', borderColor: '#52c41a' }} onClick={() => { setDirection('sell'); setOrderVisible(true); }}>快速卖出</Button>
                  <Button icon={<ThunderboltOutlined />}>加入自选</Button>
                </Space>
              </>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', height: 320 }}>
                <div style={{ flex: 1, overflow: 'auto', padding: '8px 12px' }}>
                  {chatMessages.length === 0 && (
                    <div style={{ textAlign: 'center', padding: 24, color: '#999' }}>
                      <RobotOutlined style={{ fontSize: 32, marginBottom: 8 }} />
                      <p style={{ margin: 0 }}>开始与AI对话</p>
                      <p style={{ margin: '4px 0 0 0', fontSize: 12 }}>当前分析: {selectedStock.name} ({selectedStock.symbol})</p>
                    </div>
                  )}
                  <List
                    dataSource={chatMessages}
                    renderItem={(item) => (
                      <List.Item style={{ justifyContent: item.role === 'user' ? 'flex-end' : 'flex-start', border: 'none', padding: '4px 0' }}>
                        <div style={{
                          maxWidth: '85%',
                          padding: '8px 12px',
                          borderRadius: 8,
                          background: item.role === 'user' ? '#1890ff' : '#f5f5f5',
                          color: item.role === 'user' ? '#fff' : '#333'
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                            {item.role === 'user' ? <UserOutlined /> : <RobotOutlined />}
                            <span style={{ fontSize: 10, opacity: 0.7 }}>
                              {item.role === 'user' ? '我' : 'AI'}
                            </span>
                          </div>
                          <div style={{ fontSize: 12, whiteSpace: 'pre-wrap', lineHeight: 1.5 }}>{item.content}</div>
                        </div>
                      </List.Item>
                    )}
                  />
                  {chatLoading && (
                    <div style={{ textAlign: 'center', padding: 8 }}>
                      <Spin tip="AI分析中..." size="small" />
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
                <div style={{ padding: 8, borderTop: '1px solid #f0f0f0' }}>
                  <Space.Compact style={{ width: '100%' }}>
                    <Input
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      onPressEnter={handleChatSend}
                      placeholder={`关于 ${selectedStock.symbol} 的问题...`}
                      disabled={chatLoading}
                    />
                    <Button type="primary" icon={<SendOutlined />} onClick={handleChatSend} loading={chatLoading} />
                  </Space.Compact>
                  <div style={{ marginTop: 4, display: 'flex', justifyContent: 'space-between' }}>
                    <Button type="link" size="small" onClick={handleChatClear} style={{ padding: 0 }}>清空对话</Button>
                    <Text type="secondary" style={{ fontSize: 10 }}>基于 {selectedStock.symbol} 分析</Text>
                  </div>
                </div>
              </div>
            )}
          </Card>

          <Card size="small" title="交易操作" extra={<Space><SyncOutlined /><ThunderboltOutlined /></Space>}>
            <div style={{ background: '#fafafa', padding: 16, borderRadius: 8, marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                <Text type="secondary">当前选中</Text>
                <Text strong>{selectedStock.name} ({selectedStock.symbol})</Text>
              </div>
              <Row gutter={8}>
                <Col span={12}>
                  <Text type="secondary" style={{ fontSize: 12 }}>买入价</Text>
                  <InputNumber style={{ width: '100%', marginTop: 4 }} value={orderPrice} onChange={v => setOrderPrice(v || 0)} precision={2} min={0} prefix="¥" />
                </Col>
                <Col span={12}>
                  <Text type="secondary" style={{ fontSize: 12 }}>数量(手)</Text>
                  <InputNumber style={{ width: '100%', marginTop: 4 }} value={orderQuantity} onChange={v => setOrderQuantity(v || 0)} min={1} max={10000} step={100} />
                </Col>
              </Row>
              <div style={{ marginTop: 8, display: 'flex', justifyContent: 'space-between' }}><Text type="secondary">买入金额:</Text><Text strong>¥{(orderPrice * orderQuantity).toLocaleString()}</Text></div>
              <div style={{ marginTop: 4, display: 'flex', justifyContent: 'space-between' }}><Text type="secondary">可买最大:</Text><Text>553手</Text></div>
            </div>
            <Space wrap style={{ width: '100%', marginBottom: 12 }}>
              <Button onClick={() => setOrderQuantity(100)} size="small">100</Button>
              <Button onClick={() => setOrderQuantity(200)} size="small">200</Button>
              <Button onClick={() => setOrderQuantity(500)} size="small">500</Button>
              <Button onClick={() => setOrderQuantity(1000)} size="small">1000</Button>
            </Space>
            <Row gutter={8}>
              <Col span={12}><Button type="primary" danger block size="large" onClick={() => { setDirection('buy'); setOrderVisible(true); }} icon={<RiseOutlined />}>买入</Button></Col>
              <Col span={12}><Button type="primary" block size="large" style={{ background: '#52c41a', borderColor: '#52c41a' }} onClick={() => { setDirection('sell'); setOrderVisible(true); }} icon={<FallOutlined />}>卖出</Button></Col>
            </Row>
          </Card>

          <Card size="small" title="账户概览">
            <Row gutter={8}>
              <Col span={12}><Statistic title="总资产" value={1125840.50} precision={2} prefix="¥" valueStyle={{ fontSize: 14 }} /></Col>
              <Col span={12}><Statistic title="持仓市值" value={222470.00} precision={2} prefix="¥" valueStyle={{ fontSize: 14 }} /></Col>
              <Col span={12}><Statistic title="可用资金" value={903370.50} precision={2} prefix="¥" valueStyle={{ fontSize: 14 }} /></Col>
              <Col span={12}><Statistic title="今日盈亏" value={4420.00} precision={2} prefix="¥" valueStyle={{ color: '#f5222d', fontSize: 14 }} /></Col>
            </Row>
          </Card>

          <Card size="small" title="当日委托" extra={<Button type="link" size="small">查看全部</Button>} bodyStyle={{ padding: 0 }}>
            <Table columns={orderColumns} dataSource={todayOrders} pagination={false} size="small" />
          </Card>
        </Col>
      </Row>

      <Modal title={`${direction === 'buy' ? '买入' : '卖出'} ${selectedStock.name}`} open={orderVisible} onCancel={() => setOrderVisible(false)} onOk={handleSubmitOrder} okText={direction === 'buy' ? '买入' : '卖出'} okButtonProps={{ danger: direction === 'buy', style: { background: direction === 'sell' ? '#52c41a' : undefined } }}>
        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col span={12}><Form.Item label="股票代码"><InputNumber style={{ width: '100%' }} value={selectedStock.symbol} disabled /></Form.Item></Col>
            <Col span={12}><Form.Item label="股票名称"><InputNumber style={{ width: '100%' }} value={selectedStock.name} disabled /></Form.Item></Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}><Form.Item label="价格" required><InputNumber style={{ width: '100%' }} value={orderPrice} onChange={v => setOrderPrice(v || 0)} precision={2} min={0} prefix="¥" /></Form.Item></Col>
            <Col span={12}><Form.Item label="数量" required><InputNumber style={{ width: '100%' }} value={orderQuantity} onChange={v => setOrderQuantity(v || 0)} min={1} max={10000} suffix="手" /></Form.Item></Col>
          </Row>
          <Alert message={`买入金额: ¥${(orderPrice * orderQuantity).toLocaleString()}, 手续费: ¥${(orderPrice * orderQuantity * 0.0003).toFixed(2)}`} type="info" showIcon icon={<InfoCircleOutlined />} />
        </Form>
      </Modal>
    </div>
  )
}