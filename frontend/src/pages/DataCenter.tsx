import { useState } from 'react'
import { Card, Table, Button, Space, Tag, Select, DatePicker, Input, Tabs } from 'antd'
import { DownloadOutlined, SearchOutlined } from '@ant-design/icons'
import ReactECharts from 'echarts-for-react'

const { RangePicker } = DatePicker

export default function DataCenter() {
  const [activeTab, setActiveTab] = useState('quotes')

  const quotesData = [
    { key: '1', symbol: '600519', name: '贵州茅台', price: 1720.30, change: 38.50, change_pct: 2.29, volume: 3210000, amount: 5432000000 },
    { key: '2', symbol: '000858', name: '五粮液', price: 145.20, change: 3.20, change_pct: 2.25, volume: 21500000, amount: 3120000000 },
    { key: '3', symbol: '601318', name: '中国平安', price: 42.80, change: -0.35, change_pct: -0.81, volume: 45600000, amount: 1950000000 },
  ]

  const historyData = [
    { key: '1', date: '2026-04-11', open: 1680.00, high: 1730.50, low: 1675.00, close: 1720.30, volume: 3210000 },
    { key: '2', date: '2026-04-10', open: 1665.00, high: 1690.00, low: 1655.00, close: 1680.50, volume: 2890000 },
    { key: '3', date: '2026-04-09', open: 1645.00, high: 1675.00, low: 1638.00, close: 1662.30, volume: 2540000 },
  ]

  const factorData = [
    { key: '1', name: 'MACD', category: '趋势', description: '指数平滑异同移动平均线', ic: 0.65, ir: 0.42 },
    { key: '2', name: 'RSI', category: '摆动', description: '相对强弱指数', ic: 0.58, ir: 0.38 },
    { key: '3', name: '布林带', category: '趋势', description: '布林带指标', ic: 0.52, ir: 0.35 },
  ]

  const quoteColumns = [
    { title: '代码', dataIndex: 'symbol', key: 'symbol' },
    { title: '名称', dataIndex: 'name', key: 'name' },
    { title: '现价', dataIndex: 'price', key: 'price' },
    { title: '涨跌额', dataIndex: 'change', key: 'change', render: (v: number) => <span style={{ color: v >= 0 ? '#f5222d' : '#52c41a' }}>{v >= 0 ? '+' : ''}{v.toFixed(2)}</span> },
    { title: '涨跌幅', dataIndex: 'change_pct', key: 'change_pct', render: (v: number) => <span style={{ color: v >= 0 ? '#f5222d' : '#52c41a' }}>{v >= 0 ? '+' : ''}{v.toFixed(2)}%</span> },
    { title: '成交量', dataIndex: 'volume', key: 'volume', render: (v: number) => (v / 10000).toFixed(2) + '万' },
    { title: '成交额', dataIndex: 'amount', key: 'amount', render: (v: number) => (v / 100000000).toFixed(2) + '亿' },
  ]

  const historyColumns = [
    { title: '日期', dataIndex: 'date', key: 'date' },
    { title: '开盘', dataIndex: 'open', key: 'open' },
    { title: '最高', dataIndex: 'high', key: 'high' },
    { title: '最低', dataIndex: 'low', key: 'low' },
    { title: '收盘', dataIndex: 'close', key: 'close' },
    { title: '成交量', dataIndex: 'volume', key: 'volume', render: (v: number) => (v / 10000).toFixed(2) + '万' },
  ]

  const factorColumns = [
    { title: '因子名称', dataIndex: 'name', key: 'name' },
    { title: '类别', dataIndex: 'category', key: 'category', render: (v: string) => <Tag>{v}</Tag> },
    { title: '描述', dataIndex: 'description', key: 'description' },
    { title: 'IC', dataIndex: 'ic', key: 'ic', render: (v: number) => v.toFixed(3) },
    { title: 'IR', dataIndex: 'ir', key: 'ir', render: (v: number) => v.toFixed(3) },
  ]

  const klineOption = {
    tooltip: { trigger: 'axis' },
    xAxis: { type: 'category', data: ['1日', '2日', '3日', '4日', '5日', '6日', '7日'] },
    yAxis: { type: 'value' },
    series: [
      { name: '开盘', data: [1680, 1665, 1645, 1655, 1670, 1680, 1695], type: 'line' },
      { name: '收盘', data: [1680, 1680, 1662, 1675, 1685, 1698, 1720], type: 'line' },
    ],
    grid: { left: 50, right: 20, top: 20, bottom: 30 },
  }

  return (
    <div>
      <Card
        title="数据中心"
        extra={
          <Space>
            <Select defaultValue="A" style={{ width: 120 }}>
              <Select.Option value="A">A股</Select.Option>
              <Select.Option value="HK">港股</Select.Option>
              <Select.Option value="US">美股</Select.Option>
            </Select>
            <Input placeholder="输入股票代码" style={{ width: 200 }} prefix={<SearchOutlined />} />
            <RangePicker />
            <Button icon={<DownloadOutlined />}>导出</Button>
          </Space>
        }
      >
        <Tabs
          activeKey={activeTab}
          onChange={(k) => setActiveTab(k || 'quotes')}
          items={[
            {
              key: 'quotes',
              label: '实时行情',
              children: <Table columns={quoteColumns} dataSource={quotesData} pagination={false} size="small" />,
            },
            {
              key: 'history',
              label: '历史K线',
              children: (
                <>
                  <ReactECharts option={klineOption} style={{ height: 250, marginBottom: 16 }} />
                  <Table columns={historyColumns} dataSource={historyData} pagination={false} size="small" />
                </>
              ),
            },
            {
              key: 'factors',
              label: '因子库',
              children: <Table columns={factorColumns} dataSource={factorData} pagination={false} size="small" />,
            },
          ]}
        />
      </Card>
    </div>
  )
}
