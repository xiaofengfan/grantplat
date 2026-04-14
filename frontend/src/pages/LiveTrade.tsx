import { useState, useEffect } from 'react'
import { Card, Row, Col, Table, Button, Space, Tag, Modal, Form, Input, Select, Tabs, Alert, Statistic, Divider, List, Typography, InputNumber, Badge } from 'antd'
import { PlusOutlined, SyncOutlined, ThunderboltOutlined, CloudOutlined, LaptopOutlined, RiseOutlined, FallOutlined, SearchOutlined, InfoCircleOutlined } from '@ant-design/icons'
import ReactECharts from 'echarts-for-react'

const { Text } = Typography

export default function LiveTrade() {
  const [selectedStock, setSelectedStock] = useState<{ code: string; name: string; price: number; change: number; changePct: number }>({ code: '600519', name: '贵州茅台', price: 1720.30, change: 39.80, changePct: 2.37 })
  const [orderVisible, setOrderVisible] = useState(false)
  const [mode, setMode] = useState<'cloud' | 'local'>('cloud')
  const [activeTab, setActiveTab] = useState('positions')
  const [searchValue, setSearchValue] = useState('')
  const [direction, setDirection] = useState<'buy' | 'sell'>('buy')
  const [orderPrice, setOrderPrice] = useState(1720.30)
  const [orderQuantity, setOrderQuantity] = useState(100)
  const [form] = Form.useForm()

  const positions = [
    { key: '1', symbol: '600519', name: '贵州茅台', quantity: 100, avg_cost: 1680.50, current_price: 1720.30, market_value: 172030, profit: 3980, profit_pct: 2.37 },
    { key: '2', symbol: '000858', name: '五粮液', quantity: 200, avg_cost: 142.00, current_price: 145.20, market_value: 29040, profit: 640, profit_pct: 2.25 },
    { key: '3', symbol: '601318', name: '中国平安', quantity: 500, avg_cost: 43.20, current_price: 42.80, market_value: 21400, profit: -200, profit_pct: -0.93 },
  ]

  const todayOrders = [
    { key: '1', time: '14:30:15', symbol: '600519', name: '贵州茅台', direction: '买入', price: 1720.00, quantity: 100, status: '已成', type: '委托' },
    { key: '2', time: '14:25:32', symbol: '000858', name: '五粮液', direction: '卖出', price: 145.00, quantity: 200, status: '已成', type: '委托' },
    { key: '3', time: '14:20:00', symbol: '601318', name: '中国平安', direction: '买入', price: 42.80, quantity: 500, status: '已报', type: '委托' },
  ]

  const todayDeals = [
    { key: '1', time: '14:30:15', symbol: '600519', name: '贵州茅台', direction: '买入', price: 1720.00, quantity: 100, amount: 172000 },
    { key: '2', time: '14:25:32', symbol: '000858', name: '五粮液', direction: '卖出', price: 145.00, quantity: 200, amount: 29000 },
  ]

  const fundPositions = [
    { key: '1', time: '09:30:00', symbol: '600519', name: '贵州茅台', direction: '流入', amount: 1250000, proportion: 15.2 },
    { key: '2', time: '09:30:00', symbol: '000858', name: '五粮液', direction: '流出', amount: 580000, proportion: 7.1 },
  ]

  const stockList = [
    { symbol: '600519', name: '贵州茅台', price: 1720.30, change: 2.37 },
    { symbol: '000858', name: '五粮液', price: 145.20, change: 1.85 },
    { symbol: '601318', name: '中国平安', price: 42.80, change: -0.48 },
    { symbol: '000001', name: '平安银行', price: 11.23, change: 0.45 },
    { symbol: '600036', name: '招商银行', price: 35.67, change: 1.12 },
    { symbol: '000002', name: '万科A', price: 8.45, change: -1.52 },
  ]

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
      {
        name: 'K线', type: 'candlestick', data: [
          [1020, 1130, 1000, 1120], [1120, 1220, 1100, 1200], [1200, 1300, 1180, 1280],
          [1280, 1380, 1250, 1350], [1350, 1450, 1320, 1420], [1420, 1520, 1400, 1500],
          [1500, 1600, 1480, 1580], [1580, 1680, 1550, 1650], [1650, 1750, 1620, 1720],
          [1720, 1820, 1700, 1800], [1800, 1900, 1780, 1880], [1880, 1980, 1850, 1950],
        ],
      },
    ],
  }

  const minuteOption = {
    tooltip: { trigger: 'axis' },
    grid: { left: '3%', right: '4%', bottom: '3%', top: 20, containLabel: true },
    xAxis: { type: 'category', data: ['09:30', '10:00', '10:30', '11:00', '11:30', '13:00', '13:30', '14:00', '14:30', '15:00'], boundaryGap: false },
    yAxis: { type: 'value', scale: true, splitLine: { lineStyle: { type: 'dashed' } } },
    series: [
      { name: '价格', type: 'line', data: [1700, 1705, 1710, 1715, 1710, 1718, 1720, 1715, 1720, 1720.30], smooth: true, areaStyle: { opacity: 0.2 } },
    ],
  }

  const positionColumns = [
    { title: '代码', dataIndex: 'symbol', key: 'symbol', width: 80 },
    { title: '名称', dataIndex: 'name', key: 'name', width: 80 },
    { title: '持仓', dataIndex: 'quantity', key: 'quantity', width: 60 },
    { title: '成本', dataIndex: 'avg_cost', key: 'avg_cost', width: 80, render: (v: number) => v.toFixed(2) },
    { title: '现价', dataIndex: 'current_price', key: 'current_price', width: 80, render: (v: number) => v.toFixed(2) },
    { title: '市值', dataIndex: 'market_value', key: 'market_value', width: 100, render: (v: number) => v.toLocaleString() },
    { title: '盈亏', dataIndex: 'profit', key: 'profit', width: 80, render: (v: number) => <Text style={{ color: v >= 0 ? '#f5222d' : '#52c41a' }}>{v >= 0 ? '+' : ''}{v.toFixed(0)}</Text> },
    { title: '盈亏%', dataIndex: 'profit_pct', key: 'profit_pct', width: 80, render: (v: number) => <Text style={{ color: v >= 0 ? '#f5222d' : '#52c41a' }}>{v >= 0 ? '+' : ''}{v.toFixed(2)}%</Text> },
    { title: '操作', key: 'action', width: 100, render: () => <Button size="small" type="link">详情</Button> },
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

  const dealColumns = [
    { title: '时间', dataIndex: 'time', key: 'time', width: 90 },
    { title: '代码', dataIndex: 'symbol', key: 'symbol', width: 80 },
    { title: '名称', dataIndex: 'name', key: 'name', width: 80 },
    { title: '方向', dataIndex: 'direction', key: 'direction', width: 60, render: (v: string) => <Tag color={v === '买入' ? 'red' : 'green'}>{v}</Tag> },
    { title: '价格', dataIndex: 'price', key: 'price', width: 80, render: (v: number) => v.toFixed(2) },
    { title: '数量', dataIndex: 'quantity', key: 'quantity', width: 60 },
    { title: '金额', dataIndex: 'amount', key: 'amount', width: 100, render: (v: number) => v.toLocaleString() },
  ]

  const fundColumns = [
    { title: '时间', dataIndex: 'time', key: 'time', width: 90 },
    { title: '代码', dataIndex: 'symbol', key: 'symbol', width: 80 },
    { title: '名称', dataIndex: 'name', key: 'name', width: 80 },
    { title: '流向', dataIndex: 'direction', key: 'direction', width: 60, render: (v: string) => <Tag color={v === '流入' ? 'red' : 'green'}>{v}</Tag> },
    { title: '净流入', dataIndex: 'amount', key: 'amount', width: 100, render: (v: number) => <Text style={{ color: v >= 0 ? '#f5222d' : '#52c41a' }}>{Math.abs(v).toLocaleString()}</Text> },
    { title: '占比', dataIndex: 'proportion', key: 'proportion', width: 80, render: (v: number) => `${v.toFixed(1)}%` },
  ]

  const handleStockSelect = (stock: typeof stockList[0]) => {
    setSelectedStock({ ...stock, change: stock.price * stock.change / 100, changePct: stock.change })
    setOrderPrice(stock.price)
  }

  const handleSubmitOrder = () => {
    console.log('下单', { direction, price: orderPrice, quantity: orderQuantity, symbol: selectedStock.code })
    setOrderVisible(false)
  }

  const filteredStocks = searchValue
    ? stockList.filter(s => s.symbol.includes(searchValue) || s.name.includes(searchValue))
    : stockList

  return (
    <div style={{ padding: 0 }}>
      <Row gutter={8} style={{ height: 'calc(100vh - 140px)' }}>
        <Col span={4} style={{ height: '100%' }}>
          <Card title="自选股" size="small" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Input prefix={<SearchOutlined />} placeholder="搜索股票" value={searchValue} onChange={e => setSearchValue(e.target.value)} size="small" style={{ marginBottom: 8 }} />
            <div style={{ flex: 1, overflow: 'auto' }}>
              {filteredStocks.map(stock => (
                <div
                  key={stock.symbol}
                  onClick={() => handleStockSelect(stock)}
                  style={{
                    padding: '8px 4px', cursor: 'pointer', borderBottom: '1px solid #f0f0f0',
                    background: selectedStock.code === stock.symbol ? '#e6f7ff' : 'transparent'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Text strong>{stock.name}</Text>
                    <Text style={{ color: stock.change >= 0 ? '#f5222d' : '#52c41a' }}>{stock.price.toFixed(2)}</Text>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                    <Text type="secondary">{stock.symbol}</Text>
                    <Text style={{ color: stock.change >= 0 ? '#f5222d' : '#52c41a' }}>
                      {stock.change >= 0 ? <RiseOutlined /> : <FallOutlined />} {stock.change.toFixed(2)}%
                    </Text>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </Col>

        <Col span={10} style={{ height: '100%', display: 'flex', flexDirection: 'column', gap: 8 }}>
          <Card size="small" style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <Space>
                <Text strong style={{ fontSize: 18 }}>{selectedStock.name}</Text>
                <Text type="secondary">{selectedStock.code}</Text>
              </Space>
              <Space>
                <Text style={{ fontSize: 24, color: selectedStock.changePct >= 0 ? '#f5222d' : '#52c41a' }}>
                  {selectedStock.price.toFixed(2)}
                </Text>
                <div>
                  <Text style={{ color: selectedStock.changePct >= 0 ? '#f5222d' : '#52c41a' }}>
                    {selectedStock.changePct >= 0 ? <RiseOutlined /> : <FallOutlined />} {Math.abs(selectedStock.change).toFixed(2)}
                  </Text>
                  <br />
                  <Text style={{ color: selectedStock.changePct >= 0 ? '#f5222d' : '#52c41a' }}>
                    {selectedStock.changePct >= 0 ? '+' : ''}{selectedStock.changePct.toFixed(2)}%
                  </Text>
                </div>
              </Space>
            </div>
            <Tabs
              size="small"
              items={[
                { key: 'minute', label: '分时', children: <ReactECharts option={minuteOption} style={{ height: 200 }} /> },
                { key: 'day', label: '日K', children: <ReactECharts option={klineOption} style={{ height: 200 }} /> },
                { key: 'week', label: '周K', children: <ReactECharts option={klineOption} style={{ height: 200 }} /> },
                { key: 'month', label: '月K', children: <ReactECharts option={klineOption} style={{ height: 200 }} /> },
              ]}
            />
          </Card>

          <Card size="small" title="交易面板">
            <Row gutter={8}>
              <Col span={12}>
                <Space direction="vertical" style={{ width: '100%' }}>
                  <Text type="secondary">买入价</Text>
                  <InputNumber
                    style={{ width: '100%' }}
                    value={orderPrice}
                    onChange={v => setOrderPrice(v || 0)}
                    precision={2}
                    min={0}
                    prefix="¥"
                  />
                </Space>
              </Col>
              <Col span={12}>
                <Space direction="vertical" style={{ width: '100%' }}>
                  <Text type="secondary">数量(手)</Text>
                  <InputNumber
                    style={{ width: '100%' }}
                    value={orderQuantity}
                    onChange={v => setOrderQuantity(v || 0)}
                    min={1}
                    max={10000}
                    step={100}
                  />
                </Space>
              </Col>
            </Row>
            <Row gutter={8} style={{ marginTop: 12 }}>
              <Col span={12}>
                <Text type="secondary">买入金额: ¥{(orderPrice * orderQuantity).toLocaleString()}</Text>
              </Col>
              <Col span={12}>
                <Text type="secondary">可买最大: 553手</Text>
              </Col>
            </Row>
            <Divider style={{ margin: '12px 0' }} />
            <Row gutter={8}>
              <Col span={12}>
                <Button
                  type="primary"
                  danger
                  block
                  size="large"
                  onClick={() => { setDirection('buy'); setOrderVisible(true); }}
                >
                  买入 {selectedStock.name}
                </Button>
              </Col>
              <Col span={12}>
                <Button
                  type="primary"
                  color="green"
                  block
                  size="large"
                  style={{ background: '#52c41a' }}
                  onClick={() => { setDirection('sell'); setOrderVisible(true); }}
                >
                  卖出 {selectedStock.name}
                </Button>
              </Col>
            </Row>
          </Card>

          <Card size="small" title="快捷下单">
            <Space wrap>
              <Button onClick={() => setOrderQuantity(100)}>100</Button>
              <Button onClick={() => setOrderQuantity(200)}>200</Button>
              <Button onClick={() => setOrderQuantity(500)}>500</Button>
              <Button onClick={() => setOrderQuantity(1000)}>1000</Button>
              <Button onClick={() => setOrderQuantity(2000)}>2000</Button>
              <Button onClick={() => setOrderQuantity(5000)}>5000</Button>
            </Space>
          </Card>
        </Col>

        <Col span={10} style={{ height: '100%' }}>
          <Card size="small" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Space style={{ marginBottom: 8 }}>
              <Button size="small" type={activeTab === 'positions' ? 'primary' : 'default'} onClick={() => setActiveTab('positions')}>持仓</Button>
              <Button size="small" type={activeTab === 'orders' ? 'primary' : 'default'} onClick={() => setActiveTab('orders')}>当日委托</Button>
              <Button size="small" type={activeTab === 'deals' ? 'primary' : 'default'} onClick={() => setActiveTab('deals')}>当日成交</Button>
              <Button size="small" type={activeTab === 'funds' ? 'primary' : 'default'} onClick={() => setActiveTab('funds')}>资金流向</Button>
            </Space>
            <div style={{ flex: 1, overflow: 'auto' }}>
              {activeTab === 'positions' && (
                <Table
                  columns={positionColumns}
                  dataSource={positions}
                  pagination={false}
                  size="small"
                  summary={() => (
                    <Table.Summary fixed>
                      <Table.Summary.Row>
                        <Table.Summary.Cell index={0} colSpan={2}>合计</Table.Summary.Cell>
                        <Table.Summary.Cell index={1}>800</Table.Summary.Cell>
                        <Table.Summary.Cell index={2}></Table.Summary.Cell>
                        <Table.Summary.Cell index={3}></Table.Summary.Cell>
                        <Table.Summary.Cell index={4}>222,470</Table.Summary.Cell>
                        <Table.Summary.Cell index={5}><Text style={{ color: '#f5222d' }}>+4,420</Text></Table.Summary.Cell>
                        <Table.Summary.Cell index={6}><Text style={{ color: '#f5222d' }}>+2.02%</Text></Table.Summary.Cell>
                      </Table.Summary.Row>
                    </Table.Summary>
                  )}
                />
              )}
              {activeTab === 'orders' && <Table columns={orderColumns} dataSource={todayOrders} pagination={false} size="small" />}
              {activeTab === 'deals' && <Table columns={dealColumns} dataSource={todayDeals} pagination={false} size="small" />}
              {activeTab === 'funds' && <Table columns={fundColumns} dataSource={fundPositions} pagination={false} size="small" />}
            </div>
            <Divider style={{ margin: '8px 0' }} />
            <Row gutter={8}>
              <Col span={6}><Statistic title="总资产" value={1125840.50} precision={2} prefix="¥" size="small" /></Col>
              <Col span={6}><Statistic title="持仓市值" value={222470.00} precision={2} prefix="¥" size="small" /></Col>
              <Col span={6}><Statistic title="可用资金" value={903370.50} precision={2} prefix="¥" size="small" /></Col>
              <Col span={6}><Statistic title="今日盈亏" value={4420.00} precision={2} prefix="¥" valueStyle={{ color: '#f5222d', fontSize: 14 }} size="small" /></Col>
            </Row>
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
                <Input value={selectedStock.code} disabled />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="股票名称">
                <Input value={selectedStock.name} disabled />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="买入价格" required>
                <InputNumber style={{ width: '100%' }} value={orderPrice} onChange={v => setOrderPrice(v || 0)} precision={2} min={0} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="买入数量" required>
                <InputNumber style={{ width: '100%' }} value={orderQuantity} onChange={v => setOrderQuantity(v || 0)} min={1} max={10000} />
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