import { useState, useEffect } from 'react'
import { Card, Row, Col, Statistic, Table, DatePicker, Select, Space, Tag, Button, Modal, Form, InputNumber, Tabs, Progress, Typography, Divider, List } from 'antd'
import { WalletOutlined, FileTextOutlined, RiseOutlined, FallOutlined, BankOutlined, DollarOutlined, CheckCircleOutlined, ClockCircleOutlined, ExclamationCircleOutlined } from '@ant-design/icons'
import ReactECharts from 'echarts-for-react'
import api from '../services/api'
import dayjs from 'dayjs'

const { Text } = Typography

interface Wallet {
  total_asset: number
  cash: number
  frozen: number
  market_value: number
  today_profit: number
  total_profit: number
}

interface Bill {
  id: number
  time: string
  symbol: string
  name: string
  type: string
  amount: number
  price: number
  fee: number
  status: string
}

interface ProfitRecord {
  date: string
  profit: number
  profit_rate: number
}

export default function Transactions() {
  const [wallet, setWallet] = useState<Wallet>({
    total_asset: 1125840.50,
    cash: 953810.50,
    frozen: 0,
    market_value: 172030,
    today_profit: 12580.30,
    total_profit: 85600.00
  })
  const [bills, setBills] = useState<Bill[]>([])
  const [profitData, setProfitData] = useState<ProfitRecord[]>([])
  const [loading, setLoading] = useState(false)
  const [rechargeVisible, setRechargeVisible] = useState(false)
  const [withdrawVisible, setWithdrawVisible] = useState(false)
  const [form] = Form.useForm()
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const res = await api.get('/transactions/wallet')
      if (res.data) setWallet(res.data)
    } catch (error) {
      console.error('加载钱包数据失败', error)
    }

    setBills([
      { id: 1, time: '2026-04-13 14:30:15', symbol: '600519', name: '贵州茅台', type: '买入', amount: 100, price: 1720.00, fee: 51.60, status: '已完成' },
      { id: 2, time: '2026-04-13 10:25:32', symbol: '000858', name: '五粮液', type: '卖出', amount: 200, price: 145.00, fee: 43.50, status: '已完成' },
      { id: 3, time: '2026-04-12 15:00:00', symbol: '601318', name: '中国平安', type: '买入', amount: 500, price: 42.80, fee: 21.40, status: '已完成' },
      { id: 4, time: '2026-04-12 09:35:20', symbol: '600036', name: '招商银行', type: '买入', amount: 1000, price: 35.50, fee: 35.50, status: '已完成' },
    ])

    setProfitData([
      { date: '2026-04-07', profit: 1250.30, profit_rate: 0.11 },
      { date: '2026-04-08', profit: -580.00, profit_rate: -0.05 },
      { date: '2026-04-09', profit: 2100.50, profit_rate: 0.19 },
      { date: '2026-04-10', profit: 890.20, profit_rate: 0.08 },
      { date: '2026-04-11', profit: -320.80, profit_rate: -0.03 },
      { date: '2026-04-12', profit: 1580.00, profit_rate: 0.14 },
      { date: '2026-04-13', profit: 12580.30, profit_rate: 1.13 },
    ])
    setLoading(false)
  }

  const profitChartOption = {
    tooltip: { trigger: 'axis' },
    grid: { left: '3%', right: '4%', bottom: '3%', top: 20, containLabel: true },
    xAxis: { type: 'category', data: profitData.map(p => p.date) },
    yAxis: { type: 'value', axisLabel: { formatter: (v: number) => `¥${v.toFixed(0)}` } },
    series: [
      {
        name: '收益',
        type: 'bar',
        data: profitData.map(p => ({ value: p.profit, itemStyle: { color: p.profit >= 0 ? '#f5222d' : '#52c41a' } })),
      }
    ],
  }

  const assetChartOption = {
    tooltip: { trigger: 'item' },
    legend: { top: 0 },
    series: [
      {
        name: '资产分布',
        type: 'pie',
        radius: ['40%', '70%'],
        data: [
          { value: wallet.cash, name: '现金', itemStyle: { color: '#1890ff' } },
          { value: wallet.market_value, name: '持仓市值', itemStyle: { color: '#f5222d' } },
          { value: wallet.frozen, name: '冻结', itemStyle: { color: '#faad14' } },
        ],
      }
    ],
  }

  const handleRecharge = async () => {
    try {
      const values = await form.validateFields()
      message.success(`充值 ¥${values.amount} 成功`)
      setRechargeVisible(false)
      form.resetFields()
      loadData()
    } catch (error) {
      message.error('充值失败')
    }
  }

  const handleWithdraw = async () => {
    try {
      const values = await form.validateFields()
      if (values.amount > wallet.cash) {
        message.error('余额不足')
        return
      }
      message.success(`提现 ¥${values.amount} 申请已提交`)
      setWithdrawVisible(false)
      form.resetFields()
    } catch (error) {
      message.error('提现失败')
    }
  }

  const billColumns = [
    { title: '时间', dataIndex: 'time', key: 'time', width: 160 },
    { title: '股票代码', dataIndex: 'symbol', key: 'symbol', width: 100 },
    { title: '名称', dataIndex: 'name', key: 'name', width: 100 },
    { title: '类型', dataIndex: 'type', key: 'type', width: 80, render: (v: string) => <Tag color={v === '买入' ? 'red' : 'green'}>{v}</Tag> },
    { title: '数量', dataIndex: 'amount', key: 'amount', width: 80 },
    { title: '价格', dataIndex: 'price', key: 'price', width: 100, render: (v: number) => `¥${v.toFixed(2)}` },
    { title: '手续费', dataIndex: 'fee', key: 'fee', width: 80, render: (v: number) => `¥${v.toFixed(2)}` },
    { title: '状态', dataIndex: 'status', key: 'status', width: 80, render: (v: string) => <Tag color="green">{v}</Tag> },
  ]

  const tabItems = [
    {
      key: 'overview',
      label: '总览',
      children: (
        <Row gutter={16}>
          <Col span={6}>
            <Card><Statistic title="总资产" value={wallet.total_asset} precision={2} prefix="¥" /></Card>
          </Col>
          <Col span={6}>
            <Card><Statistic title="现金余额" value={wallet.cash} precision={2} prefix="¥" /></Card>
          </Col>
          <Col span={6}>
            <Card><Statistic title="持仓市值" value={wallet.market_value} precision={2} prefix="¥" /></Card>
          </Col>
          <Col span={6}>
            <Card><Statistic title="今日收益" value={wallet.today_profit} precision={2} prefix="¥" valueStyle={{ color: wallet.today_profit >= 0 ? '#f5222d' : '#52c41a' }} /></Card>
          </Col>
          <Col span={12}>
            <Card title="收益走势">
              <ReactECharts option={profitChartOption} style={{ height: 250 }} />
            </Card>
          </Col>
          <Col span={12}>
            <Card title="资产分布">
              <ReactECharts option={assetChartOption} style={{ height: 250 }} />
            </Card>
          </Col>
        </Row>
      )
    },
    {
      key: 'wallet',
      label: '钱包',
      children: (
        <Card>
          <Row gutter={16}>
            <Col span={8}>
              <Card><Statistic title="总资产" value={wallet.total_asset} precision={2} prefix="¥" /></Card>
            </Col>
            <Col span={8}>
              <Card><Statistic title="可用现金" value={wallet.cash} precision={2} prefix="¥" /></Card>
            </Col>
            <Col span={8}>
              <Card><Statistic title="持仓市值" value={wallet.market_value} precision={2} prefix="¥" /></Card>
            </Col>
          </Row>
          <Divider />
          <Space>
            <Button type="primary" icon={<DollarOutlined />} onClick={() => setRechargeVisible(true)}>充值</Button>
            <Button icon={<BankOutlined />} onClick={() => setWithdrawVisible(true)}>提现</Button>
            <Button onClick={loadData}>刷新</Button>
          </Space>
        </Card>
      )
    },
    {
      key: 'bills',
      label: '账单',
      children: (
        <Card extra={<Button onClick={loadData}>刷新</Button>}>
          <Table columns={billColumns} dataSource={bills} rowKey="id" pagination={{ pageSize: 10 }} size="small" />
        </Card>
      )
    },
    {
      key: 'profit',
      label: '收益明细',
      children: (
        <Card>
          <List
            size="small"
            dataSource={profitData}
            renderItem={(item) => (
              <List.Item>
                <List.Item.Meta
                  title={item.date}
                  description={`收益率: ${item.profit_rate >= 0 ? '+' : ''}${(item.profit_rate * 100).toFixed(2)}%`}
                />
                <Text style={{ color: item.profit >= 0 ? '#f5222d' : '#52c41a', fontWeight: 'bold' }}>
                  {item.profit >= 0 ? '+' : ''}¥{item.profit.toFixed(2)}
                </Text>
              </List.Item>
            )}
          />
        </Card>
      )
    },
  ]

  return (
    <div>
      <Tabs activeKey={activeTab} onChange={setActiveTab} items={tabItems} />

      <Modal title="充值" open={rechargeVisible} onCancel={() => setRechargeVisible(false)} onOk={handleRecharge}>
        <Form form={form} layout="vertical">
          <Form.Item name="amount" label="充值金额" rules={[{ required: true, message: '请输入充值金额' }]}>
            <InputNumber style={{ width: '100%' }} min={1} max={1000000} placeholder="请输入金额" />
          </Form.Item>
          <Form.Item name="method" label="支付方式" initialValue="bank">
            <Select>
              <Select.Option value="bank">银行卡</Select.Option>
              <Select.Option value="alipay">支付宝</Select.Option>
              <Select.Option value="wechat">微信支付</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      <Modal title="提现" open={withdrawVisible} onCancel={() => setWithdrawVisible(false)} onOk={handleWithdraw}>
        <Form form={form} layout="vertical">
          <Form.Item name="amount" label="提现金额" rules={[{ required: true, message: '请输入提现金额' }]}>
            <InputNumber style={{ width: '100%' }} min={1} max={wallet.cash} placeholder="最大可提现 ¥{wallet.cash}" />
          </Form.Item>
          <Form.Item name="bank" label="收款账户">
            <InputNumber style={{ width: '100%' }} placeholder="请输入银行卡号" />
          </Form.Item>
          <Text type="secondary">可用余额: ¥{wallet.cash.toFixed(2)}</Text>
        </Form>
      </Modal>
    </div>
  )
}