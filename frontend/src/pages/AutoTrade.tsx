import { useState, useEffect, useCallback } from 'react'
import { Card, Row, Col, Statistic, Table, Tag, Space, Button, Switch, Modal, Form, Select, Input, message, List, Typography, Badge, Progress, Timeline, Divider, Alert } from 'antd'
import { ThunderboltOutlined, PlayCircleOutlined, StopOutlined, SyncOutlined, RobotOutlined, PlusOutlined, DeleteOutlined, CheckCircleOutlined, ClockCircleOutlined, RiseOutlined, FallOutlined } from '@ant-design/icons'
import ReactECharts from 'echarts-for-react'
import api from '../services/api'
import { useAuthStore } from '../stores/authStore'

const { Text } = Typography

interface Position {
  symbol: string
  quantity: number
  avg_cost: number
  current_price: number
  market_value: number
  profit: number
  profit_pct: number
}

interface Order {
  id: string
  symbol: string
  direction: string
  price: number
  quantity: number
  status: string
  filled_price: number
  created_at: string
}

interface Signal {
  symbol: string
  signal_type: string
  price: number
  quantity: number
  strength: number
  reason: string
  timestamp: string
}

interface StrategyConfig {
  strategy_id: string
  name: string
  type: string
  symbols: string[]
  enabled: boolean
}

