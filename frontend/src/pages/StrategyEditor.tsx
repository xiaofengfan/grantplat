import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card, Form, Input, Select, Button, message, Space } from 'antd'
import { SaveOutlined, ExperimentOutlined } from '@ant-design/icons'
import { strategyService } from '../services/strategyService'
import { StrategyType } from '../types'

const { TextArea } = Input

export default function StrategyEditor() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [strategyType, setStrategyType] = useState<StrategyType>('code')
  const [activeTab, setActiveTab] = useState('config')
  const isNew = !id || id === 'new'

  useEffect(() => {
    if (!isNew) {
      loadStrategy()
    }
  }, [id])

  const loadStrategy = async () => {
    try {
      const res = await strategyService.getStrategy(Number(id))
      if (res.code === 0) {
        const strategy = res.data
        form.setFieldsValue(strategy)
        setStrategyType(strategy.strategy_type)
      }
    } catch (error) {
      message.error('加载策略失败')
    }
  }

  const handleSave = async () => {
    try {
      const values = await form.validateFields()
      setLoading(true)
      if (isNew) {
        const res = await strategyService.createStrategy(values)
        if (res.code === 0) {
          message.success('策略创建成功')
          navigate(`/strategies/${res.data.id}`)
        }
      } else {
        const res = await strategyService.updateStrategy(Number(id), values)
        if (res.code === 0) {
          message.success('策略保存成功')
        }
      }
    } catch (error) {
      message.error('保存失败')
    } finally {
      setLoading(false)
    }
  }

  const handleBacktest = () => {
    navigate(`/backtest?strategy=${id}`)
  }

  const defaultCode = `import numpy as np
import pandas as pd
from typing import Dict, Any

class Strategy:
    def __init__(self, config: Dict[str, Any]):
        self.config = config
        self.position = 0

    def initialize(self, context):
        self.context = context
        context.logger.info("策略初始化")

    def on_bar(self, bar):
        symbol = bar['symbol']
        close = bar['close']

        if self.position == 0 and close > self.config.get('buy_threshold', 100):
            self.buy(symbol, 100)
            self.position = 100
        elif self.position > 0 and close < self.config.get('sell_threshold', 95):
            self.sell(symbol, self.position)
            self.position = 0

    def on_finish(self):
        pass
`

  return (
    <div>
      <Card
        title={isNew ? '新建策略' : '编辑策略'}
        tabList={[
          { key: 'config', label: '基础配置' },
          { key: 'code', label: '策略代码' },
          { key: 'backtest', label: '回测参数' },
        ]}
        activeTabKey={activeTab}
        onTabChange={setActiveTab}
        extra={
          <Space>
            <Button icon={<SaveOutlined />} onClick={handleSave} loading={loading}>保存</Button>
            {!isNew && <Button type="primary" icon={<ExperimentOutlined />} onClick={handleBacktest}>回测</Button>}
          </Space>
        }
      >
        {activeTab === 'config' && (
          <Form form={form} layout="vertical">
            <Form.Item name="name" label="策略名称" rules={[{ required: true, message: '请输入策略名称' }]}>
              <Input placeholder="请输入策略名称" />
            </Form.Item>
            <Form.Item name="description" label="策略描述">
              <TextArea rows={4} placeholder="请输入策略描述" />
            </Form.Item>
            <Form.Item name="strategy_type" label="策略类型" rules={[{ required: true }]}>
              <Select onChange={(v) => setStrategyType(v)}>
                <Select.Option value="visual">零代码拖拽</Select.Option>
                <Select.Option value="template">低代码模板</Select.Option>
                <Select.Option value="code">全代码开发</Select.Option>
              </Select>
            </Form.Item>
            <Form.Item name="market_type" label="交易市场" rules={[{ required: true }]}>
              <Select mode="multiple" placeholder="请选择交易市场">
                <Select.Option value="A">A股</Select.Option>
                <Select.Option value="HK">港股</Select.Option>
                <Select.Option value="US">美股</Select.Option>
                <Select.Option value="Futures">期货</Select.Option>
                <Select.Option value="Options">期权</Select.Option>
              </Select>
            </Form.Item>
          </Form>
        )}

        {activeTab === 'code' && (
          <div>
            <p style={{ marginBottom: 16, color: '#666' }}>
              {strategyType === 'code' ? '使用 Python 编写策略逻辑' : strategyType === 'template' ? '选择策略模板并配置参数' : '拖拽组件构建策略'}
            </p>
            {strategyType === 'code' && (
              <Form.Item name="code">
                <TextArea
                  rows={20}
                  style={{ fontFamily: 'Consolas, monospace' }}
                  defaultValue={defaultCode}
                />
              </Form.Item>
            )}
            {strategyType !== 'code' && (
              <div style={{ textAlign: 'center', padding: 60, color: '#999' }}>
                {strategyType === 'template' ? '低代码模板编辑器（待开发）' : '可视化拖拽界面（待开发）'}
              </div>
            )}
          </div>
        )}

        {activeTab === 'backtest' && (
          <div>
            <Form layout="vertical">
              <Form.Item label="初始资金" name="initial_capital" initialValue={1000000}>
                <Input type="number" suffix="元" />
              </Form.Item>
              <Form.Item label="回测开始日期" name="start_date" initialValue="2025-01-01">
                <Input type="date" />
              </Form.Item>
              <Form.Item label="回测结束日期" name="end_date" initialValue="2026-04-10">
                <Input type="date" />
              </Form.Item>
              <Form.Item label="手续费率" name="commission_rate" initialValue={0.0003}>
                <Input type="number" suffix="%" />
              </Form.Item>
              <Form.Item label="滑点率" name="slippage_rate" initialValue={0.0001}>
                <Input type="number" suffix="%" />
              </Form.Item>
            </Form>
          </div>
        )}
      </Card>
    </div>
  )
}
