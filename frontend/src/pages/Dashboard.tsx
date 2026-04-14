import { useState, useEffect, useCallback } from 'react'
import { Row, Col, Card, Statistic, Table, Tag, Space, Progress, List, DatePicker, Button, Typography, Badge, Tooltip } from 'antd'
import {
  RiseOutlined,
  FallOutlined,
  ThunderboltOutlined,
  ExperimentOutlined,
  SafetyOutlined,
  StockOutlined,
  RobotOutlined,
  BellOutlined,
  CalendarOutlined,
  ReloadOutlined,
  SyncOutlined,
} from '@ant-design/icons'
import ReactECharts from 'echarts-for-react'
import { useAuthStore } from '../stores/authStore'
import api from '../services/api'
import dayjs, { Dayjs } from 'dayjs'

const { Text } = Typography

interface Stock {
  id: number
  symbol: string
  name: string | null
  market: string
  group_name: string | null
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

interface Alert {
  id: number
  symbol: string
  alert_type: string
  threshold: number
  condition: string
}

export default function Dashboard() {
  const { user } = useAuthStore()
  const [stocks, setStocks] = useState<Stock[]>([])
  const [quotes, setQuotes] = useState<Record<string, Quote>>({})
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [aiSignals, setAiSignals] = useState<any[]>([])
  const [selectedDate, setSelectedDate] = useState<Dayjs>(dayjs())
  const [refreshKey, setRefreshKey] = useState(0)
  const [lastUpdateTime, setLastUpdateTime] = useState<string>(dayjs().format('HH:mm:ss'))
  const [isRefreshing, setIsRefreshing] = useState(false)

  const loadStockPool = useCallback(async () => {
    try {
      const res = await api.get('/stockpool')
      setStocks(res.data)
      await loadQuotes(res.data)
    } catch (error) {
      console.error('加载股票池失败', error)
    }
  }, [])

  const loadQuotes = async (stockList?: Stock[]) => {
    const list = stockList || stocks
    if (list.length === 0) return
    setIsRefreshing(true)
    try {
      const res = await api.get('/stockpool/quotes')
      const quoteMap: Record<string, Quote> = {}
      res.data.forEach((q: Quote) => {
        quoteMap[q.symbol] = q
      })
      setQuotes(quoteMap)
      setLastUpdateTime(dayjs().format('HH:mm:ss'))
    } catch (error) {
      console.error('加载行情失败', error)
    } finally {
      setIsRefreshing(false)
    }
  }

  const loadAlerts = useCallback(async () => {
    try {
      const res = await api.get('/stockpool/alerts')
      setAlerts(res.data.filter((a: Alert) => a.enabled).slice(0, 5))
    } catch (error) {
      console.error('加载提醒失败', error)
    }
  }, [])

  const loadAISignals = useCallback(async () => {
    try {
      const res = await api.get('/ai/signals', { params: { limit: 5 } })
      setAiSignals(res.data)
    } catch (error) {
      console.error('加载AI信号失败', error)
    }
  }, [])

  useEffect(() => {
    loadStockPool()
    loadAlerts()
    loadAISignals()
  }, [refreshKey])

  useEffect(() => {
    const interval = setInterval(() => {
      loadQuotes()
    }, 5000)
    return () => clearInterval(interval)
  }, [stocks])

  const handleRefresh = () => {
    setRefreshKey(k => k + 1)
    loadStockPool()
    loadAlerts()
    loadAISignals()
  }

  const equityCurveOption = {
    tooltip: { trigger: 'axis' },
    xAxis: { type: 'category', data: Array.from({ length: 30 }, (_, i) => `${i + 1}日`), boundaryGap: false },
    yAxis: { type: 'value', axisLabel: { formatter: (v: number) => `${(v / 10000).toFixed(1)}万` } },
    series: [{
      data: Array.from({ length: 30 }, (_, i) => 1000000 + Math.random() * 100000 - (i > 15 ? (i - 15) * 5000 : 0)),
      type: 'line',
      smooth: true,
      areaStyle: { color: 'rgba(24, 144, 255, 0.2)' },
      lineStyle: { color: '#1890ff' },
    }],
    grid: { left: 50, right: 20, top: 20, bottom: 30 },
  }

  const marketOverviewOption = {
    tooltip: { trigger: 'axis' },
    xAxis: { type: 'category', data: ['上证', '深证', '创业板', '沪深300'] },
    yAxis: { type: 'value', axisLabel: { formatter: (v: number) => `${v.toFixed(2)}%` } },
    series: [
      {
        data: [1.25, 1.18, -0.35, 0.96].map(v => ({ value: v, itemStyle: { color: v >= 0 ? '#f5222d' : '#52c41a' } })),
        type: 'bar',
        barWidth: '50%',
      }
    ],
    grid: { left: 50, right: 20, top: 20, bottom: 30 },
  }

  const stockColumns = [
    { title: '代码', dataIndex: 'symbol', key: 'symbol', width: 80 },
    { title: '名称', dataIndex: 'name', key: 'name', width: 80 },
    {
      title: '现价',
      key: 'price',
      width: 80,
      render: (_: any, record: Stock) => {
        const quote = quotes[record.symbol]
        return quote ? <span style={{ fontWeight: 'bold' }}>{quote.price.toFixed(2)}</span> : '-'
      }
    },
    {
      title: '涨跌幅',
      key: 'change',
      width: 100,
      render: (_: any, record: Stock) => {
        const quote = quotes[record.symbol]
        if (!quote) return '-'
        const color = quote.change >= 0 ? '#f5222d' : '#52c41a'
        return <span style={{ color, fontWeight: 'bold' }}>{quote.change >= 0 ? '+' : ''}{quote.change_pct.toFixed(2)}%</span>
      }
    },
  ]

  const risingCount = Object.values(quotes).filter(q => q.change > 0).length
  const fallingCount = Object.values(quotes).filter(q => q.change < 0).length

  return (
    <div>
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ marginBottom: 8 }}>欢迎回来，{user?.username || '用户'}</h2>
          <p style={{ color: '#666' }}>
            <CalendarOutlined /> {selectedDate.format('YYYY年MM月DD日 dddd')} &nbsp;|&nbsp;
            <Text type="secondary">实时监控 · 智能分析 · 量化交易</Text>
          </p>
        </div>
        <Space>
          <Tooltip title={`最后更新: ${lastUpdateTime}`}>
            <Badge status="processing" text={<Text type="secondary">实时行情 {lastUpdateTime}</Text>} />
          </Tooltip>
          <DatePicker
            value={selectedDate}
            onChange={(date) => date && setSelectedDate(date)}
            format="YYYY-MM-DD"
            allowClear={false}
          />
          <Button
            icon={<SyncOutlined spin={isRefreshing} />}
            onClick={handleRefresh}
            loading={isRefreshing}
          >
            刷新
          </Button>
        </Space>
      </div>

      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}><Card size="small"><Statistic title="总资产" value={1125840.50} precision={2} prefix="¥" /></Card></Col>
        <Col span={6}><Card size="small"><Statistic title="今日收益" value={12580.30} precision={2} prefix="¥" suffix={<RiseOutlined style={{ color: '#f5222d' }} />} valueStyle={{ color: '#f5222d' }} /></Card></Col>
        <Col span={6}>
          <Card size="small">
            <Statistic
              title="持仓股票"
              value={stocks.length}
              suffix="只"
              valueStyle={{ color: risingCount > fallingCount ? '#f5222d' : '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small">
            <Statistic
              title="涨跌比"
              value={`${risingCount}:${fallingCount}`}
              prefix={risingCount > fallingCount ? <RiseOutlined style={{ color: '#f5222d' }} /> : <FallOutlined style={{ color: '#52c41a' }} />}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={16}>
          <Card
            title={<Space>收益曲线（近30日） <Tag icon={<CalendarOutlined />}>{selectedDate.format('YYYY-MM-DD')}</Tag></Space>}
            extra={<Space><Tag icon={<StockOutlined />} color="blue">股票池 {stocks.length}只 | 涨{risingCount} 跌{fallingCount}</Tag></Space>}
          >
            <ReactECharts option={equityCurveOption} style={{ height: 200 }} />
          </Card>
        </Col>
        <Col span={8}>
          <Card
            title="市场概况"
            extra={
              <Tag color={alerts.length > 0 ? 'orange' : 'green'}>
                <BellOutlined /> {alerts.length} 提醒
              </Tag>
            }
          >
            <ReactECharts option={marketOverviewOption} style={{ height: 200 }} />
          </Card>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <Card
            title={<Space><StockOutlined />自选股票池 <Tag>{stocks.length}只</Tag></Space>}
            extra={
              <Space>
                <span style={{ color: '#666' }}>{selectedDate.format('YYYY-MM-DD')}</span>
                <SyncOutlined spin={isRefreshing} style={{ color: isRefreshing ? '#1890ff' : '#999' }} />
                <a href="/stockpool">查看全部</a>
              </Space>
            }
            size="small"
          >
            {stocks.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 20, color: '#999' }}>
                <p>暂无自选股票</p>
                <a href="/stockpool">添加股票</a>
              </div>
            ) : (
              <Table
                columns={stockColumns}
                dataSource={stocks.slice(0, 6)}
                rowKey="id"
                pagination={false}
                size="small"
              />
            )}
          </Card>
        </Col>
        <Col span={6}>
          <Card
            title={<Space><BellOutlined />交易提醒 <Badge count={alerts.length} /></Space>}
            size="small"
            extra={<a href="/stockpool">设置</a>}
          >
            {alerts.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 20, color: '#999' }}>暂无提醒</div>
            ) : (
              <List
                size="small"
                dataSource={alerts}
                renderItem={(item) => (
                  <List.Item>
                    <Tag color="orange">{item.symbol}</Tag>
                    <span>{item.alert_type === 'price' ? '价格' : item.alert_type === 'change_pct' ? '涨跌幅' : '成交量'}</span>
                    <span>{item.condition === 'above' ? '>' : '<'} {item.threshold}</span>
                  </List.Item>
                )}
              />
            )}
          </Card>
        </Col>
        <Col span={6}>
          <Card
            title={<Space><RobotOutlined />AI交易信号</Space>}
            size="small"
            extra={<a href="/ai">AI助手</a>}
          >
            {aiSignals.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 20, color: '#999' }}>
                <p>暂无AI信号</p>
                <a href="/ai">获取分析</a>
              </div>
            ) : (
              <List
                size="small"
                dataSource={aiSignals}
                renderItem={(item) => (
                  <List.Item>
                    <Tag color={item.direction === 'buy' ? 'red' : item.direction === 'sell' ? 'green' : 'blue'}>{item.symbol}</Tag>
                    <span>{item.signal_type}</span>
                    <Progress percent={item.strength} size="small" style={{ width: 80 }} />
                  </List.Item>
                )}
              />
            )}
          </Card>
        </Col>
      </Row>

      <Row gutter={16} style={{ marginTop: 16 }}>
        <Col span={24}>
          <Card title="快捷入口" size="small">
            <Space>
              <a href="/stockpool"><Tag icon={<StockOutlined />} color="blue">自选股票</Tag></a>
              <a href="/strategies"><Tag icon={<ExperimentOutlined />} color="purple">策略管理</Tag></a>
              <a href="/backtest"><Tag icon={<ThunderboltOutlined />} color="orange">回测验证</Tag></a>
              <a href="/sim-trade"><Tag icon={<ExperimentOutlined />} color="cyan">模拟交易</Tag></a>
              <a href="/live-trade"><Tag icon={<ThunderboltOutlined />} color="red">实盘交易</Tag></a>
              <a href="/risk"><Tag icon={<SafetyOutlined />} color="gold">风险监控</Tag></a>
              <a href="/ai"><Tag icon={<RobotOutlined />} color="geekblue">AI助手</Tag></a>
            </Space>
          </Card>
        </Col>
      </Row>
    </div>
  )
}