export default function AutoTrade() {
  const { user } = useAuthStore()
  const [engineStatus, setEngineStatus] = useState({ running: false, strategies_count: 0, positions_count: 0, orders_count: 0 })
  const [positions, setPositions] = useState<Position[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [signals, setSignals] = useState<Signal[]>([])
  const [strategies, setStrategies] = useState<StrategyConfig[]>([])
  const [strategyModalVisible, setStrategyModalVisible] = useState(false)
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)

  const loadData = useCallback(async () => {
    try {
      const [statusRes, posRes, ordersRes, signalsRes, strategiesRes] = await Promise.all([
        api.get('/trading/status'),
        api.get('/trading/positions'),
        api.get('/trading/orders'),
        api.get('/trading/signals'),
        api.get('/trading/strategies'),
      ])
      setEngineStatus(statusRes.data)
      setPositions(posRes.data)
      setOrders(ordersRes.data)
      setSignals(signalsRes.data)
      setStrategies(strategiesRes.data)
    } catch (error) {
      console.error('加载数据失败', error)
    }
  }, [])

  useEffect(() => {
    loadData()
    const interval = setInterval(loadData, 5000)
    return () => clearInterval(interval)
  }, [loadData])

  const handleStartEngine = async () => {
    try {
      await api.post('/trading/start')
      message.success('交易引擎已启动')
      loadData()
    } catch (error) {
      message.error('启动失败')
    }
  }

  const handleStopEngine = async () => {
    try {
      await api.post('/trading/stop')
      message.success('交易引擎已停止')
      loadData()
    } catch (error) {
      message.error('停止失败')
    }
  }

  const handleAddStrategy = async () => {
    try {
      const values = await form.validateFields()
      await api.post('/trading/strategies', values)
      message.success('策略已添加')
      setStrategyModalVisible(false)
      form.resetFields()
      loadData()
    } catch (error) {
      message.error('添加失败')
    }
  }

  const handleRemoveStrategy = async (strategyId: string) => {
    try {
      await api.delete(`/trading/strategies/${strategyId}`)
      message.success('策略已移除')
      loadData()
    } catch (error) {
      message.error('移除失败')
    }
  }

  const handleExecuteSignal = async (signalId: number) => {
    try {
      await api.post(`/trading/signals/${signalId}/execute`)
      message.success('信号已执行')
      loadData()
    } catch (error) {
      message.error('执行失败')
    }
  }

  const handleManualOrder = async (order: { symbol: string; direction: string; price: number; quantity: number }) => {
    try {
      await api.post('/trading/orders', order)
      message.success('下单成功')
      loadData()
    } catch (error) {
      message.error('下单失败')
    }
  }

  const positionColumns = [
    { title: '代码', dataIndex: 'symbol', key: 'symbol', width: 80 },
    { title: '持仓', dataIndex: 'quantity', key: 'quantity', width: 80 },
    { title: '成本', dataIndex: 'avg_cost', key: 'avg_cost', width: 80, render: (v: number) => v.toFixed(2) },
    { title: '现价', dataIndex: 'current_price', key: 'current_price', width: 80, render: (v: number) => v.toFixed(2) },
    { title: '市值', dataIndex: 'market_value', key: 'market_value', width: 100, render: (v: number) => v.toLocaleString() },
    { title: '盈亏', dataIndex: 'profit', key: 'profit', width: 80, render: (v: number) => <Text style={{ color: v >= 0 ? '#f5222d' : '#52c41a' }}>{v >= 0 ? '+' : ''}{v.toFixed(2)}</Text> },
    { title: '盈亏%', dataIndex: 'profit_pct', key: 'profit_pct', width: 80, render: (v: number) => <Text style={{ color: v >= 0 ? '#f5222d' : '#52c41a' }}>{v >= 0 ? '+' : ''}{v.toFixed(2)}%</Text> },
  ]

  const orderColumns = [
    { title: '时间', dataIndex: 'created_at', key: 'created_at', width: 160, render: (v: string) => v ? v.split('T')[1]?.split('.')[0] : '-' },
    { title: '代码', dataIndex: 'symbol', key: 'symbol', width: 80 },
    { title: '方向', dataIndex: 'direction', key: 'direction', width: 60, render: (v: string) => <Tag color={v === 'buy' ? 'red' : 'green'}>{v === 'buy' ? '买入' : '卖出'}</Tag> },
    { title: '价格', dataIndex: 'price', key: 'price', width: 80, render: (v: number) => v.toFixed(2) },
    { title: '数量', dataIndex: 'quantity', key: 'quantity', width: 60 },
    { title: '状态', dataIndex: 'status', key: 'status', width: 80, render: (v: string) => <Tag color={v === 'filled' ? 'green' : 'orange'}>{v}</Tag> },
  ]

  const totalProfit = positions.reduce((sum, p) => sum + p.profit, 0)
  const totalValue = positions.reduce((sum, p) => sum + p.market_value, 0)

  const signalPieOption = {
    tooltip: { trigger: 'item' },
    series: [{
      type: 'pie',
      radius: ['40%', '70%'],
      data: [
        { value: signals.filter(s => s.signal_type === 'buy').length, name: '买入信号', itemStyle: { color: '#f5222d' } },
        { value: signals.filter(s => s.signal_type === 'sell').length, name: '卖出信号', itemStyle: { color: '#52c41a' } },
        { value: signals.filter(s => s.signal_type === 'hold').length, name: '持有信号', itemStyle: { color: '#1890ff' } },
      ],
    }],
  }

  return (
    <div>
      <Card
        title={
          <Space>
            <ThunderboltOutlined />
            自动交易引擎
            <Badge status={engineStatus.running ? 'processing' : 'default'} />
            <Tag color={engineStatus.running ? 'green' : 'default'}>
              {engineStatus.running ? '运行中' : '已停止'}
            </Tag>
          </Space>
        }
        extra={
          <Space>
            {engineStatus.running ? (
              <Button danger icon={<StopOutlined />} onClick={handleStopEngine}>停止引擎</Button>
            ) : (
              <Button type="primary" icon={<PlayCircleOutlined />} onClick={handleStartEngine}>启动引擎</Button>
            )}
            <Button icon={<SyncOutlined />} onClick={loadData}>刷新</Button>
          </Space>
        }
      >
        <Alert
          message="自动化交易说明"
          description="自动交易引擎根据预设策略（如均线交叉、RSI、布林带等）自动监控行情并生成交易信号，支持手动确认执行或自动执行。"
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
        />

        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col span={6}><Card size="small"><Statistic title="运行策略" value={engineStatus.strategies_count} suffix="个" /></Card></Col>
          <Col span={6}><Card size="small"><Statistic title="持仓数量" value={engineStatus.positions_count} suffix="只" /></Card></Col>
          <Col span={6}><Card size="small"><Statistic title="总收益" value={totalProfit} precision={2} prefix="¥" valueStyle={{ color: totalProfit >= 0 ? '#f5222d' : '#52c41a' }} /></Card></Col>
          <Col span={6}><Card size="small"><Statistic title="信号总数" value={signals.length} suffix="个" /></Card></Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Card
              title={<Space><RobotOutlined />策略管理</Space>}
              size="small"
              extra={<Button size="small" icon={<PlusOutlined />} onClick={() => setStrategyModalVisible(true)}>添加策略</Button>}
            >
              {strategies.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 20, color: '#999' }}>暂无运行策略</div>
              ) : (
                <List
                  size="small"
                  dataSource={strategies}
                  renderItem={(item) => (
                    <List.Item
                      actions={[<Switch checked={item.enabled} size="small" />, <DeleteOutlined onClick={() => handleRemoveStrategy(item.strategy_id)} />]}
                    >
                      <List.Item.Meta
                        title={item.name}
                        description={<Space><Tag size="small">{item.type}</Tag> {item.symbols.join(', ')}</Space>}
                      />
                    </List.Item>
                  )}
                />
              )}
            </Card>
          </Col>
          <Col span={12}>
            <Card title="信号分布" size="small">
              <ReactECharts option={signalPieOption} style={{ height: 150 }} />
            </Card>
          </Col>
        </Row>
      </Card>

      <Row gutter={16} style={{ marginTop: 16 }}>
        <Col span={12}>
          <Card title="当前持仓" size="small">
            <Table columns={positionColumns} dataSource={positions} rowKey="symbol" pagination={false} size="small" />
          </Card>
        </Col>
        <Col span={12}>
          <Card
            title="交易信号"
            size="small"
            extra={<a href="/ai">更多信号</a>}
          >
            <List
              size="small"
              dataSource={signals.slice(0, 8)}
              renderItem={(item, index) => (
                <List.Item>
                  <Tag color={item.signal_type === 'buy' ? 'red' : item.signal_type === 'sell' ? 'green' : 'blue'}>{item.symbol}</Tag>
                  <Text>{item.reason}</Text>
                  <Space>
                    <Text type="secondary">{item.price.toFixed(2)}</Text>
                    <Progress percent={item.strength} size="small" style={{ width: 60 }} />
                    {item.signal_type !== 'hold' && (
                      <Button size="small" type="primary" icon={<CheckCircleOutlined />} onClick={() => handleExecuteSignal(index)}>
                        执行
                      </Button>
                    )}
                  </Space>
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>

      <Card title="最近订单" size="small" style={{ marginTop: 16 }}>
        <Table columns={orderColumns} dataSource={orders.slice(0, 10)} rowKey="id" pagination={false} size="small" />
      </Card>

      <Modal
        title="添加自动交易策略"
        open={strategyModalVisible}
        onCancel={() => setStrategyModalVisible(false)}
        onOk={handleAddStrategy}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="strategy_id" label="策略ID" rules={[{ required: true, message: '请输入策略ID' }]}>
            <Input placeholder="如: ma_cross_001" />
          </Form.Item>
          <Form.Item name="name" label="策略名称" rules={[{ required: true, message: '请输入策略名称' }]}>
            <Input placeholder="如: 双均线策略" />
          </Form.Item>
          <Form.Item name="type" label="策略类型" rules={[{ required: true, message: '请选择策略类型' }]}>
            <Select>
              <Select.Option value="ma_cross">均线交叉策略</Select.Option>
              <Select.Option value="rsi">RSI超买超卖策略</Select.Option>
              <Select.Option value="bollinger">布林带策略</Select.Option>
              <Select.Option value="macd">MACD策略</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="symbols" label="监控股票" rules={[{ required: true, message: '请输入股票代码' }]}>
            <Select mode="tags" placeholder="输入股票代码，如 600519">
              <Select.Option value="600519">600519 贵州茅台</Select.Option>
              <Select.Option value="000858">000858 五粮液</Select.Option>
              <Select.Option value="601318">601318 中国平安</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}