import { useState } from 'react'
import { Card, Row, Col, Table, Button, Space, Tag, Modal, Form, InputNumber, Tabs, Divider, List, Typography, Statistic, message, Alert, Badge, Progress } from 'antd'
import { RiseOutlined, FallOutlined, SearchOutlined, ThunderboltOutlined, SyncOutlined, InfoCircleOutlined, BarChartOutlined, FundOutlined, WalletOutlined } from '@ant-design/icons'
import ReactECharts from 'echarts-for-react'

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

interface QuoteData {
  label: string
  value: string | number
  color?: string
}

interface Indicator {
  name: string
  value: number
  signal: 'buy' | 'sell' | 'neutral'
  desc: string
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
  ]

  const todayOrders = [
    { key: '1', time: '14:30:15', symbol: '600519', name: '贵州茅台', direction: '买入', price: 1720.00, quantity: 100, status: '已成' },
    { key: '2', time: '14:25:32', symbol: '000858', name: '五粮液', direction: '卖出', price: 145.00, quantity: 200, status: '已成' },
    { key: '3', time: '14:20:00', symbol: '601318', name: '中国平安', direction: '买入', price: 42.80, quantity: 500, status: '已报' },
  ]

  const quoteData: QuoteData[] = [
    { label: '今开', value: selectedStock.open.toFixed(2) },
    { label: '昨收', value: selectedStock.prevClose.toFixed(2) },
    { label: '最高', value: selectedStock.high.toFixed(2), color: '#f5222d' },
    { label: '最低', value: selectedStock.low.toFixed(2), color: '#52c41a' },
    { label: '成交量', value: (selectedStock.volume / 10000).toFixed(2) + '万' },
    { label: '成交额', value: (selectedStock.amount / 100000000).toFixed(2) + '亿' },
  ]

  const indicators: Indicator[] = [
    { name: 'MACD', value: 12.35, signal: 'buy', desc: '金叉信号' },
    { name: 'KDJ', value: 78.5, signal: 'buy', desc: '超买区域' },
    { name: 'RSI', value: 65.2, signal: 'neutral', desc: '中性区域' },
    { name: '布林带', value: 1725, signal: 'sell', desc: '上轨压力' },
    { name: 'MA5', value: 1715.6, signal: 'buy', desc: '价格线上穿' },
    { name: 'MA10', value: 1698.3, signal: 'buy', desc: '多头排列' },
    { name: 'MA20', value: 1685.0, signal: 'buy', desc: '趋势向上' },
    { name: 'VOL', value: 1.25, signal: 'neutral', desc: '量能温和' },
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

  const positionColumns = [
    { title: '代码', dataIndex: 'symbol', key: 'symbol', width: 80 },
    { title: '名称', dataIndex: 'name', key: 'name', width: 80 },
    { title: '持仓', dataIndex: 'quantity', key: 'quantity', width: 60 },
    { title: '成本', dataIndex: 'avg_cost', key: 'avg_cost', width: 80, render: (v: number) => v.toFixed(2) },
    { title: '现价', dataIndex: 'current_price', key: 'current_price', width: 80, render: (v: number) => v.toFixed(2) },
    { title: '市值', dataIndex: 'market_value', key: 'market_value', width: 100, render: (v: number) => v.toLocaleString() },
    { title: '盈亏', dataIndex: 'profit', key: 'profit', width: 80, render: (v: number) => <Text style={{ color: v >= 0 ? '#f5222d' : '#52c41a' }}>{v >= 0 ? '+' : ''}{v.toFixed(0)}</Text> },
    { title: '盈亏%', dataIndex: 'profit_pct', key: 'profit_pct', width: 80, render: (v: number) => <Text style={{ color: v >= 0 ? '#f5222d' : '#52c41a' }}>{v >= 0 ? '+' : ''}{v.toFixed(2)}%</Text> },
  ]

  const orderColumns = [
    { title: '时间', dataIndex: 'time', key: 'time', width: 90 },
    { title: '代码', dataIndex: 'symbol', key: 'symbol', width: 80 },
    { title: '名称', dataIndex: 'name', key: 'name', width: 80 },
    { title: '方向', dataIndex: 'direction', key: 'direction', width: 60, render: (v: string) => <Tag color={v === '买入' ? 'red' : 'green'}>{v}</Tag> },
    { title: '价格', dataIndex: 'price', key: 'price', width: 80, render: (v: number) => v.toFixed(2) },
    { title: '数量', dataIndex: 'quantity', key: 'quantity', width: 60 },
    { title: '状态', dataIndex: 'status', key: 'status', width: 60, render: (v: string) => <Badge status={v === '已成' ? 'success' : 'processing'} text={v} /> },
    { title: '操作', key: 'action', width: 60, render: () => <Button size="small" type="link">撤单</Button> },
  ]

  const getIndicatorColor = (signal: string) => {
    switch (signal) {
      case 'buy': return '#f5222d'
      case 'sell': return '#52c41a'
      default: return '#999'
    }
  }

  const getIndicatorBg = (signal: string) => {
    switch (signal) {
      case 'buy': return 'rgba(245, 34, 45, 0.1)'
      case 'sell': return 'rgba(82, 196, 26, 0.1)'
      default: return 'rgba(153, 153, 153, 0.1)'
    }
  }

  return (
    <div style={{ padding: 0, height: 'calc(100vh - 140px)' }}>
      <Row gutter={8} style={{ height: '100%' }}>
        <Col span={4} style={{ height: '100%' }}>
          <Card title="自选股" size="small" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <InputNumber
              placeholder="搜索股票"
              value={searchValue}
              onChange={v => setSearchValue(String(v || ''))}
              style={{ width: '100%', marginBottom: 8 }}
              size="small"
              prefix={<SearchOutlined />}
            />
            <div style={{ flex: 1, overflow: 'auto' }}>
              {filteredStocks.map(stock => (
                <div
                  key={stock.symbol}
                  onClick={() => handleStockSelect(stock)}
                  style={{
                    padding: '8px 4px', cursor: 'pointer', borderBottom: '1px solid #f0f0f0',
                    background: selectedStock.symbol === stock.symbol ? '#e6f7ff' : 'transparent'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Text strong>{stock.name}</Text>
                    <Text style={{ color: stock.changePct >= 0 ? '#f5222d' : '#52c41a' }}>{stock.price.toFixed(2)}</Text>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                    <Text type="secondary">{stock.symbol}</Text>
                    <Text style={{ color: stock.changePct >= 0 ? '#f5222d' : '#52c41a' }}>
                      {stock.changePct >= 0 ? <RiseOutlined /> : <FallOutlined />} {Math.abs(stock.changePct).toFixed(2)}%
                    </Text>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </Col>

        <Col span={12} style={{ height: '100%', display: 'flex', flexDirection: 'column', gap: 8 }}>
          <Card size="small" style={{ flex: '0 0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Space>
                <Text strong style={{ fontSize: 20 }}>{selectedStock.name}</Text>
                <Text type="secondary">{selectedStock.symbol}</Text>
                <Tag color={selectedStock.changePct >= 0 ? 'red' : 'green'}>
                  {selectedStock.changePct >= 0 ? <RiseOutlined /> : <FallOutlined />} {Math.abs(selectedStock.changePct).toFixed(2)}%
                </Tag>
              </Space>
              <Space size="large">
                <div style={{ textAlign: 'right' }}>
                  <Text style={{ fontSize: 28, color: selectedStock.changePct >= 0 ? '#f5222d' : '#52c41a', fontWeight: 'bold' }}>
                    {selectedStock.price.toFixed(2)}
                  </Text>
                  <Text type="secondary" style={{ marginLeft: 8 }}>
                    {selectedStock.change >= 0 ? '+' : ''}{selectedStock.change.toFixed(2)}
                  </Text>
                </div>
              </Space>
            </div>

            <Row gutter={16} style={{ marginTop: 12 }}>
              {quoteData.map((item, idx) => (
                <Col key={idx} span={4}>
                  <Text type="secondary" style={{ fontSize: 12 }}>{item.label}</Text>
                  <br />
                  <Text style={{ color: item.color || 'inherit', fontSize: 13 }}>{item.value}</Text>
                </Col>
              ))}
            </Row>
          </Card>

          <Card size="small" style={{ flex: 1 }}>
            <Tabs
              size="small"
              items={[
                { key: 'minute', label: '分时', children: <ReactECharts option={minuteOption} style={{ height: 220 }} /> },
                { key: 'day', label: '日K', children: <ReactECharts option={klineOption} style={{ height: 220 }} /> },
                { key: 'week', label: '周K', children: <ReactECharts option={klineOption} style={{ height: 220 }} /> },
                { key: 'month', label: '月K', children: <ReactECharts option={klineOption} style={{ height: 220 }} /> },
              ]}
            />
          </Card>

          <Card size="small" title="量化指标跟踪">
            <Row gutter={[8, 8]}>
              {indicators.map((ind, idx) => (
                <Col key={idx} span={6}>
                  <div style={{ background: getIndicatorBg(ind.signal), padding: '8px 12px', borderRadius: 4, border: `1px solid ${getIndicatorColor(ind.signal)}30` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Text type="secondary" style={{ fontSize: 12 }}>{ind.name}</Text>
                      <Tag color={ind.signal === 'buy' ? 'red' : ind.signal === 'sell' ? 'green' : 'default'} style={{ margin: 0, fontSize: 10 }}>
                        {ind.signal === 'buy' ? '买入' : ind.signal === 'sell' ? '卖出' : '中性'}
                      </Tag>
                    </div>
                    <Text strong style={{ fontSize: 16, color: getIndicatorColor(ind.signal) }}>{ind.value}</Text>
                    <br />
                    <Text type="secondary" style={{ fontSize: 11 }}>{ind.desc}</Text>
                  </div>
                </Col>
              ))}
            </Row>
          </Card>
        </Col>

        <Col span={8} style={{ height: '100%', display: 'flex', flexDirection: 'column', gap: 8 }}>
          <Card size="small" title="交易操作" extra={<Space><SyncOutlined /><ThunderboltOutlined /></Space>}>
            <div style={{ background: '#fafafa', padding: 16, borderRadius: 8, marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                <Text type="secondary">当前选中</Text>
                <Text strong>{selectedStock.name} ({selectedStock.symbol})</Text>
              </div>
              <Row gutter={8}>
                <Col span={12}>
                  <Text type="secondary" style={{ fontSize: 12 }}>买入价</Text>
                  <InputNumber
                    style={{ width: '100%', marginTop: 4 }}
                    value={orderPrice}
                    onChange={v => setOrderPrice(v || 0)}
                    precision={2}
                    min={0}
                    prefix="¥"
                  />
                </Col>
                <Col span={12}>
                  <Text type="secondary" style={{ fontSize: 12 }}>数量(手)</Text>
                  <InputNumber
                    style={{ width: '100%', marginTop: 4 }}
                    value={orderQuantity}
                    onChange={v => setOrderQuantity(v || 0)}
                    min={1}
                    max={10000}
                    step={100}
                  />
                </Col>
              </Row>
              <div style={{ marginTop: 8, display: 'flex', justifyContent: 'space-between' }}>
                <Text type="secondary">买入金额:</Text>
                <Text strong>¥{(orderPrice * orderQuantity).toLocaleString()}</Text>
              </div>
              <div style={{ marginTop: 4, display: 'flex', justifyContent: 'space-between' }}>
                <Text type="secondary">可买最大:</Text>
                <Text>553手</Text>
              </div>
            </div>

            <Space wrap style={{ width: '100%', marginBottom: 12 }}>
              <Button onClick={() => setOrderQuantity(100)} size="small">100</Button>
              <Button onClick={() => setOrderQuantity(200)} size="small">200</Button>
              <Button onClick={() => setOrderQuantity(500)} size="small">500</Button>
              <Button onClick={() => setOrderQuantity(1000)} size="small">1000</Button>
              <Button onClick={() => setOrderQuantity(2000)} size="small">2000</Button>
              <Button onClick={() => setOrderQuantity(5000)} size="small">5000</Button>
            </Space>

            <Row gutter={8}>
              <Col span={12}>
                <Button
                  type="primary"
                  danger
                  block
                  size="large"
                  onClick={() => { setDirection('buy'); setOrderVisible(true); }}
                  icon={<RiseOutlined />}
                >
                  买入
                </Button>
              </Col>
              <Col span={12}>
                <Button
                  type="primary"
                  block
                  size="large"
                  style={{ background: '#52c41a', borderColor: '#52c41a' }}
                  onClick={() => { setDirection('sell'); setOrderVisible(true); }}
                  icon={<FallOutlined />}
                >
                  卖出
                </Button>
              </Col>
            </Row>
          </Card>

          <Card size="small" title="持仓" style={{ flex: 1 }}>
            <Table
              columns={positionColumns}
              dataSource={positions}
              pagination={false}
              size="small"
              scroll={{ y: 120 }}
              summary={() => (
                <Table.Summary fixed>
                  <Table.Summary.Row>
                    <Table.Summary.Cell index={0} colSpan={2}>合计</Table.Summary.Cell>
                    <Table.Summary.Cell index={1}>800</Table.Summary.Cell>
                    <Table.Summary.Cell index={2}></Table.Summary.Cell>
                    <Table.Summary.Cell index={3}>222,470</Table.Summary.Cell>
                    <Table.Summary.Cell index={4}><Text style={{ color: '#f5222d' }}>+4,420</Text></Table.Summary.Cell>
                    <Table.Summary.Cell index={5}><Text style={{ color: '#f5222d' }}>+2.02%</Text></Table.Summary.Cell>
                  </Table.Summary.Row>
                </Table.Summary>
              )}
            />
          </Card>

          <Card size="small" title="账户概览">
            <Row gutter={8}>
              <Col span={12}><Statistic title="总资产" value={1125840.50} precision={2} prefix="¥" valueStyle={{ fontSize: 14 }} /></Col>
              <Col span={12}><Statistic title="持仓市值" value={222470.00} precision={2} prefix="¥" valueStyle={{ fontSize: 14 }} /></Col>
              <Col span={12}><Statistic title="可用资金" value={903370.50} precision={2} prefix="¥" valueStyle={{ fontSize: 14 }} /></Col>
              <Col span={12}><Statistic title="今日盈亏" value={4420.00} precision={2} prefix="¥" valueStyle={{ color: '#f5222d', fontSize: 14 }} /></Col>
            </Row>
          </Card>

          <Card size="small" title="当日委托" extra={<Button type="link" size="small">查看全部</Button>}>
            <Table columns={orderColumns} dataSource={todayOrders} pagination={false} size="small" scroll={{ y: 100 }} />
          </Card>
        </Col>
      </Row>

      <Modal
        title={`${direction === 'buy' ? '买入' : '卖出'} ${selectedStock.name}`}
        open={orderVisible}
        onCancel={() => setOrderVisible(false)}
        onOk={handleSubmitOrder}
        okText={direction === 'buy' ? '买入' : '卖出'}
        okButtonProps={{ danger: direction === 'buy', style: { background: direction === 'sell' ? '#52c41a' : undefined } }}
      >
        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="股票代码">
                <InputNumber style={{ width: '100%' }} value={selectedStock.symbol} disabled />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="股票名称">
                <InputNumber style={{ width: '100%' }} value={selectedStock.name} disabled />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="价格" required>
                <InputNumber style={{ width: '100%' }} value={orderPrice} onChange={v => setOrderPrice(v || 0)} precision={2} min={0} prefix="¥" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="数量" required>
                <InputNumber style={{ width: '100%' }} value={orderQuantity} onChange={v => setOrderQuantity(v || 0)} min={1} max={10000} suffix="手" />
              </Form.Item>
            </Col>
          </Row>
          <Alert
            message={`买入金额: ¥${(orderPrice * orderQuantity).toLocaleString()}, 手续费: ¥${(orderPrice * orderQuantity * 0.0003).toFixed(2)}`}
            type="info"
            showIcon
            icon={<InfoCircleOutlined />}
          />
        </Form>
      </Modal>
    </div>
  )
}