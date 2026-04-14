import { useState } from 'react'
import { Card, Row, Col, Statistic, Table, Button, Space, Tag, Switch, message } from 'antd'
import { ReloadOutlined } from '@ant-design/icons'
import ReactECharts from 'echarts-for-react'

export default function SimTrade() {
  const [enabled, setEnabled] = useState(true)

  const handleToggle = (checked: boolean) => {
    setEnabled(checked)
    message.success(checked ? '模拟交易已启动' : '模拟交易已暂停')
  }

  const positions = [
    { key: '1', symbol: '600519', name: '贵州茅台', quantity: 100, avg_price: 1680.50, current_price: 1720.30, market_value: 172030, profit: 3980, profit_pct: 2.37 },
    { key: '2', symbol: '000858', name: '五粮液', quantity: 200, avg_price: 142.00, current_price: 145.20, market_value: 29040, profit: 640, profit_pct: 2.25 },
  ]

  const trades = [
    { key: '1', time: '10:30:15', symbol: '600519', name: '贵州茅台', direction: '买入', quantity: 100, price: 1680.50, amount: 168050 },
    { key: '2', time: '10:15:32', symbol: '000858', name: '五粮液', direction: '卖出', quantity: 200, price: 145.20, amount: 29040 },
  ]

  const positionColumns = [
    { title: '代码', dataIndex: 'symbol', key: 'symbol' },
    { title: '名称', dataIndex: 'name', key: 'name' },
    { title: '持仓数量', dataIndex: 'quantity', key: 'quantity' },
    { title: '均价', dataIndex: 'avg_price', key: 'avg_price', render: (v: number) => v.toFixed(2) },
    { title: '现价', dataIndex: 'current_price', key: 'current_price', render: (v: number) => v.toFixed(2) },
    { title: '市值', dataIndex: 'market_value', key: 'market_value', render: (v: number) => v.toLocaleString() },
    { title: '浮动盈亏', key: 'profit', render: (_: any, r: any) => <span style={{ color: r.profit >= 0 ? '#f5222d' : '#52c41a' }}>{r.profit >= 0 ? '+' : ''}{r.profit.toLocaleString()}</span> },
    { title: '盈亏%', dataIndex: 'profit_pct', key: 'profit_pct', render: (v: number) => <span style={{ color: v >= 0 ? '#f5222d' : '#52c41a' }}>{v.toFixed(2)}%</span> },
  ]

  const tradeColumns = [
    { title: '时间', dataIndex: 'time', key: 'time' },
    { title: '代码', dataIndex: 'symbol', key: 'symbol' },
    { title: '名称', dataIndex: 'name', key: 'name' },
    { title: '方向', dataIndex: 'direction', key: 'direction', render: (v: string) => <Tag color={v === '买入' ? 'red' : 'green'}>{v}</Tag> },
    { title: '数量', dataIndex: 'quantity', key: 'quantity' },
    { title: '价格', dataIndex: 'price', key: 'price', render: (v: number) => v.toFixed(2) },
    { title: '金额', dataIndex: 'amount', key: 'amount', render: (v: number) => v.toLocaleString() },
  ]

  const equityCurveOption = {
    tooltip: { trigger: 'axis' },
    xAxis: { type: 'category', data: Array.from({ length: 20 }, (_, i) => `${i + 1}日`) },
    yAxis: { type: 'value', axisLabel: { formatter: (v: number) => `${(v / 10000).toFixed(1)}万` } },
    series: [{
      data: Array.from({ length: 20 }, (_, i) => 1000000 + i * 5000 + Math.random() * 10000),
      type: 'line',
      smooth: true,
      areaStyle: { color: 'rgba(82, 196, 26, 0.2)' },
      lineStyle: { color: '#52c41a' },
    }],
    grid: { left: 50, right: 20, top: 20, bottom: 30 },
  }

  return (
    <div>
      <Card
        title="模拟交易"
        extra={
          <Space>
            <span>模拟交易</span>
            <Switch checked={enabled} onChange={handleToggle} />
            <Button icon={<ReloadOutlined />}>刷新</Button>
          </Space>
        }
      >
        <Row gutter={16} style={{ marginBottom: 24 }}>
          <Col span={6}><Card><Statistic title="模拟资金" value={1035680.50} precision={2} prefix="¥" /></Card></Col>
          <Col span={6}><Card><Statistic title="今日收益" value={12580.30} precision={2} prefix="¥" valueStyle={{ color: '#f5222d' }} /></Card></Col>
          <Col span={6}><Card><Statistic title="累计收益" value={35680.50} precision={2} prefix="¥" valueStyle={{ color: '#f5222d' }} /></Card></Col>
          <Col span={6}><Card><Statistic title="持仓市值" value={201070.00} precision={2} prefix="¥" /></Card></Col>
        </Row>

        <Row gutter={16}>
          <Col span={16}>
            <Card title="收益曲线"><ReactECharts option={equityCurveOption} style={{ height: 250 }} /></Card>
          </Col>
          <Col span={8}>
            <Card title="市场行情">
              <div style={{ lineHeight: 2 }}>
                <div>上证指数: <span style={{ color: '#f5222d' }}>3280.50 +1.25%</span></div>
                <div>深证成指: <span style={{ color: '#f5222d' }}>10820.30 +1.18%</span></div>
                <div>创业板指: <span style={{ color: '#52c41a' }}>2100.80 -0.35%</span></div>
                <div>沪深300: <span style={{ color: '#f5222d' }}>4080.20 +0.96%</span></div>
              </div>
            </Card>
          </Col>
        </Row>
      </Card>

      <Card title="持仓明细" style={{ marginTop: 16 }}>
        <Table columns={positionColumns} dataSource={positions} pagination={false} size="small" />
      </Card>

      <Card title="交易记录" style={{ marginTop: 16 }}>
        <Table columns={tradeColumns} dataSource={trades} pagination={false} size="small" />
      </Card>
    </div>
  )
}
