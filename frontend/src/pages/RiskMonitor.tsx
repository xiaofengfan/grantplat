import { useState } from 'react'
import { Card, Row, Col, Statistic, Table, Button, Tag, Switch, Modal, Form, Input, Select, Alert } from 'antd'
import { SafetyOutlined, LockOutlined } from '@ant-design/icons'
import ReactECharts from 'echarts-for-react'

export default function RiskMonitor() {
  const [ruleVisible, setRuleVisible] = useState(false)

  const riskMetrics = {
    total_value: 1125840.50,
    cash: 953810.50,
    positions_value: 172030.00,
    today_pnl: 12580.30,
    total_pnl: 125840.50,
    max_drawdown: 8.5,
    risk_exposure: 15.28,
    var: 22516.81,
    order_freq: 12,
    cancel_rate: 15.2,
  }

  const riskRules = [
    { key: '1', name: '单票仓位限制', type: 'position', value: '20%', status: true },
    { key: '2', name: '单日亏损限制', type: 'loss', value: '50000元', status: true },
    { key: '3', name: '报单频率限制', type: 'frequency', value: '50次/秒', status: true },
    { key: '4', name: '撤单率限制', type: 'cancel', value: '60%', status: true },
    { key: '5', name: '异常行情拦截', type: 'black swan', value: '开启', status: false },
  ]

  const alerts = [
    { key: '1', time: '14:30:15', level: 'warn', message: '撤单率达到 58%，接近监管阈值 60%' },
    { key: '2', time: '14:25:32', level: 'info', message: '单票仓位达到 18%，接近限制 20%' },
  ]

  const ruleColumns = [
    { title: '规则名称', dataIndex: 'name', key: 'name' },
    { title: '规则类型', dataIndex: 'type', key: 'type' },
    { title: '阈值', dataIndex: 'value', key: 'value' },
    { title: '状态', dataIndex: 'status', key: 'status', render: (v: boolean) => <Tag color={v ? 'green' : 'red'}>{v ? '已启用' : '已禁用'}</Tag> },
    { title: '操作', key: 'action', render: () => <Switch defaultChecked /> },
  ]

  const alertColumns = [
    { title: '时间', dataIndex: 'time', key: 'time' },
    { title: '级别', dataIndex: 'level', key: 'level', render: (v: string) => <Tag color={v === 'warn' ? 'orange' : 'blue'}>{v === 'warn' ? '警告' : '通知'}</Tag> },
    { title: '消息', dataIndex: 'message', key: 'message' },
  ]

  const exposureOption = {
    tooltip: { trigger: 'item' },
    series: [{
      type: 'pie',
      radius: ['50%', '70%'],
      data: [
        { value: 172030, name: '持仓', itemStyle: { color: '#1890ff' } },
        { value: 953810.50, name: '现金', itemStyle: { color: '#52c41a' } },
      ],
      label: { formatter: '{b}: {d}%' },
    }],
  }

  return (
    <div>
      <Alert
        message="风控状态: 正常"
        description="所有风险指标均在安全范围内"
        type="success"
        showIcon
        icon={<SafetyOutlined />}
        style={{ marginBottom: 16 }}
      />

      <Card title="风险监控">
        <Row gutter={16} style={{ marginBottom: 24 }}>
          <Col span={6}><Card><Statistic title="风险敞口" value={riskMetrics.risk_exposure} precision={2} suffix="%" valueStyle={{ color: riskMetrics.risk_exposure > 20 ? '#f5222d' : '#1890ff' }} /></Card></Col>
          <Col span={6}><Card><Statistic title="VaR (95%)" value={riskMetrics.var} precision={2} prefix="¥" /></Card></Col>
          <Col span={6}><Card><Statistic title="报单频率" value={riskMetrics.order_freq} suffix="次/秒" /></Card></Col>
          <Col span={6}><Card><Statistic title="撤单率" value={riskMetrics.cancel_rate} precision={1} suffix="%" valueStyle={{ color: riskMetrics.cancel_rate > 50 ? '#f5222d' : '#1890ff' }} /></Card></Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Card title="资产分布">
              <ReactECharts option={exposureOption} style={{ height: 250 }} />
            </Card>
          </Col>
          <Col span={12}>
            <Card title="风险指标">
              <div style={{ lineHeight: 2.5 }}>
                <div>总资产: <span style={{ fontWeight: 'bold' }}>¥{riskMetrics.total_value.toLocaleString()}</span></div>
                <div>可用资金: <span style={{ fontWeight: 'bold' }}>¥{riskMetrics.cash.toLocaleString()}</span></div>
                <div>持仓市值: <span style={{ fontWeight: 'bold' }}>¥{riskMetrics.positions_value.toLocaleString()}</span></div>
                <div>最大回撤: <span style={{ fontWeight: 'bold', color: '#f5222d' }}>{riskMetrics.max_drawdown}%</span></div>
                <div>今日盈亏: <span style={{ fontWeight: 'bold', color: '#f5222d' }}>+¥{riskMetrics.today_pnl.toLocaleString()}</span></div>
                <div>累计盈亏: <span style={{ fontWeight: 'bold', color: '#f5222d' }}>+¥{riskMetrics.total_pnl.toLocaleString()}</span></div>
              </div>
            </Card>
          </Col>
        </Row>
      </Card>

      <Card
        title="风控规则"
        style={{ marginTop: 16 }}
        extra={<Button type="primary" icon={<LockOutlined />} onClick={() => setRuleVisible(true)}>添加规则</Button>}
      >
        <Table columns={ruleColumns} dataSource={riskRules} pagination={false} />
      </Card>

      <Card title="风险预警" style={{ marginTop: 16 }}>
        <Table columns={alertColumns} dataSource={alerts} pagination={false} />
      </Card>

      <Modal title="添加风控规则" open={ruleVisible} onCancel={() => setRuleVisible(false)} footer={null}>
        <Form layout="vertical">
          <Form.Item label="规则类型" rules={[{ required: true }]}>
            <Select placeholder="请选择规则类型">
              <Select.Option value="position">单票仓位限制</Select.Option>
              <Select.Option value="loss">单日亏损限制</Select.Option>
              <Select.Option value="frequency">报单频率限制</Select.Option>
              <Select.Option value="cancel">撤单率限制</Select.Option>
              <Select.Option value="black swan">异常行情拦截</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item label="规则名称" rules={[{ required: true }]}>
            <Input placeholder="请输入规则名称" />
          </Form.Item>
          <Form.Item label="阈值" rules={[{ required: true }]}>
            <Input placeholder="请输入阈值，如：20%" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" block>添加</Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
