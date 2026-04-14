import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Table, Card, Button, Tag, Space, message, Tooltip, Modal, Descriptions, List, Typography, Row, Col } from 'antd'
import { PlusOutlined, PlayCircleOutlined, EditOutlined, DeleteOutlined, CopyOutlined, ExperimentOutlined, ThunderboltOutlined, SafetyOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'

const { Text } = Typography

interface Strategy {
  id: number
  name: string
  description: string
  strategy_type: string
  market_type: string[]
  status: string
  created_at: string
 收益率?: number
  夏普比率?: number
  最大回撤?: number
}

const defaultStrategies: Strategy[] = [
  {
    id: 1,
    name: '双均线策略',
    description: '经典的双均线交叉策略，快速均线与慢速均线交叉产生买卖信号，适用于趋势行情',
    strategy_type: 'visual',
    market_type: ['A股', '期货'],
    status: 'running',
    created_at: '2026-01-15T10:00:00Z',
    收益率: 23.5,
    夏普比率: 1.85,
    最大回撤: 8.2,
  },
  {
    id: 2,
    name: 'MACD趋势策略',
    description: '利用MACD指标的背离和交叉信号进行趋势跟踪，结合成交量确认信号可靠性',
    strategy_type: 'template',
    market_type: ['A股', '港股'],
    status: 'running',
    created_at: '2026-02-01T14:30:00Z',
    收益率: 18.7,
    夏普比率: 1.62,
    最大回撤: 12.5,
  },
  {
    id: 3,
    name: 'RSI超买超卖策略',
    description: '基于RSI指标的超买超卖区域进行逆势交易，配合支撑位阻力位提高胜率',
    strategy_type: 'template',
    market_type: ['A股'],
    status: 'simulating',
    created_at: '2026-02-20T09:15:00Z',
    收益率: 15.3,
    夏普比率: 1.45,
    最大回撤: 6.8,
  },
  {
    id: 4,
    name: '布林带突破策略',
    description: '价格突破布林带上轨时买入，跌破下轨时卖出，结合波动率自适应仓位管理',
    strategy_type: 'code',
    market_type: ['A股', '期货', '外汇'],
    status: 'running',
    created_at: '2026-03-05T11:20:00Z',
    收益率: 31.2,
    夏普比率: 2.15,
    最大回撤: 10.5,
  },
  {
    id: 5,
    name: '网格交易策略',
    description: '在震荡行情中设置等间距网格，自动高抛低吸，适合波动率高的标的',
    strategy_type: 'visual',
    market_type: ['ETF', '债券'],
    status: 'running',
    created_at: '2026-03-10T08:30:00Z',
    收益率: 12.8,
    夏普比率: 1.92,
    最大回撤: 5.2,
  },
  {
    id: 6,
    name: '北向资金流向策略',
    description: '跟踪北向资金（沪深港通）流向，结合外资偏好进行跟投操作',
    strategy_type: 'template',
    market_type: ['A股'],
    status: 'backtesting',
    created_at: '2026-03-15T13:45:00Z',
    收益率: 0,
    夏普比率: 0,
    最大回撤: 0,
  },
  {
    id: 7,
    name: '价值投资选股策略',
    description: '基于市盈率、净利润增长率、ROE等基本面指标筛选低估价值股',
    strategy_type: 'code',
    market_type: ['A股', '港股'],
    status: 'draft',
    created_at: '2026-03-20T10:00:00Z',
    收益率: 0,
    夏普比率: 0,
    最大回撤: 0,
  },
  {
    id: 8,
    name: '行业轮动策略',
    description: '根据经济周期和行业景气度轮动，在强势行业间切换，追求超额收益',
    strategy_type: 'template',
    market_type: ['A股', '行业ETF'],
    status: 'simulating',
    created_at: '2026-03-25T15:00:00Z',
    收益率: 19.6,
    夏普比率: 1.58,
    最大回撤: 9.8,
  },
]

export default function StrategyList() {
  const navigate = useNavigate()
  const [strategies, setStrategies] = useState<Strategy[]>(defaultStrategies)
  const [loading, setLoading] = useState(false)
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([])
  const [detailVisible, setDetailVisible] = useState(false)
  const [selectedStrategy, setSelectedStrategy] = useState<Strategy | null>(null)

  const statusColors: Record<string, string> = {
    draft: 'default',
    backtesting: 'processing',
    simulating: 'processing',
    running: 'success',
    stopped: 'error',
  }

  const statusLabels: Record<string, string> = {
    draft: '草稿',
    backtesting: '回测中',
    simulating: '模拟中',
    running: '运行中',
    stopped: '已停止',
  }

  const typeLabels: Record<string, string> = {
    visual: '零代码',
    template: '低代码',
    code: '全代码',
  }

  const typeColors: Record<string, string> = {
    visual: 'blue',
    template: 'purple',
    code: 'cyan',
  }

  const handleViewDetail = (strategy: Strategy) => {
    setSelectedStrategy(strategy)
    setDetailVisible(true)
  }

  const columns: ColumnsType<Strategy> = [
    {
      title: '策略名称',
      dataIndex: 'name',
      key: 'name',
      width: 180,
      render: (v, r) => <a onClick={() => handleViewDetail(r)}>{v}</a>,
    },
    {
      title: '类型',
      dataIndex: 'strategy_type',
      key: 'strategy_type',
      width: 100,
      render: (v) => <Tag color={typeColors[v]}>{typeLabels[v]}</Tag>,
    },
    {
      title: '市场',
      dataIndex: 'market_type',
      key: 'market_type',
      width: 150,
      render: (v) => <Space>{v.map((m: string) => <Tag key={m}>{m}</Tag>)}</Space>,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (v) => <Tag color={statusColors[v]}>{statusLabels[v]}</Tag>,
    },
    {
      title: '收益率',
      dataIndex: '收益率',
      key: '收益率',
      width: 100,
      render: (v) => v > 0 ? <Text style={{ color: '#f5222d' }}>+{v.toFixed(2)}%</Text> : <Text type="secondary">-</Text>,
    },
    {
      title: '夏普比率',
      dataIndex: '夏普比率',
      key: '夏普比率',
      width: 100,
      render: (v) => v > 0 ? v.toFixed(2) : '-',
    },
    {
      title: '最大回撤',
      dataIndex: '最大回撤',
      key: '最大回撤',
      width: 100,
      render: (v) => v > 0 ? <Text style={{ color: '#52c41a' }}>-{v.toFixed(2)}%</Text> : '-',
    },
    {
      title: '操作',
      key: 'action',
      width: 220,
      render: (_, record) => (
        <Space>
          <Tooltip title="回测">
            <Button size="small" type="primary" icon={<PlayCircleOutlined />} onClick={() => navigate(`/backtest?strategy=${record.id}`)} />
          </Tooltip>
          <Tooltip title="编辑">
            <Button size="small" icon={<EditOutlined />} onClick={() => navigate(`/strategies/${record.id}`)} />
          </Tooltip>
          <Tooltip title="复制">
            <Button size="small" icon={<CopyOutlined />} />
          </Tooltip>
          <Tooltip title="删除">
            <Button size="small" danger icon={<DeleteOutlined />} />
          </Tooltip>
        </Space>
      )
    },
  ]

  return (
    <div>
      <Card
        title={
          <Space>
            <ExperimentOutlined />
            量化策略库
            <Tag color="blue">{strategies.length} 个策略</Tag>
          </Space>
        }
        extra={
          <Space>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/strategies/new')}>新建策略</Button>
          </Space>
        }
      >
        <Table
          columns={columns}
          dataSource={strategies}
          rowKey="id"
          loading={loading}
          rowSelection={{ selectedRowKeys, onChange: setSelectedRowKeys }}
          pagination={{ pageSize: 10, showSizeChanger: true, showTotal: (total) => `共 ${total} 条策略` }}
        />
      </Card>

      <Row gutter={16} style={{ marginTop: 16 }}>
        <Col span={12}>
          <Card title="策略类型说明" size="small">
            <List
              size="small"
              dataSource={[
                { type: '零代码', color: 'blue', desc: '通过可视化拖拽配置策略，无需编程基础' },
                { type: '低代码', color: 'purple', desc: '提供策略模板，支持参数调整和简单逻辑修改' },
                { type: '全代码', color: 'cyan', desc: 'Python/JavaScript编码，支持复杂策略逻辑' },
              ]}
              renderItem={(item) => (
                <List.Item>
                  <Tag color={item.color}>{item.type}</Tag>
                  <Text type="secondary">{item.desc}</Text>
                </List.Item>
              )}
            />
          </Card>
        </Col>
        <Col span={12}>
          <Card title="策略状态说明" size="small">
            <List
              size="small"
              dataSource={[
                { status: '草稿', color: 'default', desc: '策略正在编辑，尚未启用' },
                { status: '回测中', color: 'processing', desc: '正在进行历史数据回测验证' },
                { status: '模拟中', color: 'processing', desc: '在模拟环境运行，不产生真实交易' },
                { status: '运行中', color: 'success', desc: '实盘运行中，自动执行交易' },
                { status: '已停止', color: 'error', desc: '策略已停止，不再执行交易' },
              ]}
              renderItem={(item) => (
                <List.Item>
                  <Tag color={item.color}>{item.status}</Tag>
                  <Text type="secondary">{item.desc}</Text>
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>

      <Modal
        title={<Space><ThunderboltOutlined /> {selectedStrategy?.name}</Space>}
        open={detailVisible}
        onCancel={() => setDetailVisible(false)}
        footer={[
          <Button key="backtest" type="primary" icon={<PlayCircleOutlined />} onClick={() => { setDetailVisible(false); navigate(`/backtest?strategy=${selectedStrategy?.id}`) }}>
            立即回测
          </Button>,
          <Button key="edit" icon={<EditOutlined />} onClick={() => { setDetailVisible(false); navigate(`/strategies/${selectedStrategy?.id}`) }}>
            编辑策略
          </Button>,
          <Button key="close" onClick={() => setDetailVisible(false)}>关闭</Button>,
        ]}
        width={700}
      >
        {selectedStrategy && (
          <div>
            <Descriptions column={2} bordered size="small">
              <Descriptions.Item label="策略类型">
                <Tag color={typeColors[selectedStrategy.strategy_type]}>{typeLabels[selectedStrategy.strategy_type]}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="支持市场">
                <Space>{selectedStrategy.market_type.map(m => <Tag key={m}>{m}</Tag>)}</Space>
              </Descriptions.Item>
              <Descriptions.Item label="当前状态">
                <Tag color={statusColors[selectedStrategy.status]}>{statusLabels[selectedStrategy.status]}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="创建时间">
                {selectedStrategy.created_at.split('T')[0]}
              </Descriptions.Item>
              <Descriptions.Item label="年化收益率" span={2}>
                <Text style={{ color: selectedStrategy.收益率 > 0 ? '#f5222d' : '#52c41a', fontSize: 18, fontWeight: 'bold' }}>
                  {selectedStrategy.收益率 > 0 ? '+' : ''}{selectedStrategy.收益率.toFixed(2)}%
                </Text>
              </Descriptions.Item>
              <Descriptions.Item label="夏普比率">
                {selectedStrategy.夏普比率 > 0 ? selectedStrategy.夏普比率.toFixed(2) : '-'}
              </Descriptions.Item>
              <Descriptions.Item label="最大回撤">
                {selectedStrategy.最大回撤 > 0 ? <Text style={{ color: '#52c41a' }}>-{selectedStrategy.最大回撤.toFixed(2)}%</Text> : '-'}
              </Descriptions.Item>
              <Descriptions.Item label="策略描述" span={2}>
                {selectedStrategy.description}
              </Descriptions.Item>
            </Descriptions>
          </div>
        )}
      </Modal>
    </div>
  )
}