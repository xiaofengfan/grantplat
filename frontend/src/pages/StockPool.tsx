import { useState, useEffect } from 'react'
import { Card, Table, Button, Space, Tag, Modal, Form, Input, Select, message, Popconfirm, DatePicker, Typography, Row, Col, Statistic } from 'antd'
import { PlusOutlined, DeleteOutlined, BellOutlined, SearchOutlined, CalendarOutlined, ReloadOutlined, StockOutlined, RobotOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import type { ColumnsType } from 'antd/es/table'
import dayjs, { Dayjs } from 'dayjs'

const { Text } = Typography

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
}

export default function StockPool() {
  const navigate = useNavigate()
  const [stocks, setStocks] = useState<Stock[]>([])
  const [quotes, setQuotes] = useState<Record<string, Quote>>({})
  const [loading, setLoading] = useState(false)
  const [addVisible, setAddVisible] = useState(false)
  const [alertVisible, setAlertVisible] = useState(false)
  const [selectedStock, setSelectedStock] = useState<Stock | null>(null)
  const [selectedDate, setSelectedDate] = useState<Dayjs>(dayjs())
  const [form] = Form.useForm()
  const [alertForm] = Form.useForm()

  useEffect(() => {
    loadStocks()
  }, [selectedDate])

  const loadStocks = async () => {
    setLoading(true)
    try {
      const res = await api.get('/stockpool')
      setStocks(res.data)
      loadQuotes(res.data)
    } catch (error) {
      message.error('加载股票池失败')
    } finally {
      setLoading(false)
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

  const handleAIAnalyze = (stock: Stock) => {
    navigate(`/ai?symbol=${stock.symbol}&name=${stock.name || stock.symbol}`)
  }

  const columns: ColumnsType<Stock> = [
    {
      title: '股票代码',
      dataIndex: 'symbol',
      key: 'symbol',
      width: 100,
      render: (symbol: string) => (
        <span style={{ fontWeight: 'bold', color: '#1890ff' }}>{symbol}</span>
      )
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
      width: 100,
      render: (_, record: Stock) => {
        const quote = quotes[record.symbol]
        if (!quote) return '-'
        return <span style={{ fontWeight: 'bold' }}>{quote.price.toFixed(2)}</span>
      }
    },
    {
      title: '涨跌幅',
      key: 'change',
      width: 120,
      render: (_, record: Stock) => {
        const quote = quotes[record.symbol]
        if (!quote) return '-'
        const color = quote.change >= 0 ? '#f5222d' : '#52c41a'
        return (
          <span style={{ color, fontWeight: 'bold' }}>
            {quote.change >= 0 ? '+' : ''}{quote.change.toFixed(2)} ({quote.change_pct.toFixed(2)}%)
          </span>
        )
      }
    },
    {
      title: '成交量',
      key: 'volume',
      width: 120,
      render: (_, record: Stock) => {
        const quote = quotes[record.symbol]
        if (!quote) return '-'
        return (quote.volume / 10000).toFixed(2) + '万'
      }
    },
    {
      title: '市值',
      key: 'market_value',
      width: 120,
      render: (_, record: Stock) => {
        const quote = quotes[record.symbol]
        if (!quote) return '-'
        return (quote.amount / 100000000).toFixed(2) + '亿'
      }
    },
    {
      title: '分组',
      dataIndex: 'group_name',
      key: 'group_name',
      width: 100,
      render: (v: string | null) => v ? <Tag>{v}</Tag> : '-'
    },
    {
      title: '添加日期',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 120,
      render: (v: string) => v ? dayjs(v).format('YYYY-MM-DD') : '-'
    },
    {
      title: '操作',
      key: 'action',
      width: 180,
      render: (_, record: Stock) => (
        <Space>
          <Button size="small" type="primary" icon={<RobotOutlined />} onClick={() => handleAIAnalyze(record)}>
            AI分析
          </Button>
          <Button size="small" icon={<BellOutlined />} onClick={() => { setSelectedStock(record); setAlertVisible(true) }} />
          <Popconfirm title="确定删除?" onConfirm={() => handleDelete(record.id)}>
            <Button size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      )
    }
  ]

  const risingCount = Object.values(quotes).filter(q => q.change > 0).length
  const fallingCount = Object.values(quotes).filter(q => q.change < 0).length

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Space size="large">
          <Text strong style={{ fontSize: 16 }}>
            <CalendarOutlined /> {selectedDate.format('YYYY年MM月DD日 dddd')}
          </Text>
          <Text type="secondary">自选股票池</Text>
        </Space>
        <Space>
          <DatePicker
            value={selectedDate}
            onChange={(date) => date && setSelectedDate(date)}
            format="YYYY-MM-DD"
            allowClear={false}
          />
          <Button icon={<ReloadOutlined />} onClick={loadStocks}>刷新</Button>
        </Space>
      </div>

      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}>
          <Card size="small">
            <Statistic
              title="自选股票"
              value={stocks.length}
              suffix="只"
              prefix={<StockOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small">
            <Statistic
              title="上涨"
              value={risingCount}
              suffix="只"
              valueStyle={{ color: '#f5222d' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small">
            <Statistic
              title="下跌"
              value={fallingCount}
              suffix="只"
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small">
            <Statistic
              title="平盘"
              value={stocks.length - risingCount - fallingCount}
              suffix="只"
            />
          </Card>
        </Col>
      </Row>

      <Card
        title={`股票列表 (${stocks.length})`}
        extra={
          <Space>
            <Select placeholder="筛选分组" style={{ width: 120 }} allowClear>
              {[...new Set(stocks.map(s => s.group_name).filter(Boolean))].map(g => (
                <Select.Option key={g} value={g!}>{g}</Select.Option>
              ))}
            </Select>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => setAddVisible(true)}>添加股票</Button>
          </Space>
        }
      >
        <Table
          columns={columns}
          dataSource={stocks}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10, showSizeChanger: true, showTotal: (total: number) => `共 ${total} 条` }}
          size="small"
        />
      </Card>

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
            <Input placeholder="如: 白马股" />
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