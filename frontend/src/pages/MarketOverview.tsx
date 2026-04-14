import { useState } from 'react'
import { Card, Table, Tabs, Row, Col, Tag, Typography, Space, Button, Input, Select, Statistic } from 'antd'
import { RiseOutlined, FallOutlined, SearchOutlined, ReloadOutlined, ThunderboltOutlined, BankOutlined, FundOutlined, StockOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import ReactECharts from 'echarts-for-react'

const { Text } = Typography

interface MarketIndex {
  symbol: string
  name: string
  price: number
  change: number
  changePct: number
}

interface StockQuote {
  key: string
  symbol: string
  name: string
  price: number
  change: number
  changePct: number
  volume: number
  amount: number
  turnover: number
  amplitude: number
  high: number
  low: number
  open: number
  prevClose: number
}

interface SectorData {
  name: string
  changePct: number
  leadStock: string
  stockCount: number
}

const indicesData: MarketIndex[] = [
  { symbol: '000001', name: '上证指数', price: 3285.67, change: 45.32, changePct: 1.40 },
  { symbol: '399001', name: '深证成指', price: 11089.23, change: 156.78, changePct: 1.43 },
  { symbol: '399006', name: '创业板指', price: 2234.56, change: 28.45, changePct: 1.29 },
  { symbol: '000688', name: '科创50', price: 985.34, change: -5.67, changePct: -0.57 },
  { symbol: '000300', name: '沪深300', price: 3985.67, change: 52.34, changePct: 1.33 },
]

const hkIndicesData: MarketIndex[] = [
  { symbol: 'HSI', name: '恒生指数', price: 18234.56, change: 125.78, changePct: 0.69 },
  { symbol: 'HSTECH', name: '恒生科技', price: 3856.78, change: -45.32, changePct: -1.16 },
  { symbol: 'HSCEI', name: '国企指数', price: 6456.89, change: 56.78, changePct: 0.89 },
]

const usIndicesData: MarketIndex[] = [
  { symbol: 'IXIC', name: '纳斯达克', price: 15832.56, change: 125.67, changePct: 0.80 },
  { symbol: 'SPX', name: '标普500', price: 4892.34, change: 34.56, changePct: 0.71 },
  { symbol: 'DJI', name: '道琼斯', price: 38567.89, change: 234.56, changePct: 0.61 },
]

const aStocksData: StockQuote[] = [
  { key: '1', symbol: '600519', name: '贵州茅台', price: 1720.30, change: 39.80, changePct: 2.37, volume: 1256800, amount: 2156800000, turnover: 2.85, amplitude: 3.01, high: 1735.50, low: 1685.20, open: 1685.20, prevClose: 1680.50 },
  { key: '2', symbol: '000858', name: '五粮液', price: 145.20, change: 2.62, changePct: 1.85, volume: 896500, amount: 128500000, turnover: 3.21, amplitude: 2.96, high: 146.50, low: 142.30, open: 142.30, prevClose: 142.58 },
  { key: '3', symbol: '601318', name: '中国平安', price: 42.80, change: -0.21, changePct: -0.48, volume: 2563000, amount: 109800000, turnover: 1.23, amplitude: 1.51, high: 43.25, low: 42.60, open: 43.10, prevClose: 43.01 },
  { key: '4', symbol: '600036', name: '招商银行', price: 35.67, change: 0.40, changePct: 1.12, volume: 1896500, amount: 67320000, turnover: 0.89, amplitude: 1.98, high: 35.90, low: 35.20, open: 35.20, prevClose: 35.27 },
  { key: '5', symbol: '000002', name: '万科A', price: 8.45, change: -0.13, changePct: -1.52, volume: 3256800, amount: 27650000, turnover: 2.15, amplitude: 2.10, high: 8.60, low: 8.42, open: 8.58, prevClose: 8.58 },
  { key: '6', symbol: '002594', name: '比亚迪', price: 238.56, change: 5.67, changePct: 2.44, volume: 1567800, amount: 372500000, turnover: 1.54, amplitude: 3.21, high: 240.30, low: 232.10, open: 232.89, prevClose: 232.89 },
  { key: '7', symbol: '300750', name: '宁德时代', price: 182.34, change: -2.15, changePct: -1.17, volume: 985600, amount: 180500000, turnover: 0.98, amplitude: 2.45, high: 185.60, low: 181.20, open: 184.49, prevClose: 184.49 },
  { key: '8', symbol: '688981', name: '中芯国际', price: 48.56, change: 1.23, changePct: 2.60, volume: 2345600, amount: 112800000, turnover: 1.67, amplitude: 4.12, high: 49.30, low: 47.20, open: 47.33, prevClose: 47.33 },
]

const hkStocksData: StockQuote[] = [
  { key: '1', symbol: '00700', name: '腾讯控股', price: 298.60, change: 5.80, changePct: 1.98, volume: 12560000, amount: 3756800000, turnover: 1.32, amplitude: 2.45, high: 300.20, low: 292.80, open: 292.80, prevClose: 292.80 },
  { key: '2', symbol: '09988', name: '阿里巴巴', price: 72.35, change: -1.25, changePct: -1.70, volume: 18960000, amount: 1378900000, turnover: 1.85, amplitude: 2.12, high: 74.10, low: 71.80, open: 73.60, prevClose: 73.60 },
  { key: '3', symbol: '03690', name: '美团', price: 98.40, change: 3.20, changePct: 3.36, volume: 8965000, amount: 879200000, turnover: 1.45, amplitude: 4.21, high: 99.80, low: 95.20, open: 95.20, prevClose: 95.20 },
  { key: '4', symbol: '09618', name: '京东集团', price: 125.60, change: 2.40, changePct: 1.95, volume: 4567000, amount: 571200000, turnover: 0.78, amplitude: 2.67, high: 126.80, low: 123.20, open: 123.20, prevClose: 123.20 },
  { key: '5', symbol: '00688', name: '中国平安', price: 38.90, change: -0.35, changePct: -0.89, volume: 2345000, amount: 91250000, turnover: 0.56, amplitude: 1.23, high: 39.50, low: 38.70, prevClose: 38.70, open: 39.25, prevClose: 39.25 },
]

const sectorData: SectorData[] = [
  { name: '半导体', changePct: 3.25, leadStock: '中芯国际', stockCount: 128 },
  { name: '人工智能', changePct: 2.86, leadStock: '科大讯飞', stockCount: 256 },
  { name: '新能源汽车', changePct: 2.45, leadStock: '比亚迪', stockCount: 189 },
  { name: '白酒', changePct: 1.92, leadStock: '贵州茅台', stockCount: 45 },
  { name: '医药', changePct: -0.85, leadStock: '恒瑞医药', stockCount: 342 },
  { name: '房地产', changePct: -1.52, leadStock: '万科A', stockCount: 156 },
  { name: '银行', changePct: 0.78, leadStock: '招商银行', stockCount: 42 },
  { name: '券商', changePct: 1.23, leadStock: '中信证券', stockCount: 58 },
]

const gainersData = [...aStocksData].sort((a, b) => b.changePct - a.changePct).slice(0, 10)
const losersData = [...aStocksData].sort((a, b) => a.changePct - b.changePct).slice(0, 10)
const turnoversData = [...aStocksData].sort((a, b) => b.turnover - a.turnover).slice(0, 10)

export default function MarketOverview() {
  const [activeTab, setActiveTab] = useState('a')
  const [quoteTab, setQuoteTab] = useState('gainers')
  const [searchValue, setSearchValue] = useState('')

  const getColor = (change: number) => change >= 0 ? '#f5222d' : '#52c41a'
  const getChangeTag = (changePct: number) => (
    <Tag color={changePct >= 0 ? 'red' : 'green'}>
      {changePct >= 0 ? <RiseOutlined /> : <FallOutlined />} {Math.abs(changePct).toFixed(2)}%
    </Tag>
  )

  const indexColumns: ColumnsType<MarketIndex> = [
    { title: '名称', dataIndex: 'name', key: 'name', width: 100, render: (v) => <Text strong>{v}</Text> },
    { title: '代码', dataIndex: 'symbol', key: 'symbol', width: 80 },
    { title: '最新价', dataIndex: 'price', key: 'price', width: 100, render: (v, r) => <Text strong style={{ color: getColor(r.change) }}>{v.toFixed(2)}</Text> },
    { title: '涨跌幅', dataIndex: 'changePct', key: 'changePct', width: 100, render: (v, r) => getChangeTag(v) },
    { title: '涨跌额', dataIndex: 'change', key: 'change', width: 80, render: (v, r) => <Text style={{ color: getColor(r.change) }}>{v >= 0 ? '+' : ''}{v.toFixed(2)}</Text> },
  ]

  const stockColumns: ColumnsType<StockQuote> = [
    { title: '序号', key: 'index', width: 50, render: (_, __, idx) => idx + 1 },
    { title: '代码', dataIndex: 'symbol', key: 'symbol', width: 80 },
    { title: '名称', dataIndex: 'name', key: 'name', width: 100, render: (v) => <Text strong style={{ color: '#1890ff' }}>{v}</Text> },
    { title: '现价', dataIndex: 'price', key: 'price', width: 80, render: (v, r) => <Text strong style={{ color: getColor(r.change) }}>{v.toFixed(2)}</Text> },
    { title: '涨跌幅', dataIndex: 'changePct', key: 'changePct', width: 90, render: (v) => getChangeTag(v) },
    { title: '涨跌额', dataIndex: 'change', key: 'change', width: 70, render: (v, r) => <Text style={{ color: getColor(r.change) }}>{v >= 0 ? '+' : ''}{v.toFixed(2)}</Text> },
    { title: '成交量', dataIndex: 'volume', key: 'volume', width: 100, render: (v) => <Text>{(v / 10000).toFixed(2)}万</Text> },
    { title: '成交额', dataIndex: 'amount', key: 'amount', width: 100, render: (v) => <Text>{(v / 100000000).toFixed(2)}亿</Text> },
    { title: '换手率', dataIndex: 'turnover', key: 'turnover', width: 70, render: (v) => <Text>{v.toFixed(2)}%</Text> },
    { title: '振幅', dataIndex: 'amplitude', key: 'amplitude', width: 70, render: (v) => <Text>{v.toFixed(2)}%</Text> },
    { title: '最高', dataIndex: 'high', key: 'high', width: 80, render: (v) => <Text style={{ color: '#f5222d' }}>{v.toFixed(2)}</Text> },
    { title: '最低', dataIndex: 'low', key: 'low', width: 80, render: (v) => <Text style={{ color: '#52c41a' }}>{v.toFixed(2)}</Text> },
  ]

  const sectorColumns: ColumnsType<SectorData> = [
    { title: '板块名称', dataIndex: 'name', key: 'name', width: 120, render: (v) => <Text strong>{v}</Text> },
    { title: '涨跌幅', dataIndex: 'changePct', key: 'changePct', width: 100, render: (v) => getChangeTag(v) },
    { title: '领涨股', dataIndex: 'leadStock', key: 'leadStock', width: 100, render: (v) => <Text style={{ color: '#1890ff' }}>{v}</Text> },
    { title: '股票数量', dataIndex: 'stockCount', key: 'stockCount', width: 100 },
  ]

  const renderIndexCard = (title: string, data: MarketIndex[]) => (
    <Card size="small" title={<Space><FundOutlined />{title}</Space>} style={{ marginBottom: 8 }}>
      <Table columns={indexColumns} dataSource={data} pagination={false} size="small" />
    </Card>
  )

  const indexOption = {
    tooltip: { trigger: 'axis' },
    grid: { left: '3%', right: '4%', bottom: '3%', top: 10, containLabel: true },
    xAxis: { type: 'category', data: ['09:30', '10:00', '10:30', '11:00', '11:30', '13:00', '13:30', '14:00', '14:30', '15:00'], boundaryGap: false },
    yAxis: { type: 'value', scale: true, splitLine: { lineStyle: { type: 'dashed' } } },
    series: [{ name: '上证指数', type: 'line', data: [3250, 3260, 3268, 3272, 3270, 3278, 3280, 3283, 3285, 3285.67], smooth: true, areaStyle: { color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: 'rgba(245, 34, 45, 0.3)' }, { offset: 1, color: 'rgba(245, 34, 45, 0.05)' }] } }, lineStyle: { color: '#f5222d', width: 2 } }],
  }

  return (
    <div>
      <Card size="small" style={{ marginBottom: 8 }}>
        <Row gutter={16} align="middle">
          <Col>
            <Space size="large">
              <Text strong style={{ fontSize: 16 }}>大盘指数</Text>
              <Statistic
                title="上证指数"
                value={3285.67}
                precision={2}
                valueStyle={{ color: '#f5222d', fontSize: 18 }}
                suffix={<Text type="secondary" style={{ fontSize: 12 }}>+45.32 (+1.40%)</Text>}
              />
              <Statistic
                title="深证成指"
                value={11089.23}
                precision={2}
                valueStyle={{ color: '#f5222d', fontSize: 18 }}
                suffix={<Text type="secondary" style={{ fontSize: 12 }}>+156.78 (+1.43%)</Text>}
              />
            </Space>
          </Col>
          <Col flex="auto" style={{ textAlign: 'right' }}>
            <Space>
              <Input prefix={<SearchOutlined />} placeholder="搜索股票/板块" value={searchValue} onChange={e => setSearchValue(e.target.value)} style={{ width: 200 }} />
              <Button icon={<ReloadOutlined />}>刷新</Button>
            </Space>
          </Col>
        </Row>
      </Card>

      <Row gutter={8}>
        <Col span={16}>
          <Card size="small">
            <Tabs
              activeKey={activeTab}
              onChange={setActiveTab}
              items={[
                {
                  key: 'a',
                  label: <span><StockOutlined /> A股</span>,
                  children: (
                    <>
                      <Tabs
                        activeKey={quoteTab}
                        onChange={setQuoteTab}
                        items={[
                          { key: 'gainers', label: '涨幅榜' },
                          { key: 'losers', label: '跌幅榜' },
                          { key: 'turnover', label: '换手率' },
                          { key: 'all', label: '全部' },
                        ]}
                        style={{ marginBottom: 8 }}
                      />
                      <Table
                        columns={stockColumns}
                        dataSource={quoteTab === 'gainers' ? gainersData : quoteTab === 'losers' ? losersData : quoteTab === 'turnover' ? turnoversData : aStocksData}
                        pagination={{ pageSize: 10, showSizeChanger: true }}
                        size="small"
                        scroll={{ x: 1200 }}
                      />
                    </>
                  )
                },
                {
                  key: 'hk',
                  label: <span><BankOutlined /> 港股</span>,
                  children: (
                    <>
                      {renderIndexCard('恒生指数', hkIndicesData)}
                      <Tabs
                        activeKey={quoteTab}
                        onChange={setQuoteTab}
                        items={[
                          { key: 'gainers', label: '涨幅榜' },
                          { key: 'losers', label: '跌幅榜' },
                          { key: 'all', label: '全部' },
                        ]}
                        style={{ marginBottom: 8 }}
                      />
                      <Table
                        columns={stockColumns}
                        dataSource={hkStocksData}
                        pagination={{ pageSize: 10 }}
                        size="small"
                        scroll={{ x: 1200 }}
                      />
                    </>
                  )
                },
                {
                  key: 'indices',
                  label: <span><FundOutlined /> 大盘指数</span>,
                  children: (
                    <>
                      <Card size="small" style={{ marginBottom: 8 }}>
                        <ReactECharts option={indexOption} style={{ height: 200 }} />
                      </Card>
                      {renderIndexCard('A股指数', indicesData)}
                      {renderIndexCard('港股指数', hkIndicesData)}
                      {renderIndexCard('美股指数', usIndicesData)}
                    </>
                  )
                },
                {
                  key: 'sector',
                  label: <span><ThunderboltOutlined /> 板块</span>,
                  children: (
                    <Table
                      columns={sectorColumns}
                      dataSource={sectorData}
                      pagination={false}
                      size="small"
                    />
                  )
                },
              ]}
            />
          </Card>
        </Col>

        <Col span={8}>
          <Card size="small" title="实时行情" style={{ marginBottom: 8 }}>
            <Tabs
              size="small"
              items={[
                {
                  key: 'hot',
                  label: '热点板块',
                  children: (
                    <div>
                      {sectorData.slice(0, 5).map((s, idx) => (
                        <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f0f0f0' }}>
                          <Space>
                            <Tag color={idx === 0 ? 'red' : idx === 1 ? 'orange' : 'default'}>{idx + 1}</Tag>
                            <Text>{s.name}</Text>
                          </Space>
                          {getChangeTag(s.changePct)}
                        </div>
                      ))}
                    </div>
                  )
                },
                {
                  key: 'leaders',
                  label: '龙头股',
                  children: (
                    <div>
                      {aStocksData.slice(0, 5).map((s, idx) => (
                        <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f0f0f0' }}>
                          <Space>
                            <Tag color={s.changePct > 0 ? 'red' : 'green'}>{idx + 1}</Tag>
                            <Text strong style={{ color: '#1890ff' }}>{s.name}</Text>
                            <Text type="secondary">{s.symbol}</Text>
                          </Space>
                          <Space>
                            <Text strong>{s.price.toFixed(2)}</Text>
                            {getChangeTag(s.changePct)}
                          </Space>
                        </div>
                      ))}
                    </div>
                  )
                },
              ]}
            />
          </Card>

          <Card size="small" title="市场情绪">
            <Row gutter={8}>
              <Col span={12}>
                <Statistic title="上涨家数" value={3245} valueStyle={{ color: '#f5222d' }} suffix="家" />
              </Col>
              <Col span={12}>
                <Statistic title="下跌家数" value={1567} valueStyle={{ color: '#52c41a' }} suffix="家" />
              </Col>
              <Col span={12}>
                <Statistic title="涨停" value={68} valueStyle={{ color: '#f5222d' }} suffix="只" />
              </Col>
              <Col span={12}>
                <Statistic title="跌停" value={12} valueStyle={{ color: '#52c41a' }} suffix="只" />
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>
    </div>
  )
}