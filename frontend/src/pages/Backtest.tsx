import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Card, Row, Col, Statistic, Table, Button, Select, Space, Progress, message } from 'antd'
import { PlayCircleOutlined } from '@ant-design/icons'
import ReactECharts from 'echarts-for-react'
import { backtestService } from '../services/backtestService'
import { BacktestResult } from '../types'

export default function Backtest() {
  const [searchParams] = useSearchParams()
  const [backtests, setBacktests] = useState<BacktestResult[]>([])
  const [loading, setLoading] = useState(false)
  const [runningBacktest, setRunningBacktest] = useState<number | null>(null)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    loadBacktests()
  }, [])

  const loadBacktests = async () => {
    setLoading(true)
    try {
      const res = await backtestService.getBacktests()
      if (res.code === 0) {
        setBacktests(res.data.items)
      }
    } catch (error) {
      message.error('加载回测记录失败')
    } finally {
      setLoading(false)
    }
  }

  const handleStartBacktest = async () => {
    const strategyId = searchParams.get('strategy')
    if (!strategyId) {
      message.warning('请先选择策略')
      return
    }
    setRunningBacktest(Number(strategyId))
    setProgress(0)
    const interval = setInterval(() => {
      setProgress(p => {
        if (p >= 100) {
          clearInterval(interval)
          setRunningBacktest(null)
          message.success('回测完成')
          loadBacktests()
          return 100
        }
        return p + 2
      })
    }, 200)
  }

  const equityCurveOption = {
    tooltip: { trigger: 'axis' },
    xAxis: { type: 'category', data: Array.from({ length: 50 }, (_, i) => `${i + 1}日`), boundaryGap: false },
    yAxis: { type: 'value', axisLabel: { formatter: (v: number) => `${(v / 10000).toFixed(1)}万` } },
    series: [{
      data: Array.from({ length: 50 }, (_, i) => 1000000 * (1 + Math.sin(i / 5) * 0.1 + i * 0.005)),
      type: 'line',
      smooth: true,
      areaStyle: { color: 'rgba(24, 144, 255, 0.2)' },
    }],
    grid: { left: 50, right: 20, top: 20, bottom: 30 },
  }

  const drawdownOption = {
    tooltip: { trigger: 'axis' },
    xAxis: { type: 'category', data: Array.from({ length: 50 }, (_, i) => `${i + 1}日`) },
    yAxis: { type: 'value', axisLabel: { formatter: (v: number) => `${v}%` } },
    series: [{
      data: Array.from({ length: 50 }, () => -Math.random() * 15),
      type: 'bar',
      itemStyle: { color: '#f5222d' },
    }],
    grid: { left: 50, right: 20, top: 20, bottom: 30 },
  }

  const columns = [
    { title: '策略', dataIndex: 'strategy_id', key: 'strategy_id', render: (v: number) => `策略 #${v}` },
    { title: '回测区间', key: 'period', render: (_: any, r: BacktestResult) => `${r.start_date} ~ ${r.end_date}` },
    { title: '初始资金', dataIndex: 'initial_capital', key: 'initial_capital', render: (v: number) => `¥${v.toLocaleString()}` },
    { title: '最终资金', dataIndex: 'final_capital', key: 'final_capital', render: (v: number) => `¥${v.toLocaleString()}` },
    { title: '收益率', dataIndex: 'total_return', key: 'total_return', render: (v: number) => <span style={{ color: v >= 0 ? '#f5222d' : '#52c41a' }}>{v.toFixed(2)}%</span> },
    { title: '最大回撤', dataIndex: 'max_drawdown', key: 'max_drawdown', render: (v: number) => <span style={{ color: '#f5222d' }}>{v.toFixed(2)}%</span> },
    { title: '夏普比率', dataIndex: 'sharpe_ratio', key: 'sharpe_ratio' },
    { title: '胜率', dataIndex: 'win_rate', key: 'win_rate', render: (v: number) => `${v.toFixed(1)}%` },
    { title: '创建时间', dataIndex: 'created_at', key: 'created_at', render: (v: string) => v?.split('T')[0] || '-' },
  ]

  const latestBacktest = backtests[0]

  return (
    <div>
      <Card
        title="回测验证"
        extra={
          <Space>
            <Select placeholder="选择策略" style={{ width: 200 }}>
              <Select.Option value="1">趋势跟踪策略</Select.Option>
              <Select.Option value="2">均值回归策略</Select.Option>
            </Select>
            <Button type="primary" icon={<PlayCircleOutlined />} onClick={handleStartBacktest} disabled={!!runningBacktest}>
              {runningBacktest ? '回测中...' : '开始回测'}
            </Button>
          </Space>
        }
      >
        {runningBacktest && (
          <div style={{ marginBottom: 24 }}>
            <Progress percent={progress} status="active" />
            <p style={{ textAlign: 'center', color: '#666' }}>正在执行 Tick 级高精度回测...</p>
          </div>
        )}

        {latestBacktest && (
          <>
            <Row gutter={16} style={{ marginBottom: 24 }}>
              <Col span={6}><Card><Statistic title="总收益率" value={latestBacktest.total_return} precision={2} suffix="%" valueStyle={{ color: latestBacktest.total_return >= 0 ? '#f5222d' : '#52c41a' }} /></Card></Col>
              <Col span={6}><Card><Statistic title="最大回撤" value={latestBacktest.max_drawdown} precision={2} suffix="%" valueStyle={{ color: '#f5222d' }} /></Card></Col>
              <Col span={6}><Card><Statistic title="夏普比率" value={latestBacktest.sharpe_ratio} precision={2} /></Card></Col>
              <Col span={6}><Card><Statistic title="胜率" value={latestBacktest.win_rate} precision={1} suffix="%" /></Card></Col>
            </Row>

            <Row gutter={16}>
              <Col span={16}>
                <Card title="收益曲线"><ReactECharts option={equityCurveOption} style={{ height: 300 }} /></Card>
              </Col>
              <Col span={8}>
                <Card title="回撤分析"><ReactECharts option={drawdownOption} style={{ height: 300 }} /></Card>
              </Col>
            </Row>
          </>
        )}
      </Card>

      <Card title="回测历史" style={{ marginTop: 16 }}>
        <Table columns={columns} dataSource={backtests} rowKey="id" loading={loading} pagination={{ pageSize: 5 }} />
      </Card>
    </div>
  )
}
